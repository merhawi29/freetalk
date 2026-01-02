const Room = require("../models/Room");
const Message = require("../models/Message");
const User = require("../models/User");
const { getIo } = require("../socket/socket");

const SYSTEM_ROOMS = ["stress", "career", "relationships", "random"];

const ensureRoomExists = async (roomId) => {
    if (!SYSTEM_ROOMS.includes(roomId)) return;

    let room = await Room.findOne({ roomId });
    if (!room) {
        console.log(`Ensuring system room [${roomId}] exists... creating now.`);
        room = new Room({
            name: roomId.charAt(0).toUpperCase() + roomId.slice(1),
            roomId: roomId,
            type: 'group',
            isPublic: true,
            participants: []
        });
        await room.save();
    }
    return room;
};

const createRoom = async (req, res) => {
    try {
        const { name, roomId, type = 'group', isPublic = true, invitees = [] } = req.body;
        const userId = req.user ? req.user._id : null;

        console.log(`Create Room Request: Name=[${name}], ID=[${roomId}], User=[${userId}]`);

        if (!name || !roomId) {
            return res.status(400).json({ message: "Room name and ID are required" });
        }

        // Check for duplicate names (case-insensitive, escaping special chars)
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingName = await Room.findOne({ name: { $regex: new RegExp(`^${escapedName}$`, "i") } });

        if (existingName) {
            console.log(`Create Room Failed: Name [${name}] taken`);
            return res.status(400).json({ message: "A room with this name already exists" });
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

        console.log(`Saving new room...`);
        const savedRoom = await newRoom.save();
        console.log(`Room [${name}] created successfully!`);
        getIo().emit("rooms_updated"); // Broadcast to all
        res.status(201).json(savedRoom);
    } catch (error) {
        console.error("CRITICAL: Create Room Error Detail:", error);
        if (error.code === 11000) {
            const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : "field";
            return res.status(400).json({ message: `Room ${field} already exists` });
        }
        res.status(500).json({ message: "Error creating room", error: error.message });
    }
};

// Get Rooms (Public + Joined + Invited)
const getRooms = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
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

// Get a single room by RoomID string
const getRoom = async (req, res) => {
    try {
        const { id } = req.params; // Expect roomId string
        const room = await Room.findOne({ roomId: id }).populate('owner', 'username');
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: "Error fetching room", error: error.message });
    }
}

// Invite User to Room
const inviteUser = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId } = req.body; // User ID to invite

        if (userId.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot invite yourself" });
        }

        await ensureRoomExists(roomId);
        const room = await Room.findOne({ roomId });
        if (!room) {
            console.log(`Invite failed: Room [${roomId}] not found`);
            return res.status(404).json({ message: "Room not found" });
        }

        // Check ownership/permissions
        console.log(`Invite Debug: Room[${roomId}] OwnerID: ${room.owner}, InviterID: ${req.user._id}`);

        if (room.owner && room.owner.toString() !== req.user._id.toString()) {
            console.warn(`Invite failed: User ${req.user._id} is NOT the owner of ${roomId}`);
            return res.status(403).json({ message: "Only the room owner can invite others" });
        }

        const isInvited = room.invitations.some(id => id.toString() === userId.toString());
        const isParticipant = room.participants.some(id => id.toString() === userId.toString());

        console.log(`Invite Debug: Target: ${userId}, isInvited: ${isInvited}, isParticipant: ${isParticipant}`);

        let statusMessage = "Invitation sent successfully!";
        if (isParticipant) {
            statusMessage = "User is already a participant in this room";
        } else if (isInvited) {
            statusMessage = "Invitation re-sent (user already invited)";
        } else {
            room.invitations.push(userId);
            await room.save();
        }

        // ALWAYS emit socket event when invited/re-sent
        try {
            console.log(`Invite Debug: Emitting invitation_received to socket room [${userId}]`);
            getIo().to(userId.toString()).emit("invitation_received", {
                roomId: room.roomId,
                name: room.name,
                inviter: req.user.username,
                inviterId: req.user._id
            });
        } catch (e) {
            console.error("Socket emit failed", e);
        }

        res.json({ message: statusMessage, room });
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
        const userId = req.user._id;

        await ensureRoomExists(roomId);
        const room = await Room.findOne({ roomId });
        if (!room) return res.status(404).json({ message: "Room not found" });

        const isInvited = room.invitations.some(id => id.toString() === userId.toString());
        const isParticipant = room.participants.some(id => id.toString() === userId.toString());
        const isOwner = room.owner && room.owner.toString() === userId.toString();

        if (!room.isPublic && !isInvited && !isOwner) {
            return res.status(403).json({ message: "Private room. Invitation required." });
        }

        if (!isParticipant) {
            room.participants.push(userId);
            // Remove from invitations if present
            room.invitations = room.invitations.filter(id => id.toString() !== userId.toString());
            await room.save();
        }

        res.json({ message: "Joined room successfully", room });

    } catch (error) {
        res.status(500).json({ message: "Error joining room", error: error.message });
    }
}

const getRoomStats = (req, res) => {
    try {
        const io = getIo();
        const categories = ["stress", "career", "relationships", "random"];
        const stats = {};
        categories.forEach(cat => {
            const room = io.sockets.adapter.rooms.get(cat);
            stats[cat] = room ? room.size : 0;
        });
        res.json(stats);
    } catch (error) {
        console.error("Error fetching room stats:", error);
        res.status(500).json({ message: "Error fetching stats" });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const room = await Room.findOne({ roomId });
        if (!room) return res.status(404).json({ message: "Room not found" });

        // Only owner can delete custom rooms
        console.log(`Delete Debug: Room Owner=[${room.owner}], User=[${userId}]`);
        if (!room.owner || room.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only the room owner can delete this room" });
        }

        // Delete messages associated with the room
        await Message.deleteMany({ roomId: room._id });

        // Delete the room
        await Room.deleteOne({ _id: room._id });

        console.log(`Room [${room.name}] deleted by owner: ${userId}`);
        getIo().emit("rooms_updated"); // Broadcast to all
        res.json({ message: "Room and all messages deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting room", error: error.message });
    }
};

module.exports = { createRoom, getRooms, getRoom, inviteUser, getMessages, joinRoom, getRoomStats, deleteRoom };
