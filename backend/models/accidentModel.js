const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    peopleInvolved: { type: Number, default: 1 },
    injuriesReported: { type: Boolean, default: false },
    location: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    blockchainHash: { type: String, default: '' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reporterName: { type: String },
    datetime: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Accident', accidentSchema);
