// Analytics and tracking utilities
class Analytics {
  constructor() {
    this.isEnabled = this.checkConsent();
    this.sessionStart = Date.now();
    this.pageViews = 0;
    this.events = [];
    
    if (this.isEnabled) {
      this.init();
    }
  }

  checkConsent() {
    // Check if user has given consent for analytics
    return localStorage.getItem('analytics-consent') === 'true';
  }

  init() {
    this.trackPageView();
    this.trackUserEngagement();
    this.trackPerformance();
  }

  // Track page views
  trackPageView() {
    this.pageViews++;
    const pageData = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', pageData);
    }

    this.logEvent('page_view', pageData);
  }

  // Track user interactions
  trackEvent(eventName, parameters = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      event_name: eventName,
      timestamp: new Date().toISOString(),
      ...parameters
    };

    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }

    this.logEvent(eventName, eventData);
  }

  // Track game/activity completion
  trackGameCompletion(gameName, score, duration) {
    this.trackEvent('game_complete', {
      game_name: gameName,
      score: score,
      duration_seconds: Math.round(duration / 1000),
      level_completed: true
    });
  }

  // Track learning progress
  trackLearningProgress(section, progress) {
    this.trackEvent('learning_progress', {
      section: section,
      progress_percentage: progress,
      user_type: 'child' // or 'parent', 'teacher'
    });
  }

  // Track user engagement
  trackUserEngagement() {
    let timeOnPage = 0;
    let isActive = true;

    // Track time on page
    const startTime = Date.now();
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }
    });

    // Track when user leaves/returns to tab
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isActive = false;
        timeOnPage += Date.now() - startTime;
      } else {
        isActive = true;
      }
    });

    // Send engagement data before page unload
    window.addEventListener('beforeunload', () => {
      if (isActive) {
        timeOnPage += Date.now() - startTime;
      }

      this.trackEvent('user_engagement', {
        time_on_page: Math.round(timeOnPage / 1000),
        max_scroll_percentage: maxScroll,
        page_views_session: this.pageViews
      });
    });
  }

  // Track performance metrics
  trackPerformance() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if ('performance' in window) {
          const perfData = performance.getEntriesByType('navigation')[0];
          
          this.trackEvent('page_performance', {
            load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
            dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
            first_paint: this.getFirstPaint(),
            connection_type: this.getConnectionType()
          });
        }
      }, 1000);
    });
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? Math.round(firstPaint.startTime) : null;
  }

  getConnectionType() {
    return navigator.connection ? navigator.connection.effectiveType : 'unknown';
  }

  // Local event logging (for debugging and offline analysis)
  logEvent(eventName, data) {
    this.events.push({
      event: eventName,
      data: data,
      timestamp: Date.now()
    });

    // Keep only last 100 events to prevent memory issues
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    // Store in localStorage for debugging
    try {
      localStorage.setItem('analytics-events', JSON.stringify(this.events.slice(-10)));
    } catch (e) {
      // Handle storage quota exceeded
      console.warn('Could not store analytics events:', e);
    }
  }

  // Get analytics summary
  getSummary() {
    return {
      session_duration: Date.now() - this.sessionStart,
      page_views: this.pageViews,
      events_count: this.events.length,
      last_events: this.events.slice(-5)
    };
  }

  // Enable/disable analytics
  setConsent(enabled) {
    localStorage.setItem('analytics-consent', enabled.toString());
    this.isEnabled = enabled;
    
    if (enabled && !this.initialized) {
      this.init();
    }
  }
}

// Initialize analytics
const analytics = new Analytics();

// Export for global use
window.analytics = analytics;

// Helper functions for easy tracking
window.trackEvent = (name, params) => analytics.trackEvent(name, params);
window.trackGame = (name, score, duration) => analytics.trackGameCompletion(name, score, duration);
window.trackLearning = (section, progress) => analytics.trackLearningProgress(section, progress);