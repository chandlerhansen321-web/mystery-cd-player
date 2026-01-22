// Mystery CD Player - Backend Server
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// In-memory database (will use a proper DB in production)
// For Vercel/serverless, this will be stored in Vercel KV or similar
let cdsDatabase = {};

// API Routes

// Get a CD by code
app.get('/api/cd/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    const cd = cdsDatabase[code];

    if (cd) {
        res.json({ success: true, cd: cd });
    } else {
        res.status(404).json({ success: false, message: 'CD not found' });
    }
});

// Create a new CD
app.post('/api/cd', (req, res) => {
    const { code, title, message, tracks } = req.body;

    if (!code || !title || !tracks) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const upperCode = code.toUpperCase();

    // Check if code already exists
    if (cdsDatabase[upperCode]) {
        return res.status(409).json({ success: false, message: 'Code already exists' });
    }

    // Store the CD
    cdsDatabase[upperCode] = {
        title: title,
        message: message || '',
        tracks: tracks,
        createdAt: new Date().toISOString()
    };

    console.log(`CD created: ${upperCode} - "${title}"`);

    res.json({ success: true, code: upperCode });
});

// Get all CDs (for debugging - remove in production)
app.get('/api/cds', (req, res) => {
    const cdCount = Object.keys(cdsDatabase).length;
    res.json({ success: true, count: cdCount, codes: Object.keys(cdsDatabase) });
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', cds: Object.keys(cdsDatabase).length });
});

app.listen(PORT, () => {
    console.log(`Mystery CD Player server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to use the app`);
});

module.exports = app;
