const fetch = require('node-fetch');

const testConnection = async (req, res) => {
    const { url, email, password, projectId, formId } = req.body;

    console.log('Testing ODK connection to:', url);

    try {
        // Authenticate with ODK
        const authResponse = await fetch(`${url}/v1/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (!authResponse.ok) {
            throw new Error('Authentication failed');
        }

        const { token } = await authResponse.json();

        // Get forms to verify connection
        const formsResponse = await fetch(
            `${url}/v1/projects/${projectId}/forms`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!formsResponse.ok) {
            throw new Error('Could not access forms');
        }

        const forms = await formsResponse.json();

        res.json({
            success: true,
            message: `Connection successful! Found ${forms.length} forms.`
        });
    } catch (error) {
        console.error('Connection test failed:', error.message);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    testConnection
};
