/**
 * Application Configuration
 * 
 * Centralized configuration for environment-specific settings.
 * Uses Vite environment variables with fallback defaults for development.
 */

// Safe access to Vite environment variables
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return defaultValue;
};

export const config = {
  /**
   * API Base URL
   * Set via VITE_API_BASE_URL environment variable
   * Default: http://localhost:5000/api (development)
   */
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api'),
  
  /**
   * Application Environment
   * Set via VITE_APP_ENV or MODE
   */
  environment: getEnvVar('VITE_APP_ENV') || getEnvVar('MODE') || 'development',
  
  /**
   * Enable debug mode
   * Set via VITE_DEBUG
   */
  debug: getEnvVar('VITE_DEBUG') === 'true',

  /**
   * Mock Mode
   * Enable this to use mock data instead of real API calls
   * Set via VITE_MOCK_MODE or toggle in UI
   * Default: true (use mock data for demos and development)
   */
  mockMode: getEnvVar('VITE_MOCK_MODE') === 'true' || localStorage.getItem('mockMode') !== 'false',
} as const;

// Helper function to toggle mock mode
export const setMockMode = (enabled: boolean) => {
  localStorage.setItem('mockMode', enabled.toString());
  window.location.reload(); // Reload to apply changes
};

// Helper function to get current mock mode status
export const isMockMode = (): boolean => {
  // If never set, default to true. If explicitly set to 'false', use that.
  const storedValue = localStorage.getItem('mockMode');
  if (storedValue === null) {
    return true; // Default to mock mode
  }
  return storedValue === 'true' || getEnvVar('VITE_MOCK_MODE') === 'true';
};

// Log configuration in development
if (config.environment === 'development' && config.debug) {
  console.log('App Configuration:', config);
}

// Log mock mode status
if (isMockMode()) {
  console.log('🎭 MOCK MODE ENABLED - Using mock data, no backend calls will be made');
}

export default config;