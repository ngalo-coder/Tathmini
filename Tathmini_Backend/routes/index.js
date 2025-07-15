const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects');
const odkController = require('../controllers/odk');
const airtableController = require('../controllers/airtable');
const mainController = require('../controllers/main');

// Main routes
router.get('/health', mainController.healthCheck);
router.post('/api/webhook/dashboard-update', mainController.dashboardWebhook);

// ODK routes
router.post('/api/test-connection', odkController.testConnection);

// Project routes
router.get('/api/projects', projectsController.getProjects);
router.post('/api/projects', projectsController.createProject);
router.patch('/api/projects/:id', projectsController.updateProject);
router.delete('/api/projects/:id', projectsController.deleteProject);
router.get('/api/projects/:id/workflow', projectsController.getWorkflow);

// Airtable routes
router.get('/api/airtable/summary', airtableController.getSummary);
router.get('/api/airtable/ai-analysis', airtableController.getAIAnalysis);

module.exports = router;
