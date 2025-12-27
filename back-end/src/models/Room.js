const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        roomId: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ['group', 'direct'],
            default: 'group'
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        invitations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
