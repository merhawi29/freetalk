const User = require("../models/User");
const { generateToken } = require("./authController");

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username taken" });
        }

        const newUser = await User.create({
            username,
            isAnonymous: true,
        });

        res.status(201).json({
            ...newUser.toObject(),
            token: generateToken(newUser._id)
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get User by ID
// @route   GET /api/users/:id
// @access  Public
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}

module.exports = { createUser, getUser };
