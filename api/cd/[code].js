// Get a CD by code - Vercel Serverless Function
import { getCD } from '../_storage.js';

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { code } = req.query;
    const cd = getCD(code);

    if (cd) {
        res.status(200).json({ success: true, cd: cd });
    } else {
        res.status(404).json({ success: false, message: 'CD not found' });
    }
}
