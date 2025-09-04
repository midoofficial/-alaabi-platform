// Performance optimization utilities
class PerformanceOptimizer {
  constructor() {
    this.observers = new Map();
    this.lazyImages = [];
    this.lazyVideos = [];
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupLazyLoading();
      this.setupImageOptimization();
      this.setupVideoOptimization();
      this.setupResourceHints();
      this.monitorPerformance();
    });
  }

  // Lazy loading for images
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  setupIntersectionObserver() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
      this.lazyImages.push(img);
    });

    this.observers.set('images', imageObserver);
  }

  loadImage(img) {
    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Replace src and remove data-src
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
      
      // Remove loading placeholder
      img.classList.remove('loading');
    };
    
    imageLoader.onerror = () => {
      // Handle loading error
      img.classList.add('error');
      img.alt = 'فشل في تحميل الصورة';
    };
    
    // Start loading
    imageLoader.src = img.dataset.src;
  }

  loadAllImages() {
    // Fallback: load all images immediately
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.loadImage(img);
    });
  }

  // Video optimization
  setupVideoOptimization() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
      // Lazy load videos
      if (video.dataset.src && 'IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadVideo(entry.target);
              videoObserver.unobserve(entry.target);
            }
          });
        });
        
        videoObserver.observe(video);
      }
      
      // Optimize video playback
      this.optimizeVideo(video);
    });
  }

  loadVideo(video) {
    if (video.dataset.src) {
      video.src = video.dataset.src;
      video.removeAttribute('data-src');
      video.load();
    }
  }

  optimizeVideo(video) {
    // Pause video when not visible
    if ('IntersectionObserver' in window) {
      const playbackObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Video is visible, allow autoplay if set
            if (video.hasAttribute('autoplay')) {
              video.play().catch(() => {
                // Autoplay failed, show play button
                this.showVideoPlayButton(video);
              });
            }
          } else {
            // Video is not visible, pause it
            if (!video.paused) {
              video.pause();
            }
          }
        });
      }, { threshold: 0.5 });
      
      playbackObserver.observe(video);
    }
  }

  showVideoPlayButton(video) {
    const playButton = document.createElement('button');
    playButton.className = 'video-play-btn';
    playButton.innerHTML = '▶️ تشغيل الفيديو';
    playButton.setAttribute('aria-label', 'تشغيل الفيديو');
    
    playButton.addEventListener('click', () => {
      video.play();
      playButton.remove();
    });
    
    video.parentNode.insertBefore(playButton, video.nextSibling);
  }

  // Image optimization
  setupImageOptimization() {
    // Add loading states to images
    document.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        img.classList.add('loading');
        
        img.addEventListener('load', () => {
          img.classList.remove('loading');
          img.classList.add('loaded');
        });
        
        img.addEventListener('error', () => {
          img.classList.remove('loading');
          img.classList.add('error');
        });
      }
    });
  }

  // Resource hints for better loading
  setupResourceHints() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Prefetch likely next pages
    this.prefetchNextPages();
  }

  preloadCriticalResources() {
    const criticalResources = [
      { href: '/css/style.css', as: 'style' },
      { href: '/js/main.js', as: 'script' },
      { href: '/assets/icons/icon-192.png', as: 'image' }
    ];
    
    criticalResources.forEach(resource => {
      if (!document.querySelector(`link[href="${resource.href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        document.head.appendChild(link);
      }
    });
  }

  prefetchNextPages() {
    // Prefetch likely next pages based on current page
    const currentPath = window.location.pathname;
    let nextPages = [];
    
    if (currentPath === '/') {
      nextPages = ['/learning', '/activities'];
    } else if (currentPath.includes('/learning')) {
      nextPages = ['/kids', '/activities'];
    } else if (currentPath.includes('/activities')) {
      nextPages = ['/tests'];
    }
    
    nextPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });
  }

  // Performance monitoring
  monitorPerformance() {
    // Monitor Core Web Vitals
    this.measureCoreWebVitals();
    
    // Monitor resource loading
    this.monitorResourceLoading();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
  }

  measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (window.analytics) {
            window.analytics.trackEvent('core_web_vital', {
              metric: 'LCP',
              value: Math.round(lastEntry.startTime),
              rating: lastEntry.startTime < 2500 ? 'good' : 
                     lastEntry.startTime < 4000 ? 'needs_improvement' : 'poor'
            });
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP measurement not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (window.analytics) {
              window.analytics.trackEvent('core_web_vital', {
                metric: 'FID',
                value: Math.round(entry.processingStart - entry.startTime),
                rating: entry.processingStart - entry.startTime < 100 ? 'good' : 
                       entry.processingStart - entry.startTime < 300 ? 'needs_improvement' : 'poor'
              });
            }
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID measurement not supported');
      }
    }

    // Cumulative Layout Shift (CLS)
    this.measureCLS();
  }

  measureCLS() {
    let clsValue = 0;
    let clsEntries = [];
    
    if ('PerformanceObserver' in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              clsEntries.push(entry);
            }
          });
          
          if (window.analytics && clsEntries.length > 0) {
            window.analytics.trackEvent('core_web_vital', {
              metric: 'CLS',
              value: Math.round(clsValue * 1000) / 1000,
              rating: clsValue < 0.1 ? 'good' : 
                     clsValue < 0.25 ? 'needs_improvement' : 'poor'
            });
          }
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS measurement not supported');
      }
    }
  }

  monitorResourceLoading() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      
      // Find slow resources
      const slowResources = resources.filter(resource => 
        resource.duration > 1000
      );
      
      if (slowResources.length > 0 && window.analytics) {
        window.analytics.trackEvent('slow_resources', {
          count: slowResources.length,
          slowest_resource: slowResources[0].name,
          slowest_duration: Math.round(slowResources[0].duration)
        });
      }
    });
  }

  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        
        // Alert if memory usage is high
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('High memory usage detected');
          
          if (window.analytics) {
            window.analytics.trackEvent('high_memory_usage', {
              used_heap: Math.round(memory.usedJSHeapSize / 1024 / 1024),
              total_heap: Math.round(memory.totalJSHeapSize / 1024 / 1024),
              heap_limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
            });
          }
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Utility methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Get performance summary
  getPerformanceSummary() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    
    return {
      page_load_time: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
      resources_count: resources.length,
      lazy_images_count: this.lazyImages.length,
      observers_active: this.observers.size
    };
  }
}

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Export for global use
window.performanceOptimizer = performanceOptimizer;