// Analytics service for tracking user interactions and performance
import { config, isProduction } from '../config/environment';

class AnalyticsService {
  constructor() {
    this.initialized = false;
    this.queue = [];
  }

  // Initialize analytics services
  async init() {
    if (!config.features.analytics) {
      console.log('Analytics disabled');
      return;
    }

    // Initialize Google Analytics
    if (config.analytics.gaTrackingId) {
      await this.initGoogleAnalytics();
    }

    // Initialize Sentry for error tracking
    if (config.analytics.sentryDsn) {
      await this.initSentry();
    }

    // Initialize Mixpanel for product analytics
    if (config.analytics.mixpanelToken) {
      await this.initMixpanel();
    }

    this.initialized = true;

    // Process queued events
    this.processQueue();
  }

  // Initialize Google Analytics
  async initGoogleAnalytics() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.analytics.gaTrackingId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', config.analytics.gaTrackingId, {
      send_page_view: false,
      custom_map: {
        dimension1: 'user_type',
        dimension2: 'app_version'
      }
    });

    console.log('Google Analytics initialized');
  }

  // Initialize Sentry
  async initSentry() {
    try {
      const Sentry = await import('@sentry/browser');
      
      Sentry.init({
        dsn: config.analytics.sentryDsn,
        environment: isProduction() ? 'production' : 'development',
        integrations: [
          new Sentry.BrowserTracing(),
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true
          })
        ],
        tracesSampleRate: isProduction() ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0
      });

      console.log('Sentry initialized');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  // Initialize Mixpanel
  async initMixpanel() {
    const script = document.createElement('script');
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    document.head.appendChild(script);

    script.onload = () => {
      window.mixpanel.init(config.analytics.mixpanelToken, {
        debug: !isProduction(),
        track_pageview: true,
        persistence: 'localStorage',
        ip: false
      });

      console.log('Mixpanel initialized');
    };
  }

  // Process queued events
  processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      this[event.method](...event.args);
    }
  }

  // Queue event if not initialized
  queueEvent(method, args) {
    this.queue.push({ method, args });
  }

  // Track page view
  trackPageView(pageName, properties = {}) {
    if (!this.initialized) {
      this.queueEvent('trackPageView', [pageName, properties]);
      return;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
        ...properties
      });
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track('Page View', {
        page: pageName,
        ...properties
      });
    }
  }

  // Track custom event
  trackEvent(category, action, label = null, value = null) {
    if (!this.initialized) {
      this.queueEvent('trackEvent', [category, action, label, value]);
      return;
    }

    const eventData = {
      event_category: category,
      event_label: label,
      value: value
    };

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', action, eventData);
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(`${category} - ${action}`, {
        label,
        value,
        ...eventData
      });
    }

    console.log('Event tracked:', category, action, label, value);
  }

  // Track user identification
  identifyUser(userId, traits = {}) {
    if (!this.initialized) {
      this.queueEvent('identifyUser', [userId, traits]);
      return;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('config', config.analytics.gaTrackingId, {
        user_id: userId
      });
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.identify(userId);
      window.mixpanel.people.set(traits);
    }

    // Sentry
    if (window.Sentry) {
      window.Sentry.setUser({
        id: userId,
        ...traits
      });
    }
  }

  // Track timing events
  trackTiming(category, variable, time, label = null) {
    if (!this.initialized) {
      this.queueEvent('trackTiming', [category, variable, time, label]);
      return;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: time,
        event_category: category,
        event_label: label
      });
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track('Timing', {
        category,
        variable,
        time,
        label
      });
    }
  }

  // Track errors
  trackError(error, context = {}) {
    console.error('Error tracked:', error, context);

    // Sentry
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          app: context
        }
      });
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message || String(error),
        fatal: false,
        ...context
      });
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track('Error', {
        message: error.message || String(error),
        stack: error.stack,
        ...context
      });
    }
  }

  // Track performance metrics
  trackPerformance() {
    if (!window.performance || !this.initialized) return;

    const perfData = window.performance.getEntriesByType('navigation')[0];
    if (!perfData) return;

    const metrics = {
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp: perfData.connectEnd - perfData.connectStart,
      request: perfData.responseStart - perfData.requestStart,
      response: perfData.responseEnd - perfData.responseStart,
      dom: perfData.domComplete - perfData.domLoading,
      load: perfData.loadEventEnd - perfData.loadEventStart,
      total: perfData.loadEventEnd - perfData.fetchStart
    };

    // Track each metric
    Object.entries(metrics).forEach(([key, value]) => {
      this.trackTiming('Performance', key, Math.round(value));
    });
  }

  // Track conversion goals
  trackGoal(goalName, value = null, properties = {}) {
    this.trackEvent('Goal', goalName, null, value);

    // Mixpanel specific goal tracking
    if (window.mixpanel) {
      window.mixpanel.track(`Goal: ${goalName}`, {
        value,
        ...properties
      });
    }
  }

  // Common event tracking helpers
  trackFeedbackRecorded(clientId, propertyId, method, preferences = {}) {
    this.trackEvent('Feedback', 'Recorded', method);
    
    // Track preference categories used
    const categoriesUsed = Object.keys(preferences).filter(cat => 
      preferences[cat] && preferences[cat].length > 0
    );
    
    this.trackGoal('FeedbackRecorded', null, {
      clientId,
      propertyId,
      method,
      categoriesUsed: categoriesUsed.length,
      totalPreferences: Object.values(preferences).flat().length
    });

    // Track individual preference usage
    categoriesUsed.forEach(category => {
      this.trackEvent('Preferences', 'CategoryUsed', category, preferences[category].length);
    });
  }

  trackPreferenceAdded(category, preference) {
    this.trackEvent('Preferences', 'Added', `${category}:${preference}`);
  }

  trackPreferencePattern(pattern, count) {
    this.trackEvent('Preferences', 'Pattern', pattern, count);
  }

  trackDealBreakerIdentified(dealBreaker) {
    this.trackEvent('Preferences', 'DealBreaker', dealBreaker);
  }

  trackMatchScore(clientId, propertyId, score, factors) {
    this.trackEvent('Matching', 'Score', `${score}%`, score);
    this.trackGoal('MatchCalculated', score, {
      clientId,
      propertyId,
      ...factors
    });
  }

  trackClientAdded(source) {
    this.trackEvent('Client', 'Added', source);
    this.trackGoal('ClientAdded');
  }

  trackPropertyAdded(source) {
    this.trackEvent('Property', 'Added', source);
    this.trackGoal('PropertyAdded');
  }

  trackCRMConnected(crmType) {
    this.trackEvent('CRM', 'Connected', crmType);
    this.trackGoal('CRMConnected', null, { crmType });
  }

  trackSearch(searchType, query, resultsCount) {
    this.trackEvent('Search', searchType, query, resultsCount);
  }

  trackFeatureUsed(featureName) {
    this.trackEvent('Feature', 'Used', featureName);
  }

  trackMobileUsage(action) {
    this.trackEvent('Mobile', 'Action', action);
  }

  trackPreferenceInsight(insightType, data) {
    this.trackEvent('Insights', insightType, JSON.stringify(data));
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    analytics.init();
    analytics.trackPerformance();
  });
}

export default analytics;