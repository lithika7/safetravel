const crypto = require('crypto');
const Incident = require('../models/incidentModel');
const Accident = require('../models/accidentModel');

const generateBlockchainHash = (data) =>
    'TX-' + crypto.createHash('sha256').update(JSON.stringify(data) + Date.now()).digest('hex').toUpperCase().slice(0, 24);

// ===== INCIDENTS =====
const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find().sort({ datetime: -1 }).limit(20);
        res.json(incidents);
    } catch { res.status(500).json({ message: 'Server error' }); }
};

const createIncident = async (req, res) => {
    const { title, description, severity, location, imageUrl, datetime } = req.body;
    try {
        const blockchainHash = generateBlockchainHash({ title, description, severity, location });
        const aiAnalysis = generateAIAnalysis(severity, description);
        const incident = await Incident.create({
            title, description, severity, location, imageUrl,
            datetime: datetime || Date.now(),
            blockchainHash, aiAnalysis,
            reportedBy: req.user.id,
            reporterName: req.user.username
        });
        res.status(201).json(incident);
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Simulated AI analysis based on severity + keywords
const generateAIAnalysis = (severity, description) => {
    const desc = description.toLowerCase();
    let risk = severity === 'High' ? 'HIGH RISK' : severity === 'Medium' ? 'MODERATE RISK' : 'LOW RISK';
    let advice = 'Monitor the situation.';
    if (desc.includes('rain') || desc.includes('flood')) advice = 'Avoid low-lying areas. Seek shelter immediately.';
    else if (desc.includes('fire')) advice = 'Evacuate the area. Contact fire services: 101.';
    else if (desc.includes('theft') || desc.includes('robbery')) advice = 'Contact police immediately: 100.';
    else if (desc.includes('accident')) advice = 'Contact medical emergency: 108. Avoid the area.';
    else if (severity === 'High') advice = 'High severity detected. Alert authorities immediately.';
    return `AI Assessment: ${risk}. ${advice}`;
};

// ===== ACCIDENTS =====
const getAccidents = async (req, res) => {
    try {
        const accidents = await Accident.find().sort({ datetime: -1 }).limit(20);
        res.json(accidents);
    } catch { res.status(500).json({ message: 'Server error' }); }
};

const createAccident = async (req, res) => {
    const { title, description, peopleInvolved, injuriesReported, location, imageUrl, datetime } = req.body;
    try {
        const blockchainHash = generateBlockchainHash({ title, description, location, peopleInvolved });
        const accident = await Accident.create({
            title, description, peopleInvolved, injuriesReported, location, imageUrl,
            datetime: datetime || Date.now(),
            blockchainHash,
            reportedBy: req.user.id,
            reporterName: req.user.username
        });
        res.status(201).json(accident);
    } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getIncidents, createIncident, getAccidents, createAccident };
