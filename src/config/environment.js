// Environment configuration with defaults and validation

const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

const getBooleanEnv = (key, defaultValue = false) => {
  const value = getEnvVar(key, String(defaultValue));
  return value === 'true' || value === '1';
};

// Validate required environment variables
const validateEnvironment = () => {
  const errors = [];
  
  // Check for required variables in production
  if (import.meta.env.PROD) {
    if (!config.api.baseUrl) {
      errors.push('VITE_API_BASE_URL is required in production');
    }
    
    if (config.features.googlePlaces && !config.api.googlePlacesKey) {
      errors.push('VITE_GOOGLE_PLACES_API_KEY is required when Google Places is enabled');
    }
  }
  
  if (errors.length > 0) {
    console.error('Environment configuration errors:', errors);
    
    // In development, log warnings
    if (import.meta.env.DEV) {
      errors.forEach(error => console.warn(`⚠️ ${error}`));
    } else {
      // In production, throw error
      throw new Error(`Environment configuration errors:\n${errors.join('\n')}`);
    }
  }
};

// Environment configuration object
export const config = {
  // Application info
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Realtor Insight Engine'),
    shortName: getEnvVar('VITE_APP_SHORT_NAME', 'RealtorAI'),
    description: getEnvVar('VITE_APP_DESCRIPTION', 'Professional real estate feedback and analytics platform'),
    version: '1.0.0'
  },
  
  // API Configuration
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api/v1'),
    key: getEnvVar('VITE_API_KEY'),
    timeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '30000')),
    googlePlacesKey: getEnvVar('VITE_GOOGLE_PLACES_API_KEY')
  },
  
  // Feature flags
  features: {
    propertySearch: getBooleanEnv('VITE_ENABLE_PROPERTY_SEARCH', true),
    crmIntegration: getBooleanEnv('VITE_ENABLE_CRM_INTEGRATION', true),
    googlePlaces: getBooleanEnv('VITE_ENABLE_GOOGLE_PLACES', true),
    offlineMode: getBooleanEnv('VITE_ENABLE_OFFLINE_MODE', true),
    analytics: getBooleanEnv('VITE_ENABLE_ANALYTICS', true),
    preferenceTracking: getBooleanEnv('VITE_ENABLE_PREFERENCE_TRACKING', true),
    smartMatching: getBooleanEnv('VITE_ENABLE_SMART_MATCHING', true)
  },
  
  // Development settings
  dev: {
    mockApi: getBooleanEnv('VITE_MOCK_API', import.meta.env.DEV),
    debugMode: getBooleanEnv('VITE_DEBUG_MODE', import.meta.env.DEV),
    logLevel: getEnvVar('VITE_LOG_LEVEL', import.meta.env.DEV ? 'debug' : 'error')
  },
  
  // Analytics configuration
  analytics: {
    gaTrackingId: getEnvVar('VITE_GA_TRACKING_ID'),
    sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
    mixpanelToken: getEnvVar('VITE_MIXPANEL_TOKEN')
  },
  
  // Storage configuration
  storage: {
    prefix: getEnvVar('VITE_STORAGE_PREFIX', 'realtorAI_'),
    encryptionKey: getEnvVar('VITE_STORAGE_ENCRYPTION_KEY')
  },
  
  // PWA configuration
  pwa: {
    themeColor: getEnvVar('VITE_THEME_COLOR', '#3B82F6'),
    backgroundColor: getEnvVar('VITE_BACKGROUND_COLOR', '#F9FAFB')
  }
};

// Validate environment on load
if (typeof window !== 'undefined') {
  validateEnvironment();
}

// Helper functions
export const isProduction = () => import.meta.env.PROD;
export const isDevelopment = () => import.meta.env.DEV;
export const isDebugMode = () => config.dev.debugMode;
export const isMockMode = () => config.dev.mockApi;

// Feature checking helpers
export const isFeatureEnabled = (feature) => {
  return config.features[feature] === true;
};

export const requiresApiKey = () => {
  return isProduction() && !isMockMode();
};

// Logging helper
export const log = {
  debug: (...args) => {
    if (config.dev.logLevel === 'debug') {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args) => {
    if (['debug', 'info'].includes(config.dev.logLevel)) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args) => {
    if (['debug', 'info', 'warn'].includes(config.dev.logLevel)) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  }
};

// API URL builder
export const buildApiUrl = (endpoint) => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Storage key builder
export const buildStorageKey = (key) => {
  return `${config.storage.prefix}${key}`;
};

export default config;