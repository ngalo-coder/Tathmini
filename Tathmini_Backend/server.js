const express = require('express');
const cors = require('cors');
const path = require('path');
const indexRouter = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/', indexRouter);

// Start server
async function start() {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ TathminiAI Platform running on port ${PORT}`);        
        console.log(`📊 Dashboard, Projects, Reports - All in one place!`);
    });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, keeping server alive...');
});

start();
