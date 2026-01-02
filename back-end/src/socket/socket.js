const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Allow all origins for dev; restrict in prod
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            socket.join(userId);
            console.log(`User Connected: ${socket.id} (User ID: ${userId})`);
        } else {
            console.log(`User Connected: ${socket.id} (Anonymous)`);
        }

        // Explicit join for robustness
        socket.on("join_id", (id) => {
            if (id) {
                socket.join(id);
                console.log(`Socket ${socket.id} explicitly joined ID room: ${id}`);
            }
        });

        // Helper to emit stats
        const emitStats = () => {
            const categories = ["stress", "career", "relationships", "random"];
            const stats = {};
            categories.forEach(cat => {
                const room = io.sockets.adapter.rooms.get(cat);
                stats[cat] = room ? room.size : 0;
            });
            io.emit("room_stats_update", stats);
        };

        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            console.log(`User with ID: ${socket.id} joined room: ${roomId}`);

            // Emit count to specific room
            const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
            io.to(roomId).emit("room_user_count", roomSize);

            emitStats();
        });

        socket.on("disconnecting", () => {
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    // User is leaving, count will decrease
                    const count = (io.sockets.adapter.rooms.get(room)?.size || 0) - 1;
                    io.to(room).emit("room_user_count", count > 0 ? count : 0);
                }
            }
        });

        socket.on("disconnect", () => {
            console.log("User Disconnected", socket.id);
            emitStats();
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
