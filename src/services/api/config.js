// API Configuration and Authentication Management
import { config } from '../../config/environment';

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // MLS/IDX Endpoints
  mls: {
    baseUrl: config.api.mlsBaseUrl || 'https://api.mlsgrid.com',
    listings: '/v2/Property',
    search: '/v2/Property/search',
    history: '/v2/PropertyHistory',
    agents: '/v2/Member',
    offices: '/v2/Office'
  },
  
  // Zillow API Endpoints
  zillow: {
    baseUrl: 'https://api.bridgedataoutput.com/api/v2',
    property: '/zestimates',
    demographics: '/demographics',
    mortgage: '/mortgage/rates',
    searchResults: '/GetSearchResults',
    deepSearch: '/GetDeepSearchResults'
  },
  
  // Public Records API
  publicRecords: {
    baseUrl: config.api.publicRecordsUrl || 'https://api.propertydata.com',
    assessor: '/assessor',
    deeds: '/deeds',
    tax: '/tax',
    permits: '/permits'
  },
  
  // Additional Data Sources
  walkScore: {
    baseUrl: 'https://api.walkscore.com/score',
    version: '1.1'
  },
  
  census: {
    baseUrl: 'https://api.census.gov/data',
    acs: '/2021/acs/acs5', // American Community Survey 5-year
    population: '/2021/pep/population'
  },
  
  fred: { // Federal Reserve Economic Data
    baseUrl: 'https://api.stlouisfed.org/fred',
    series: '/series/observations'
  }
};

// API Keys Management (loaded from environment)
export const API_KEYS = {
  mls: {
    accessToken: config.api.mlsAccessToken,
    clientId: config.api.mlsClientId,
    clientSecret: config.api.mlsClientSecret
  },
  zillow: {
    apiKey: config.api.zillowApiKey,
    zwsId: config.api.zillowZwsId // Zillow Web Service ID
  },
  publicRecords: {
    apiKey: config.api.publicRecordsApiKey
  },
  walkScore: {
    apiKey: config.api.walkScoreApiKey
  },
  census: {
    apiKey: config.api.censusApiKey
  },
  fred: {
    apiKey: config.api.fredApiKey
  },
  google: {
    apiKey: config.api.googleApiKey // For Places API
  }
};

// Request Headers Configuration
export const getHeaders = (service) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  switch (service) {
    case 'mls':
      if (API_KEYS.mls.accessToken) {
        headers['Authorization'] = `Bearer ${API_KEYS.mls.accessToken}`;
      }
      break;
    
    case 'zillow':
      if (API_KEYS.zillow.apiKey) {
        headers['X-API-Key'] = API_KEYS.zillow.apiKey;
      }
      break;
    
    case 'publicRecords':
      if (API_KEYS.publicRecords.apiKey) {
        headers['Authorization'] = `Bearer ${API_KEYS.publicRecords.apiKey}`;
      }
      break;
    
    case 'walkScore':
      // Walk Score uses URL params for auth
      break;
    
    case 'census':
      // Census uses URL params for auth
      break;
    
    case 'fred':
      // FRED uses URL params for auth
      break;
    
    default:
      break;
  }

  return headers;
};

// Rate Limiting Configuration
export const RATE_LIMITS = {
  mls: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000
  },
  zillow: {
    requestsPerSecond: 2,
    requestsPerDay: 1000
  },
  publicRecords: {
    requestsPerMinute: 30,
    requestsPerDay: 5000
  },
  walkScore: {
    requestsPerDay: 5000
  },
  census: {
    requestsPerSecond: 10 // Very generous limits
  },
  fred: {
    requestsPerMinute: 120
  }
};

// Cache TTL Configuration (in seconds)
export const CACHE_TTL = {
  listings: 300, // 5 minutes for active listings
  propertyDetails: 3600, // 1 hour for property details
  marketStats: 1800, // 30 minutes for market statistics
  demographics: 86400, // 24 hours for demographic data
  walkScore: 604800, // 7 days for walk scores
  publicRecords: 86400, // 24 hours for public records
  economicData: 3600 // 1 hour for economic indicators
};

// Error Messages
export const API_ERRORS = {
  RATE_LIMIT_EXCEEDED: 'API rate limit exceeded. Please try again later.',
  INVALID_API_KEY: 'Invalid API key. Please check your configuration.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  PARSING_ERROR: 'Error parsing API response.',
  NOT_FOUND: 'Requested resource not found.',
  UNAUTHORIZED: 'Unauthorized access. Please check your credentials.',
  SERVER_ERROR: 'Server error. Please try again later.'
};

// Validate API Configuration
export const validateApiConfig = () => {
  const missingKeys = [];
  
  // Check critical API keys
  if (!API_KEYS.mls.accessToken && !API_KEYS.mls.clientId) {
    missingKeys.push('MLS credentials');
  }
  
  if (!API_KEYS.zillow.apiKey && !API_KEYS.zillow.zwsId) {
    missingKeys.push('Zillow API key');
  }
  
  if (missingKeys.length > 0) {
    console.warn('Missing API credentials:', missingKeys.join(', '));
    console.warn('Some features may be limited. Add credentials to .env.local');
  }
  
  return missingKeys.length === 0;
};

// Retry Configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds
  backoffFactor: 2, // Exponential backoff
  retryConditions: [
    (error) => error.message.includes('Network error'),
    (error) => error.message.includes('Server error'),
    (error) => error.message.includes('timeout'),
    (error) => error.status >= 500
  ]
};

// Fallback Data Configuration
export const FALLBACK_DATA = {
  marketStats: {
    averagePrice: 850000,
    medianPrice: 720000,
    averageDaysOnMarket: 32,
    pricePerSqft: 425,
    inventory: 2.1,
    priceChange: 3.2
  },
  demographics: {
    medianIncome: 85000,
    medianAge: 36,
    populationDensity: 2800,
    percentOwnerOccupied: 68,
    percentBachelors: 42
  },
  forecast: {
    confidence: 50,
    priceAppreciation: 2.5,
    factors: ['Market uncertainty', 'Limited data available']
  }
};

// Circuit Breaker Configuration
export const CIRCUIT_BREAKER = {
  failureThreshold: 5, // Number of failures before opening circuit
  resetTimeout: 60000, // 1 minute before trying again
  monitoringPeriod: 300000 // 5 minutes monitoring window
};

// Circuit Breaker State Management
class CircuitBreakerState {
  constructor() {
    this.states = new Map();
  }

  getState(service) {
    if (!this.states.has(service)) {
      this.states.set(service, {
        failures: 0,
        lastFailureTime: null,
        state: 'closed', // closed, open, half-open
        nextAttemptTime: null
      });
    }
    return this.states.get(service);
  }

  recordFailure(service) {
    const state = this.getState(service);
    state.failures++;
    state.lastFailureTime = Date.now();
    
    if (state.failures >= CIRCUIT_BREAKER.failureThreshold) {
      state.state = 'open';
      state.nextAttemptTime = Date.now() + CIRCUIT_BREAKER.resetTimeout;
    }
  }

  recordSuccess(service) {
    const state = this.getState(service);
    state.failures = 0;
    state.state = 'closed';
    state.nextAttemptTime = null;
  }

  canMakeRequest(service) {
    const state = this.getState(service);
    const now = Date.now();
    
    if (state.state === 'closed') {
      return true;
    }
    
    if (state.state === 'open' && now > state.nextAttemptTime) {
      state.state = 'half-open';
      return true;
    }
    
    return false;
  }
}

export const circuitBreaker = new CircuitBreakerState();

// Retry with exponential backoff
export const retryWithBackoff = async (fn, service, ...args) => {
  let lastError;
  let delay = RETRY_CONFIG.initialDelay;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (!circuitBreaker.canMakeRequest(service)) {
        throw new Error(`Circuit breaker is open for ${service}`);
      }
      
      const result = await fn(...args);
      
      // Reset circuit breaker on success
      circuitBreaker.recordSuccess(service);
      return result;
      
    } catch (error) {
      lastError = error;
      
      // Record failure in circuit breaker
      circuitBreaker.recordFailure(service);
      
      // Check if we should retry
      const shouldRetry = RETRY_CONFIG.retryConditions.some(condition => 
        condition(error)
      );
      
      if (attempt === RETRY_CONFIG.maxRetries || !shouldRetry) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * RETRY_CONFIG.backoffFactor, RETRY_CONFIG.maxDelay);
    }
  }
  
  throw lastError;
};

// Get fallback data for a service
export const getFallbackData = (service, dataType) => {
  const fallback = FALLBACK_DATA[dataType];
  if (!fallback) {
    console.warn(`No fallback data available for ${service}:${dataType}`);
    return null;
  }
  
  return {
    ...fallback,
    isFallback: true,
    message: `Using fallback data - ${service} service unavailable`
  };
};

// API Health Check
export const checkApiHealth = async () => {
  const health = {
    mls: false,
    zillow: false,
    publicRecords: false,
    walkScore: false,
    census: false,
    fred: false
  };
  
  // Simple health check - try to fetch with minimal data
  const healthChecks = Object.keys(health).map(async (service) => {
    try {
      // Make a simple request to check connectivity
      const response = await fetch(`${API_ENDPOINTS[service]?.baseUrl || ''}/health`, {
        method: 'HEAD',
        timeout: 5000
      });
      health[service] = response.ok;
    } catch (error) {
      health[service] = false;
    }
  });
  
  await Promise.all(healthChecks);
  return health;
};