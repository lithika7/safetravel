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
    blockchainId: {
        type: String,
        unique: true
    },
    sosAlerts: [
        {
            triggeredAt: { type: Date, default: Date.now },
            latitude: Number,
            longitude: Number
        }
    ],
    activityLog: [
        {
            type: { type: String },  // 'login', 'sos', 'location_check', 'danger_zone'
            message: String,
            latitude: Number,
            longitude: Number,
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
