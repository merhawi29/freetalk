const Room = require("../models/Room");
const Message = require("../models/Message");
const User = require("../models/User");

// Create a room (Group or Direct)
const createRoom = async (req, res) => {
    try {
        const { name, roomId, type = 'group', isPublic = true, invitees = [] } = req.body;
        const userId = req.user ? req.user.userId : null; // Authenticated user ID

        // For direct chats, ensure unique roomId based on participants
        if (type === 'direct') {
            // Logic to check if direct chat already exists could go here
        }

        const newRoom = new Room({
            name,
            roomId,
            type,
            isPublic,
            owner: userId,
            participants: userId ? [userId] : [],
            invitations: invitees
        });

        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Room ID already exists" });
        }
        res.status(500).json({ message: "Error creating room", error: error.message });
    }
};

// Get Rooms (Public + Joined + Invited)
const getRooms = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : null;
        let query = { isPublic: true };

        if (userId) {
            query = {
                $or: [
                    { isPublic: true },
                    { participants: userId },
                    { invitations: userId },
                    { owner: userId }
                ]
            };
        }

        const rooms = await Room.find(query)
            .populate('owner', 'username')
            .sort({ updatedAt: -1 });

        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: "Error fetching rooms", error: error.message });
    }
};

// Get a single room by ID or RoomID string
const getRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findOne({ roomId: id });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: "Error fetching room", error: error.message });
    }
}

const { getIo } = require("../socket/socket");

// Invite User to Room
const inviteUser = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId } = req.body; // User ID to invite

        const room = await Room.findOne({ roomId });
        if (!room) return res.status(404).json({ message: "Room not found" });

        // Check ownership/permissions (basic check: only owner can invite for now)
        if (room.owner && room.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to invite" });
        }

        if (!room.invitations.includes(userId) && !room.participants.includes(userId)) {
            room.invitations.push(userId);
            await room.save();

            // Emit socket event
            try {
                getIo().to(userId).emit("invitation_received", {
                    roomId: room.roomId,
                    name: room.name,
                    inviter: req.user.username // Assuming auth middleware adds username
                });
            } catch (e) {
                console.error("Socket emit failed", e);
            }
        }

        res.json({ message: "Invitation sent", room });
    } catch (error) {
        res.status(500).json({ message: "Error inviting user", error: error.message });
    }
};

// Get Messages for a Room
const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findOne({ roomId }); // Find by string ID

        if (!room) return res.status(404).json({ message: "Room not found" });

        // Optional: Check if user is participant/public access

        const messages = await Message.find({ roomId: room._id })
            .populate("sender", "username isAnonymous")
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error: error.message });
    }
};

const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.userId;

        const room = await Room.findOne({ roomId });
        if (!room) return res.status(404).json({ message: "Room not found" });

        if (!room.isPublic && !room.invitations.includes(userId) && room.owner.toString() !== userId) {
            return res.status(403).json({ message: "Private room. Invitation required." });
        }

        if (!room.participants.includes(userId)) {
            room.participants.push(userId);
            // Remove from invitations if present
            room.invitations = room.invitations.filter(id => id.toString() !== userId);
            await room.save();
        }

        res.json({ message: "Joined room successfully", room });

    } catch (error) {
        res.status(500).json({ message: "Error joining room", error: error.message });
    }
}

module.exports = { createRoom, getRooms, getRoom, inviteUser, getMessages, joinRoom };
