// Get a CD by code - Vercel Serverless Function backed by Vercel Blob
import { getCD } from '../_storage.js';

export default async function handler(req, res) {
    // Enable CORS (no Allow-Credentials: it is invalid with a * origin and unused)
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

    // Same charset rule as the create endpoint — the code becomes the blob
    // list prefix cds/<code>.json, so reject anything else before it gets there.
    if (typeof code !== 'string' || !/^[a-zA-Z0-9]{1,12}$/.test(code)) {
        return res.status(400).json({ success: false, message: 'Invalid code' });
    }

    const cd = await getCD(code);

    if (cd) {
        res.status(200).json({ success: true, cd: cd });
    } else {
        res.status(404).json({ success: false, message: 'CD not found' });
    }
}
