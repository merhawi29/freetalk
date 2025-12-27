
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
        },
        password: {
            type: String,
            required: false,
        },
        profilePic: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        isAnonymous: {
            type: Boolean,
            default: false,
        },
        socketId: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
