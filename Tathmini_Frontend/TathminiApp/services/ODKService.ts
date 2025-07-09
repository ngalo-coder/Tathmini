/**
 * ODK Integration Service for communicating with the ODK Central API
 */
import { fetchFromApi, postToApi } from './ApiService';

// Types
export interface ODKCredentials {
  base_url: string;
  username: string;
  password: string;
  project_id: string;
}

export interface ODKSyncStatus {
  project_id: string;
  status: string;
  last_sync_time: string | null;
  next_sync_time: string | null;
  updated_at: string;
}

export interface ODKSyncLog {
  id: number;
  project_id: string;
  sync_time: string;
  status: string;
  message: string | null;
  forms_synced: number;
  submissions_synced: number;
}

/**
 * Connect to ODK Central
 * @param projectId - Project ID
 * @param credentials - ODK credentials
 * @returns Promise with the connection result
 */
export const connectToODK = async (projectId: string, credentials: ODKCredentials) => {
  try {
    return await postToApi(`/api/v1/odk/projects/${projectId}/connect`, credentials);
  } catch (error) {
    console.error('ODK connection failed:', error);
    throw error;
  }
};

/**
 * Get ODK sync status
 * @param projectId - Project ID
 * @returns Promise with the sync status
 */
export const getODKSyncStatus = async (projectId: string): Promise<ODKSyncStatus> => {
  try {
    return await fetchFromApi(`/api/v1/odk/projects/${projectId}/status`);
  } catch (error) {
    console.error('Failed to get ODK sync status:', error);
    throw error;
  }
};

/**
 * Update ODK sync status (start/pause sync)
 * @param projectId - Project ID
 * @param status - New status ('syncing' or 'paused')
 * @returns Promise with the updated sync status
 */
export const updateODKSyncStatus = async (projectId: string, status: 'syncing' | 'paused'): Promise<ODKSyncStatus> => {
  try {
    return await postToApi(`/api/v1/odk/projects/${projectId}/sync`, { status });
  } catch (error) {
    console.error('Failed to update ODK sync status:', error);
    throw error;
  }
};

/**
 * Get ODK sync logs
 * @param projectId - Project ID
 * @param limit - Maximum number of logs to return
 * @returns Promise with the sync logs
 */
export const getODKSyncLogs = async (projectId: string, limit: number = 10): Promise<ODKSyncLog[]> => {
  try {
    return await fetchFromApi(`/api/v1/odk/projects/${projectId}/logs?limit=${limit}`);
  } catch (error) {
    console.error('Failed to get ODK sync logs:', error);
    throw error;
  }
};

/**
 * Get sync status for all projects
 * @returns Promise with the sync status for all projects
 */
export const getAllProjectsSyncStatus = async () => {
  try {
    return await fetchFromApi('/api/v1/odk/status');
  } catch (error) {
    console.error('Failed to get all projects sync status:', error);
    throw error;
  }
};