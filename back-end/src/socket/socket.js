const { Server } = require("socket.io");

let io;
const userSocketMap = {}; // userId -> socketId
const activeInvitations = {}; // requestId -> { from, to, roomId }

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`Socket Connected: ${socket.id}`);

        // Helper to broadcast participants in a room
        const broadcastParticipants = async (roomId) => {
            if (!roomId) return;
            const sockets = await io.in(roomId).fetchSockets();
            const participants = sockets.map(s => ({
                socketId: s.id,
                userId: s.userId,
                username: s.username || "Anonymous",
                isInCall: s.isInCall || false,
                mood: s.mood || ""
            }));
            io.to(roomId).emit("room_participants", participants);
            io.to(roomId).emit("room_user_count", participants.length);
        };

        socket.on("register-user", ({ userId, username }) => {
            console.log(`Socket Register: User [${username}] ID [${userId}] to Socket [${socket.id}]`);
            userSocketMap[userId] = socket.id;

            // Store details on socket for easy access
            socket.userId = userId;
            socket.username = username;

            if (userId) {
                socket.join(userId.toString());
            }

            socket.emit("registration_complete", { socketId: socket.id });
        });

        socket.on("join_room", async (roomId) => {
            // Leave previous rooms (except their personal ID room)
            const currentRooms = Array.from(socket.rooms);
            for (const room of currentRooms) {
                if (room !== socket.id && room !== socket.userId?.toString()) {
                    socket.leave(room);
                    // Broadcast to previous room that we left
                    await broadcastParticipants(room);
                }
            }

            console.log(`Socket Join: Socket [${socket.id}] joining room [${roomId}]`);
            socket.join(roomId);
            socket.currentRoom = roomId;

            await broadcastParticipants(roomId);
        });

        socket.on("disconnecting", async () => {
            const rooms = Array.from(socket.rooms);
            for (const room of rooms) {
                if (room !== socket.id && room !== socket.userId?.toString()) {
                    // Update participants for others in the room before we are fully gone
                    // We use a small delay or set a flag to handle the "fetchSockets" correctly
                }
            }
        });

        socket.on("disconnect", async () => {
            console.log(`Socket Disconnected: ${socket.id}`);
            if (socket.userId && userSocketMap[socket.userId] === socket.id) {
                delete userSocketMap[socket.userId];
            }
            if (socket.currentRoom) {
                await broadcastParticipants(socket.currentRoom);
            }
        });

        // --- WebRTC signaling ---
        socket.on("webrtc:signal", ({ to, from, signal }) => {
            const targetSocketId = userSocketMap[to] || to;
            console.log(`WebRTC Signal: ${from} -> ${to} (Target: ${targetSocketId}) Type: ${signal.type}`);
            io.to(targetSocketId).emit("webrtc:signal", {
                from,
                fromSocketId: socket.id,
                signal
            });
        });

        // --- Video Call Handlers ---
        socket.on("video-call:request", ({ to, from, roomId }) => {
            const targetSocketId = userSocketMap[to];
            const requestId = `req_${Date.now()}`;
            console.log(`Video Call Request: ${from} -> ${to} (Target: ${targetSocketId})`);

            if (targetSocketId) {
                activeInvitations[requestId] = { from, to, roomId };
                io.to(targetSocketId).emit("video-call:received", {
                    from,
                    fromSocketId: socket.id,
                    roomId,
                    requestId
                });

                // 30 second timeout for the call
                setTimeout(() => {
                    if (activeInvitations[requestId]) {
                        console.log(`Video Call Timeout: ${requestId}`);
                        delete activeInvitations[requestId];
                        socket.emit("video-call:timeout", { to });
                        io.to(targetSocketId).emit("video-call:timeout-received");
                    }
                }, 30000);
            }
        });

        socket.on("video-call:accept", ({ to, from, roomId, requestId }) => {
            console.log(`Video Call Accepted: ${from} -> ${to}`);
            delete activeInvitations[requestId];

            // Set in-call status for both participants
            socket.isInCall = true;
            const targetSocketId = userSocketMap[to];
            if (targetSocketId) {
                const targetSocket = io.sockets.sockets.get(targetSocketId);
                if (targetSocket) targetSocket.isInCall = true;

                io.to(targetSocketId).emit("video-call:accepted", {
                    from,
                    fromSocketId: socket.id
                });
            }
            // Broadcast status change
            if (socket.currentRoom) broadcastParticipants(socket.currentRoom);
        });

        socket.on("video-call:reject", ({ to, from, roomId, requestId }) => {
            console.log(`Video Call Rejected: ${from} -> ${to}`);
            delete activeInvitations[requestId];
            const targetSocketId = userSocketMap[to];
            if (targetSocketId) {
                io.to(targetSocketId).emit("video-call:rejected", { from });
            }
        });

        socket.on("video-call:hangup", ({ roomId, from }) => {
            console.log(`Video Call Hangup: ${from} in ${roomId || 'private'}`);

            socket.isInCall = false;
            // Note: In private calls, the other user's socket is harder to find here without a room, 
            // but we can broadcast to the room if available.

            if (roomId) {
                socket.to(roomId).emit("video-call:hungup", { from, fromSocketId: socket.id });
                broadcastParticipants(roomId);
            } else {
                socket.broadcast.emit("video-call:hungup", { from, fromSocketId: socket.id });
                // If it's a private call not in a room context, we'd need to find the specific peer.
                // For now, let's assume we are always in a room context for participant visibility.
            }
        });

        // --- Presence Events ---
        socket.on("typing", ({ roomId, isTyping }) => {
            if (roomId) {
                socket.to(roomId).emit("user_typing", { userId: socket.userId, isTyping });
            }
        });

        socket.on("update-mood", ({ roomId, mood }) => {
            socket.mood = mood;
            if (roomId) {
                broadcastParticipants(roomId);
            }
        });

        // --- Group Video ---
        socket.on("group-video:join", (roomId) => {
            console.log(`Group Video Join: ${socket.id} in ${roomId}`);
            socket.join(roomId);
            socket.to(roomId).emit("group-video:user-joined", {
                userId: socket.id,
                socketId: socket.id
            });
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
