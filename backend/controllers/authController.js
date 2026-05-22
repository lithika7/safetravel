const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Simulated blockchain ID — SHA256 hash of username + timestamp + random salt
const generateBlockchainId = (username) => {
    const raw = `${username}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
    return 'BLK-' + crypto.createHash('sha256').update(raw).digest('hex').toUpperCase().slice(0, 32);
};

const register = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (await User.findOne({ username }))
            return res.status(400).json({ message: 'Username already taken' });

        const hashed = await bcrypt.hash(password, 10);
        const blockchainId = generateBlockchainId(username);
        const user = await User.create({
            username,
            password: hashed,
            blockchainId,
            activityLog: [{ type: 'login', message: 'Account created & identity registered on blockchain' }]
        });

        res.status(201).json({
            token: generateToken(user._id),
            username: user.username,
            blockchainId: user.blockchainId
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        await User.findByIdAndUpdate(user._id, {
            $push: { activityLog: { type: 'login', message: 'User logged in' } }
        });

        res.json({
            token: generateToken(user._id),
            username: user.username,
            blockchainId: user.blockchainId
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const saveSOS = async (req, res) => {
    const { latitude, longitude } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $push: {
                    sosAlerts: { latitude, longitude },
                    activityLog: {
                        type: 'sos',
                        message: '🚨 SOS alert triggered',
                        latitude,
                        longitude
                    }
                }
            },
            { new: true }
        );
        res.json({ message: 'SOS alert saved', sosAlerts: user.sosAlerts });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const logActivity = async (req, res) => {
    const { type, message, latitude, longitude } = req.body;
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $push: { activityLog: { type, message, latitude, longitude } }
        });
        res.json({ message: 'Activity logged' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, saveSOS, logActivity, getProfile };
