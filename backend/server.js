require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

connectDB();

const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:5500', 'http://127.0.0.1:5500', 'null'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => res.json({ message: 'SafeTravel API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
