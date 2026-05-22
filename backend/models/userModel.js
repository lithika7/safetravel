const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    fullName: { type: String, trim: true, default: '' },
    mobile: { type: String, default: '' },
    role: { type: String, enum: ['Tourist', 'Admin', 'Data Provider'], default: 'Tourist' },
    password: { type: String, required: true, minlength: 4 },
    blockchainId: { type: String, unique: true, sparse: true },
    sosAlerts: [{
        triggeredAt: { type: Date, default: Date.now },
        latitude: Number,
        longitude: Number
    }],
    activityLog: [{
        type: { type: String },
        message: String,
        latitude: Number,
        longitude: Number,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
