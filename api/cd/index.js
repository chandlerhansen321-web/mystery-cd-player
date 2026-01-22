// Create a new CD - Vercel Serverless Function with KV
import { getCD, saveCD } from '../_storage.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { code, title, message, tracks } = req.body;

    if (!code || !title || !tracks) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if code already exists
    const existingCD = await getCD(code);
    if (existingCD) {
        return res.status(409).json({ success: false, message: 'Code already exists' });
    }

    // Store the CD
    const cdData = {
        title: title,
        message: message || '',
        tracks: tracks,
        createdAt: new Date().toISOString()
    };

    const saved = await saveCD(code, cdData);

    if (saved) {
        console.log(`CD created: ${code.toUpperCase()} - "${title}"`);
        res.status(200).json({ success: true, code: code.toUpperCase() });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save CD' });
    }
}
