// Base API Client with Rate Limiting and Caching
import { API_ERRORS, RATE_LIMITS, CACHE_TTL, getHeaders } from './config';

// Simple in-memory cache (in production, use Redis)
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttlSeconds) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Rate Limiter
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  canMakeRequest(service, limits) {
    const now = Date.now();
    const serviceRequests = this.requests.get(service) || [];
    
    // Clean old requests
    const validRequests = serviceRequests.filter(timestamp => {
      const age = now - timestamp;
      return age < 86400000; // Keep last 24 hours
    });

    // Check rate limits
    if (limits.requestsPerSecond) {
      const lastSecond = validRequests.filter(t => now - t < 1000);
      if (lastSecond.length >= limits.requestsPerSecond) return false;
    }

    if (limits.requestsPerMinute) {
      const lastMinute = validRequests.filter(t => now - t < 60000);
      if (lastMinute.length >= limits.requestsPerMinute) return false;
    }

    if (limits.requestsPerHour) {
      const lastHour = validRequests.filter(t => now - t < 3600000);
      if (lastHour.length >= limits.requestsPerHour) return false;
    }

    if (limits.requestsPerDay) {
      const lastDay = validRequests.filter(t => now - t < 86400000);
      if (lastDay.length >= limits.requestsPerDay) return false;
    }

    // Record this request
    validRequests.push(now);
    this.requests.set(service, validRequests);
    
    return true;
  }

  getRemainingRequests(service, limits) {
    const now = Date.now();
    const serviceRequests = this.requests.get(service) || [];
    
    const remaining = {};
    
    if (limits.requestsPerMinute) {
      const lastMinute = serviceRequests.filter(t => now - t < 60000);
      remaining.perMinute = limits.requestsPerMinute - lastMinute.length;
    }
    
    if (limits.requestsPerDay) {
      const lastDay = serviceRequests.filter(t => now - t < 86400000);
      remaining.perDay = limits.requestsPerDay - lastDay.length;
    }
    
    return remaining;
  }
}

// Initialize cache and rate limiter
const cache = new SimpleCache();
const rateLimiter = new RateLimiter();

// Clean cache every 5 minutes
setInterval(() => cache.cleanup(), 300000);

// Base API Client
class ApiClient {
  constructor(service) {
    this.service = service;
    this.baseUrl = '';
    this.headers = getHeaders(service);
    this.rateLimits = RATE_LIMITS[service] || {};
  }

  // Build URL with query parameters
  buildUrl(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
    return url.toString();
  }

  // Generate cache key
  getCacheKey(method, endpoint, params) {
    return `${this.service}:${method}:${endpoint}:${JSON.stringify(params)}`;
  }

  // Make API request with rate limiting and caching
  async request(method, endpoint, options = {}) {
    const { params = {}, body = null, cacheTTL = null, bypassCache = false } = options;

    // Check rate limits
    if (!rateLimiter.canMakeRequest(this.service, this.rateLimits)) {
      throw new Error(API_ERRORS.RATE_LIMIT_EXCEEDED);
    }

    // Check cache for GET requests
    const cacheKey = this.getCacheKey(method, endpoint, params);
    if (method === 'GET' && !bypassCache && cacheTTL) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return cachedData;
      }
    }

    // Build request
    const url = this.buildUrl(endpoint, params);
    const requestOptions = {
      method,
      headers: this.headers
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      // Make the request
      const response = await fetch(url, requestOptions);

      // Handle response
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(API_ERRORS.UNAUTHORIZED);
        } else if (response.status === 404) {
          throw new Error(API_ERRORS.NOT_FOUND);
        } else if (response.status === 429) {
          throw new Error(API_ERRORS.RATE_LIMIT_EXCEEDED);
        } else if (response.status >= 500) {
          throw new Error(API_ERRORS.SERVER_ERROR);
        } else {
          throw new Error(`API Error: ${response.statusText}`);
        }
      }

      const data = await response.json();

      // Cache successful GET requests
      if (method === 'GET' && cacheTTL) {
        cache.set(cacheKey, data, cacheTTL);
      }

      return data;
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error(API_ERRORS.NETWORK_ERROR);
      }
      throw error;
    }
  }

  // Convenience methods
  async get(endpoint, params, cacheTTL) {
    return this.request('GET', endpoint, { params, cacheTTL });
  }

  async post(endpoint, body, params) {
    return this.request('POST', endpoint, { body, params });
  }

  async put(endpoint, body, params) {
    return this.request('PUT', endpoint, { body, params });
  }

  async delete(endpoint, params) {
    return this.request('DELETE', endpoint, { params });
  }

  // Batch requests with Promise.all
  async batchGet(requests) {
    return Promise.all(
      requests.map(({ endpoint, params, cacheTTL }) => 
        this.get(endpoint, params, cacheTTL)
      )
    );
  }

  // Get rate limit status
  getRateLimitStatus() {
    return rateLimiter.getRemainingRequests(this.service, this.rateLimits);
  }
}

// Export utilities
export { ApiClient, cache, rateLimiter };

// Clear cache utility
export const clearCache = () => cache.clear();

// Get cache stats
export const getCacheStats = () => {
  return {
    size: cache.cache.size,
    entries: Array.from(cache.cache.entries()).map(([key, value]) => ({
      key,
      expiresAt: new Date(value.expiresAt)
    }))
  };
};