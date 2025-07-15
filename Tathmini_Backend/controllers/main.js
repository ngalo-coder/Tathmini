const healthCheck = (req, res) => {
    res.json({
        status: 'healthy',
        service: 'TathminiAI Platform',
        version: '2.0.0'
    });
};

const dashboardWebhook = (req, res) => {
    const { runId, stats, insights, alerts } = req.body;

    console.log(`Dashboard update received for run: ${runId}`);

    // In a production app, you might store this in a database
    // or push it to connected clients via WebSocket

    res.json({ success: true, message: 'Dashboard update received' });
};

module.exports = {
    healthCheck,
    dashboardWebhook
};
