export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { username, password } = req.body;

    // REPLACE THIS URL with the deployed Google Apps Script Web App URL
    const GAS_WEBAPP_URL = process.env.GAS_AUTH_URL || 'https://script.google.com/macros/s/AKfycbyc9103CqP18Hqfdf37z0X2h1-wAEXAMPLE/exec';

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    try {
        const response = await fetch(GAS_WEBAPP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username, password })
        });

        let result;
        const textResponse = await response.text();
        try {
            result = JSON.parse(textResponse);
        } catch (e) {
            console.error('Non-JSON response from GAS:', textResponse);
            return res.status(500).json({ success: false, message: 'Gagal terhubung ke Google Apps Script.' });
        }

        if (result && result.success) {
            return res.status(200).json({ success: true, username: result.username });
        } else {
            return res.status(401).json({ success: false, message: result?.message || 'Login gagal' });
        }

    } catch (error) {
        console.error('Error proxying auth to GAS:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while connecting to proxy' });
    }
}
