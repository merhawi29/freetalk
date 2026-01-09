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

        socket.on("register-user", ({ userId, username }) => {
            console.log(`Socket Register: User [${username}] ID [${userId}] to Socket [${socket.id}]`);
            userSocketMap[userId] = socket.id;

            // Join a room named after the userId to allow targeting by database ID
            if (userId) {
                socket.join(userId.toString());
            }
            socket.on("disconnect", () => {
                console.log(`Socket Disconnected: ${socket.id}`);
                if (userSocketMap[userId] === socket.id) {
                    delete userSocketMap[userId];
                }
            });
        });

        socket.on("join_room", (roomId) => {
            console.log(`Socket Join: Socket [${socket.id}] joining room [${roomId}]`);
            socket.join(roomId);
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
            const targetSocketId = userSocketMap[to];
            if (targetSocketId) {
                io.to(targetSocketId).emit("video-call:accepted", {
                    from,
                    fromSocketId: socket.id
                });
            }
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
            if (roomId) {
                socket.to(roomId).emit("video-call:hungup", { from, fromSocketId: socket.id });
            } else {
                socket.broadcast.emit("video-call:hungup", { from, fromSocketId: socket.id });
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
