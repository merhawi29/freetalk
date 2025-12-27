const express = require("express");
const { createRoom, getRooms, getRoom, inviteUser, getMessages, joinRoom } = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware"); // Ensure we have this, or make optional

const router = express.Router();

// Public routes (or handle auth inside controller if mixed)
router.get("/", protect, getRooms); // Auth to see private rooms
router.get("/:id", getRoom);
router.get("/:roomId/messages", getMessages);

// Protected routes
router.post("/", protect, createRoom);
router.post("/:roomId/invite", protect, inviteUser);
router.post("/:roomId/join", protect, joinRoom);


module.exports = router;
