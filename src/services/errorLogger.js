// Error Logging Service
// In production, integrate with services like Sentry, LogRocket, or custom logging

class ErrorLogger {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for unhandled errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        error: event.reason
      });
    });
  }

  logError(errorInfo) {
    const errorData = {
      ...errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      isOnline: this.isOnline,
      isPWA: window.matchMedia('(display-mode: standalone)').matches
    };

    // In development, log to console
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorData);
    }

    // Add to queue
    this.queue.push(errorData);

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushQueue();
    } else {
      // Store in localStorage for offline persistence
      this.persistQueue();
    }
  }

  async flushQueue() {
    if (this.queue.length === 0) return;

    const errors = [...this.queue];
    this.queue = [];

    try {
      // In production, send to your error logging endpoint
      if (import.meta.env.PROD && import.meta.env.VITE_ERROR_LOGGING_ENDPOINT) {
        await fetch(import.meta.env.VITE_ERROR_LOGGING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': import.meta.env.VITE_API_KEY || ''
          },
          body: JSON.stringify({ errors })
        });
      }

      // Clear persisted queue
      localStorage.removeItem('errorQueue');
    } catch (error) {
      // If sending fails, add back to queue
      this.queue.unshift(...errors);
      this.persistQueue();
    }
  }

  persistQueue() {
    try {
      localStorage.setItem('errorQueue', JSON.stringify(this.queue));
    } catch (e) {
      // localStorage might be full
      console.error('Failed to persist error queue:', e);
    }
  }

  // Load persisted errors on startup
  loadPersistedErrors() {
    try {
      const persisted = localStorage.getItem('errorQueue');
      if (persisted) {
        const errors = JSON.parse(persisted);
        this.queue.push(...errors);
        this.flushQueue();
      }
    } catch (e) {
      console.error('Failed to load persisted errors:', e);
    }
  }

  // Manual error logging
  log(message, extra = {}) {
    this.logError({
      message,
      level: 'error',
      extra
    });
  }

  // Log warnings
  warn(message, extra = {}) {
    this.logError({
      message,
      level: 'warning',
      extra
    });
  }

  // Log info
  info(message, extra = {}) {
    if (import.meta.env.DEV) {
      console.info(message, extra);
    }
    
    this.logError({
      message,
      level: 'info',
      extra
    });
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

// Load any persisted errors
errorLogger.loadPersistedErrors();

export default errorLogger;