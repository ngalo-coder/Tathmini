/**
 * API Service for communicating with the Tathmini backend
 */

// Base URL for the API
const API_BASE_URL = 'http://localhost:8000'
// 'http://10.0.2.2:8000'|| ; // Use 10.0.2.2 for Android emulator to access localhost
// For iOS simulator, use 'http://localhost:8000'
// For physical devices, use the actual IP address of your computer

/**
 * Fetch data from the API
 * @param endpoint - API endpoint to fetch from
 * @returns Promise with the response data
 */
export const fetchFromApi = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Post data to the API
 * @param endpoint - API endpoint to post to
 * @param data - Data to send
 * @returns Promise with the response data
 */
export const postToApi = async (endpoint: string, data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Health check for the API
 * @returns Promise with the health status
 */
export const checkApiHealth = async () => {
  try {
    return await fetchFromApi('/health');
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unavailable' };
  }
};