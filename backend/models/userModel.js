const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 4
    },
    sosAlerts: [
        {
            triggeredAt: { type: Date, default: Date.now },
            latitude: Number,
            longitude: Number
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
