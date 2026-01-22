// Storage using Vercel Blob
import { put, list } from '@vercel/blob';

export async function getCD(code) {
    try {
        const upperCode = code.toUpperCase();

        // List all blobs and find the matching one
        const { blobs } = await list({ prefix: `cds/${upperCode}.json` });

        if (blobs.length > 0) {
            // Fetch the blob content
            const response = await fetch(blobs[0].url);
            if (response.ok) {
                const cd = await response.json();
                return cd;
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting CD from Blob:', error);
        return null;
    }
}

export async function saveCD(code, cdData) {
    try {
        const upperCode = code.toUpperCase();
        const blob = await put(`cds/${upperCode}.json`, JSON.stringify(cdData), {
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false
        });

        console.log(`CD saved to Blob: ${upperCode}`, blob.url);
        return true;
    } catch (error) {
        console.error('Error saving CD to Blob:', error);
        return false;
    }
}

export async function getAllCodes() {
    try {
        const { blobs } = await list({ prefix: 'cds/' });
        return blobs.map(blob => blob.pathname.replace('cds/', '').replace('.json', ''));
    } catch (error) {
        console.error('Error getting all codes:', error);
        return [];
    }
}

export async function getCDCount() {
    try {
        const codes = await getAllCodes();
        return codes.length;
    } catch (error) {
        console.error('Error getting CD count:', error);
        return 0;
    }
}
