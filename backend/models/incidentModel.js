const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    location: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    aiAnalysis: { type: String, default: '' },
    blockchainHash: { type: String, default: '' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reporterName: { type: String },
    datetime: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
