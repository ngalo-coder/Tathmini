let projects = [];
const fs = require('fs').promises;
const path = require('path');
const PROJECTS_FILE = path.join(__dirname, '../projects.json');

async function initializeProjects() {
    try {
        await fs.access(PROJECTS_FILE);
        const data = await fs.readFile(PROJECTS_FILE, 'utf8');
        projects = JSON.parse(data);
        console.log(`Loaded ${projects.length} projects from file`);
    } catch (error) {
        console.log('No projects file found, starting with empty array');
        projects = [];
        await saveProjects();
    }
}

async function saveProjects() {
    try {
        await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    } catch (error) {
        console.error('Error saving projects:', error);
    }
}

const getProjects = (req, res) => {
    res.json(projects);
};

const createProject = async (req, res) => {
    const newProject = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };

    projects.push(newProject);
    await saveProjects();

    console.log('Project created:', newProject.name);
    res.status(201).json(newProject);
};

const updateProject = async (req, res) => {
    const index = projects.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    projects[index] = { ...projects[index], ...req.body };
    await saveProjects();

    res.json(projects[index]);
};

const deleteProject = async (req, res) => {
    const initialLength = projects.length;
    projects = projects.filter(p => p.id !== req.params.id);

    if (projects.length === initialLength) {
        return res.status(404).json({ error: 'Project not found' });
    }

    await saveProjects();
    res.json({ success: true });
};

const getWorkflow = (req, res) => {
    const project = projects.find(p => p.id === req.params.id);

    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const workflow = {
        name: `TathminiAI - ${project.name}`,
        nodes: [
            {
                parameters: {
                    rule: {
                        interval: [{
                            field: "minutes",
                            minutesInterval: project.updateFrequency || 15
                        }]
                    }
                },
                id: "schedule-trigger",
                name: "Schedule Trigger",
                type: "n8n-nodes-base.scheduleTrigger",
                position: [250, 300],
                typeVersion: 1.2
            },
            {
                parameters: {
                    url: `${project.odkConnection.url}/v1/projects/${project.odkConnection.projectId}/forms/${project.odkConnection.formId}/submissions`,
                    authentication: "genericCredentialType",
                    genericAuthType: "httpBasicAuth",
                    sendHeaders: true,
                    headerParameters: {
                        parameters: [{
                            name: "Content-Type",
                            value: "application/json"
                        }]
                    },
                    options: {}
                },
                id: "fetch-odk-data",
                name: "Fetch ODK Data",
                type: "n8n-nodes-base.httpRequest",
                position: [450, 300],
                typeVersion: 4.2,
                credentials: {
                    httpBasicAuth: {
                        id: "YOUR_CREDENTIAL_ID",
                        name: "ODK Credentials"
                    }
                }
            }
        ],
        connections: {
            "Schedule Trigger": {
                "main": [[{
                    "node": "Fetch ODK Data",
                    "type": "main",
                    "index": 0
                }]]
            }
        }
    };

    res.json(workflow);
};

initializeProjects();

module.exports = {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    getWorkflow
};
