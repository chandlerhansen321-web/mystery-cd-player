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

    const { code, title, message, tracks } = req.body || {};

    if (!code || !title || !tracks) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Abuse caps — public create endpoint backed by Vercel Blob, so bound every
    // cost lever and validate `code` (it becomes the blob key cds/<code>.json, so
    // the charset check also blocks path traversal / key escape).
    if (typeof code !== 'string' || !/^[a-zA-Z0-9]{1,12}$/.test(code)) {
        return res.status(400).json({ success: false, message: 'Invalid code' });
    }
    if (typeof title !== 'string' || title.length > 200) {
        return res.status(400).json({ success: false, message: 'Invalid title' });
    }
    if (message != null && (typeof message !== 'string' || message.length > 2000)) {
        return res.status(400).json({ success: false, message: 'Invalid message' });
    }
    if (!Array.isArray(tracks) || tracks.length === 0 || tracks.length > 20) {
        return res.status(400).json({ success: false, message: 'Invalid tracks' });
    }
    if (JSON.stringify(req.body).length > 50000) {
        return res.status(413).json({ success: false, message: 'Payload too large' });
    }

    // Validate each track and rebuild it with only the known fields — this CD is
    // served back verbatim to everyone who loads the code, so never store
    // arbitrary caller-supplied objects.
    const cleanTracks = [];
    for (const track of tracks) {
        if (typeof track !== 'object' || track === null) {
            return res.status(400).json({ success: false, message: 'Invalid track' });
        }
        if (typeof track.videoId !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(track.videoId)) {
            return res.status(400).json({ success: false, message: 'Invalid track videoId' });
        }
        if (typeof track.title !== 'string' || track.title.length === 0 || track.title.length > 300) {
            return res.status(400).json({ success: false, message: 'Invalid track title' });
        }
        if (typeof track.channel !== 'string' || track.channel.length > 300) {
            return res.status(400).json({ success: false, message: 'Invalid track channel' });
        }
        if (track.thumbnail != null && (typeof track.thumbnail !== 'string' ||
            track.thumbnail.length > 500 || !track.thumbnail.startsWith('https://'))) {
            return res.status(400).json({ success: false, message: 'Invalid track thumbnail' });
        }
        cleanTracks.push({
            videoId: track.videoId,
            title: track.title,
            channel: track.channel,
            thumbnail: track.thumbnail || ''
        });
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
        tracks: cleanTracks,
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
