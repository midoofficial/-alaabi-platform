// Privacy and consent management
class PrivacyManager {
  constructor() {
    this.consentKey = 'privacy-consent';
    this.analyticsKey = 'analytics-consent';
    this.cookiesKey = 'cookies-consent';
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.checkConsent();
      this.setupConsentBanner();
    });
  }

  checkConsent() {
    const consent = this.getConsent();
    
    if (!consent.asked) {
      // Show consent banner
      this.showConsentBanner();
    } else {
      // Apply consent settings
      this.applyConsentSettings(consent);
    }
  }

  getConsent() {
    const stored = localStorage.getItem(this.consentKey);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Invalid consent data, resetting');
      }
    }
    
    return {
      asked: false,
      analytics: false,
      cookies: false,
      functional: true, // Always true for basic functionality
      timestamp: null
    };
  }

  setConsent(settings) {
    const consent = {
      ...settings,
      asked: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(this.consentKey, JSON.stringify(consent));
    this.applyConsentSettings(consent);
    
    // Hide banner
    this.hideConsentBanner();
    
    // Show confirmation
    this.showConsentConfirmation();
  }

  applyConsentSettings(consent) {
    // Analytics consent
    if (consent.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }
    
    // Cookies consent
    if (consent.cookies) {
      this.enableCookies();
    } else {
      this.disableCookies();
    }
    
    // Update analytics instance if available
    if (window.analytics) {
      window.analytics.setConsent(consent.analytics);
    }
  }

  enableAnalytics() {
    localStorage.setItem(this.analyticsKey, 'true');
    
    // Initialize Google Analytics if not already done
    if (typeof gtag === 'undefined' && this.shouldLoadAnalytics()) {
      this.loadGoogleAnalytics();
    }
  }

  disableAnalytics() {
    localStorage.setItem(this.analyticsKey, 'false');
    
    // Disable Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
  }

  enableCookies() {
    localStorage.setItem(this.cookiesKey, 'true');
  }

  disableCookies() {
    localStorage.setItem(this.cookiesKey, 'false');
    
    // Clear non-essential cookies
    this.clearNonEssentialCookies();
  }

  shouldLoadAnalytics() {
    // Check if GA script should be loaded
    return !document.querySelector('script[src*="googletagmanager.com"]');
  }

  loadGoogleAnalytics() {
    // Dynamically load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(script);
    
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
      
      // Make gtag globally available
      window.gtag = gtag;
    };
  }

  clearNonEssentialCookies() {
    // List of essential cookies to keep
    const essentialCookies = [
      this.consentKey,
      this.analyticsKey,
      this.cookiesKey,
      'user-preferences',
      'session-data'
    ];
    
    // Clear localStorage items that are not essential
    Object.keys(localStorage).forEach(key => {
      if (!essentialCookies.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  }

  showConsentBanner() {
    // Remove existing banner
    this.hideConsentBanner();
    
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.innerHTML = `
      <div class="consent-banner__content">
        <div class="consent-banner__text">
          <h3>🍪 نحترم خصوصيتك</h3>
          <p>نستخدم ملفات تعريف الارتباط والتقنيات المشابهة لتحسين تجربتك وتحليل استخدام الموقع. يمكنك اختيار ما تريد السماح به:</p>
        </div>
        
        <div class="consent-options">
          <label class="consent-option">
            <input type="checkbox" id="consent-functional" checked disabled>
            <span class="consent-option__text">
              <strong>ضروري للعمل</strong>
              <small>مطلوب لعمل الموقع الأساسي</small>
            </span>
          </label>
          
          <label class="consent-option">
            <input type="checkbox" id="consent-analytics">
            <span class="consent-option__text">
              <strong>التحليلات</strong>
              <small>يساعدنا في فهم كيفية استخدام الموقع</small>
            </span>
          </label>
          
          <label class="consent-option">
            <input type="checkbox" id="consent-cookies">
            <span class="consent-option__text">
              <strong>ملفات تعريف الارتباط</strong>
              <small>لحفظ تفضيلاتك وتحسين التجربة</small>
            </span>
          </label>
        </div>
        
        <div class="consent-actions">
          <button class="btn btn--secondary" onclick="privacyManager.acceptSelected()">
            حفظ الاختيارات
          </button>
          <button class="btn btn--primary" onclick="privacyManager.acceptAll()">
            قبول الكل
          </button>
          <button class="btn btn--text" onclick="privacyManager.rejectAll()">
            رفض الكل
          </button>
        </div>
        
        <div class="consent-links">
          <a href="/privacy-policy" target="_blank">سياسة الخصوصية</a>
          <a href="/terms" target="_blank">شروط الاستخدام</a>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Add styles
    this.addConsentStyles();
    
    // Show with animation
    setTimeout(() => {
      banner.classList.add('show');
    }, 100);
  }

  hideConsentBanner() {
    const banner = document.getElementById('consent-banner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }

  acceptAll() {
    this.setConsent({
      analytics: true,
      cookies: true,
      functional: true
    });
  }

  rejectAll() {
    this.setConsent({
      analytics: false,
      cookies: false,
      functional: true
    });
  }

  acceptSelected() {
    const analytics = document.getElementById('consent-analytics')?.checked || false;
    const cookies = document.getElementById('consent-cookies')?.checked || false;
    
    this.setConsent({
      analytics,
      cookies,
      functional: true
    });
  }

  showConsentConfirmation() {
    const toast = document.createElement('div');
    toast.className = 'consent-toast';
    toast.innerHTML = `
      <div class="consent-toast__content">
        ✅ تم حفظ تفضيلات الخصوصية
        <button onclick="this.parentElement.parentElement.remove()" class="consent-toast__close">×</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
  }

  addConsentStyles() {
    if (document.getElementById('consent-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'consent-styles';
    styles.textContent = `
      .consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--c-surface, #ffffff);
        border-top: 1px solid var(--c-border, #e5e7eb);
        box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
        z-index: 1000;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .consent-banner.show {
        transform: translateY(0);
      }
      
      .consent-banner__content {
        padding: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
      }
      
      .consent-banner__text h3 {
        margin: 0 0 0.5rem 0;
        color: var(--c-text, #1f2937);
        font-size: 1.2rem;
      }
      
      .consent-banner__text p {
        margin: 0 0 1.5rem 0;
        color: var(--c-text-secondary, #6b7280);
        line-height: 1.5;
      }
      
      .consent-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      
      .consent-option {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;
        padding: 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--c-border, #e5e7eb);
        transition: background-color 0.2s ease;
      }
      
      .consent-option:hover {
        background-color: var(--c-bg, #f9fafb);
      }
      
      .consent-option input[type="checkbox"] {
        margin: 0;
        transform: scale(1.2);
      }
      
      .consent-option__text {
        flex: 1;
      }
      
      .consent-option__text strong {
        display: block;
        color: var(--c-text, #1f2937);
        margin-bottom: 0.25rem;
      }
      
      .consent-option__text small {
        color: var(--c-text-secondary, #6b7280);
        font-size: 0.85rem;
      }
      
      .consent-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      
      .consent-actions .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
      }
      
      .consent-actions .btn--primary {
        background: var(--c-primary, #3b82f6);
        color: white;
      }
      
      .consent-actions .btn--secondary {
        background: var(--c-bg, #f3f4f6);
        color: var(--c-text, #1f2937);
        border: 1px solid var(--c-border, #d1d5db);
      }
      
      .consent-actions .btn--text {
        background: transparent;
        color: var(--c-text-secondary, #6b7280);
        text-decoration: underline;
      }
      
      .consent-links {
        display: flex;
        gap: 1rem;
        font-size: 0.85rem;
      }
      
      .consent-links a {
        color: var(--c-primary, #3b82f6);
        text-decoration: none;
      }
      
      .consent-links a:hover {
        text-decoration: underline;
      }
      
      .consent-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--c-success, #10b981);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        animation: slideIn 0.3s ease;
      }
      
      .consent-toast__content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .consent-toast__close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .consent-banner__content {
          padding: 1rem;
        }
        
        .consent-actions {
          flex-direction: column;
        }
        
        .consent-actions .btn {
          width: 100%;
          text-align: center;
        }
        
        .consent-toast {
          right: 10px;
          left: 10px;
          top: 10px;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  // Public methods for managing consent
  updateConsent(type, value) {
    const consent = this.getConsent();
    consent[type] = value;
    this.setConsent(consent);
  }

  revokeConsent() {
    localStorage.removeItem(this.consentKey);
    this.disableAnalytics();
    this.disableCookies();
    this.showConsentBanner();
  }

  getConsentStatus() {
    return this.getConsent();
  }

  // Show privacy settings (can be called from privacy policy page)
  showPrivacySettings() {
    this.showConsentBanner();
  }
}

// Initialize privacy manager
const privacyManager = new PrivacyManager();

// Export for global use
window.privacyManager = privacyManager;