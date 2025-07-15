import React, { useState, useEffect } from 'react';
import { Activity, Plus, Settings, Database, BarChart3, AlertCircle, CheckCircle, Loader2, Edit2, Trash2, Play } from 'lucide-react';

const API_BASE_URL = 'https://tathmini-config-server-production-5a6e.up.railway.app';

const TathminiDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Project form state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    updateFrequency: 15,
    odkConnection: {
      url: '',
      email: '',
      password: '',
      projectId: '',
      formId: ''
    },
    airtableConnection: {
      apiKey: '',
      baseId: ''
    }
  });

  // API calls
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error(`API call failed for ${endpoint}:`, err);
      throw err;
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/projects');
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthStatus = async () => {
    try {
      const data = await apiCall('/health');
      setHealthStatus(data);
    } catch (err) {
      setError('Failed to check health status');
    }
  };

  const loadSummaryData = async () => {
    try {
      const data = await apiCall('/api/airtable/summary', {
        headers: {
          'x-airtable-key': 'your-api-key',
          'x-airtable-base': 'your-base-id'
        }
      });
      setSummaryData(data);
    } catch (err) {
      console.log('Airtable summary not available');
    }
  };

  const testODKConnection = async (connectionData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/test-connection', {
        method: 'POST',
        body: JSON.stringify(connectionData)
      });
      return data;
    } catch (err) {
      throw new Error('Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async () => {
    try {
      setLoading(true);
      if (editingProject) {
        await apiCall(`/api/projects/${editingProject.id}`, {
          method: 'PATCH',
          body: JSON.stringify(projectForm)
        });
      } else {
        await apiCall('/api/projects', {
          method: 'POST',
          body: JSON.stringify(projectForm)
        });
      }
      setShowProjectForm(false);
      setEditingProject(null);
      resetProjectForm();
      await loadProjects();
    } catch (err) {
      setError('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      setLoading(true);
      await apiCall(`/api/projects/${id}`, { method: 'DELETE' });
      await loadProjects();
    } catch (err) {
      setError('Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      name: '',
      description: '',
      updateFrequency: 15,
      odkConnection: {
        url: '',
        email: '',
        password: '',
        projectId: '',
        formId: ''
      },
      airtableConnection: {
        apiKey: '',
        baseId: ''
      }
    });
  };

  useEffect(() => {
    loadProjects();
    loadHealthStatus();
    loadSummaryData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, status = 'normal' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${
            status === 'success' ? 'text-green-600' : 
            status === 'error' ? 'text-red-600' : 
            'text-gray-900'
          }`}>
            {value}
          </p>
        </div>
        <Icon className={`h-8 w-8 ${
          status === 'success' ? 'text-green-500' : 
          status === 'error' ? 'text-red-500' : 
          'text-gray-400'
        }`} />
      </div>
    </div>
  );

  const ProjectCard = ({ project }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500">
              Update Frequency: {project.updateFrequency} minutes
            </p>
            <p className="text-xs text-gray-500">
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => {
              setEditingProject(project);
              setProjectForm(project);
              setShowProjectForm(true);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteProject(project.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
            <Play className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const ProjectForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingProject ? 'Edit Project' : 'Create New Project'}
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectForm.name}
                onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter project description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Frequency (minutes)
              </label>
              <input
                type="number"
                value={projectForm.updateFrequency}
                onChange={(e) => setProjectForm({...projectForm, updateFrequency: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ODK Connection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ODK URL</label>
                <input
                  type="text"
                  value={projectForm.odkConnection.url}
                  onChange={(e) => setProjectForm({
                    ...projectForm,
                    odkConnection: {...projectForm.odkConnection, url: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://your-odk-server.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={projectForm.odkConnection.email}
                  onChange={(e) => setProjectForm({
                    ...projectForm,
                    odkConnection: {...projectForm.odkConnection, email: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your-email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={projectForm.odkConnection.password}
                  onChange={(e) => setProjectForm({
                    ...projectForm,
                    odkConnection: {...projectForm.odkConnection, password: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project ID</label>
                <input
                  type="text"
                  value={projectForm.odkConnection.projectId}
                  onChange={(e) => setProjectForm({
                    ...projectForm,
                    odkConnection: {...projectForm.odkConnection, projectId: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Project ID"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Form ID</label>
                <input
                  type="text"
                  value={projectForm.odkConnection.formId}
                  onChange={(e) => setProjectForm({
                    ...projectForm,
                    odkConnection: {...projectForm.odkConnection, formId: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Form ID"
                />
              </div>
            </div>
            
            <button
              onClick={() => testODKConnection(projectForm.odkConnection)}
              disabled={loading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              <span>Test Connection</span>
            </button>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Airtable Connection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={projectForm.airtableConnection.apiKey}
                  onChange={(e) => setProjectForm({
                    ...projectForm,
                    airtableConnection: {...projectForm.airtableConnection, apiKey: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Airtable API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base ID</label>
                <input
                  type="text"
                  value={projectForm.airtableConnection.baseId}
                  onChange={(e) => setProjectForm({
                    ...projectForm,
                    airtableConnection: {...projectForm.airtableConnection, baseId: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Base ID"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={() => {
              setShowProjectForm(false);
              setEditingProject(null);
              resetProjectForm();
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={saveProject}
            disabled={loading || !projectForm.name}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">TathminiAI Platform</h1>
              </div>
              <div className="ml-10 flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === 'dashboard'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === 'projects'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === 'analytics'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="System Status"
                value={healthStatus?.status === 'healthy' ? 'Healthy' : 'Unknown'}
                icon={Activity}
                status={healthStatus?.status === 'healthy' ? 'success' : 'error'}
              />
              <StatCard
                title="Active Projects"
                value={projects.length}
                icon={Database}
              />
              <StatCard
                title="Service Version"
                value={healthStatus?.version || 'Unknown'}
                icon={Settings}
              />
              <StatCard
                title="Platform"
                value="TathminiAI"
                icon={BarChart3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No projects created yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{healthStatus?.service || 'TathminiAI Platform'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">{healthStatus?.version || '2.0.0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      healthStatus?.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {healthStatus?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
              <button
                onClick={() => setShowProjectForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </button>
            </div>

            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {projects.length === 0 && !loading && (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first project.</p>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-center py-8">
                Analytics dashboard will be available when Airtable data is connected.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Project Form Modal */}
      {showProjectForm && <ProjectForm />}
    </div>
  );
};

export default TathminiDashboard;