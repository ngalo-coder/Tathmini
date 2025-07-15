const fetch = require('node-fetch');

const getSummary = async (req, res) => {
    const airtableKey = req.headers['x-airtable-key'];
    const baseId = req.headers['x-airtable-base'];

    if (!airtableKey || !baseId) {
        return res.status(400).json({ error: 'Missing Airtable credentials' });
    }

    try {
        const response = await fetch(
            `https://api.airtable.com/v0/${baseId}/Summary%20Stats?maxRecords=10&sort%5B0%5D%5Bfield%5D=Processed%20At&sort%5B0%5D%5Bdirection%5D=desc`,
            {
                headers: {
                    'Authorization': `Bearer ${airtableKey}`
                }
            }
        );

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Airtable proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch Airtable data' });
    }
};

const getAIAnalysis = async (req, res) => {
    const airtableKey = req.headers['x-airtable-key'];
    const baseId = req.headers['x-airtable-base'];

    if (!airtableKey || !baseId) {
        return res.status(400).json({ error: 'Missing Airtable credentials' });
    }

    try {
        const response = await fetch(
            `https://api.airtable.com/v0/${baseId}/AI%20Analyses?maxRecords=1&sort%5B0%5D%5Bfield%5D=Timestamp&sort%5B0%5D%5Bdirection%5D=desc`,
            {
                headers: {
                    'Authorization': `Bearer ${airtableKey}`
                }
            }
        );

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Airtable proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch Airtable data' });
    }
};

module.exports = {
    getSummary,
    getAIAnalysis
};
