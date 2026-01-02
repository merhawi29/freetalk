const Message = require("../models/Message");
const Room = require("../models/Room");
const User = require("../models/User");
const { getIo } = require("../socket/socket");

// @desc    Send a message to a room
// @route   POST /api/messages
// @access  Public
const sendMessage = async (req, res) => {
    const { roomId, senderId, content } = req.body;

    if (!roomId || !senderId || !content) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Find the room by its custom roomId (string)
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if sender exists
        const user = await User.findById(senderId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newMessage = await Message.create({
            roomId: room._id,
            sender: senderId,
            content,
        });

        // Populate sender details for the response
        await newMessage.populate("sender", "username");

        // Emit socket event
        try {
            const io = getIo();
            console.log(`Message Debug: Emitting to room [${roomId}]`);
            io.to(roomId).emit("receive_message", newMessage);
        } catch (e) {
            console.error("Socket emit failed:", e);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all messages for a specific room
// @route   GET /api/messages/:roomId
// @access  Public
const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find the room by its custom roomId
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const messages = await Message.find({ roomId: room._id })
            .populate("sender", "username isAnonymous") // Populate sender details
            .sort({ createdAt: 1 }); // Oldest first

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { sendMessage, getMessages };
