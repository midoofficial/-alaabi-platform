// Contact forms with Netlify Forms integration
class ContactManager {
  constructor() {
    this.forms = new Map();
    this.init();
  }

  init() {
    // Initialize all contact forms
    document.addEventListener('DOMContentLoaded', () => {
      this.setupForms();
    });
  }

  setupForms() {
    const forms = document.querySelectorAll('form[data-netlify]');
    forms.forEach(form => this.setupForm(form));
  }

  setupForm(form) {
    const formId = form.id || `form-${Date.now()}`;
    
    // Add form validation
    this.addValidation(form);
    
    // Add submit handler
    form.addEventListener('submit', (e) => this.handleSubmit(e, formId));
    
    // Store form reference
    this.forms.set(formId, {
      element: form,
      submissions: 0,
      lastSubmission: null
    });
  }

  addValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Add real-time validation
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (required && !value) {
      isValid = false;
      errorMessage = 'هذا الحقل مطلوب';
    }
    
    // Email validation
    else if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'يرجى إدخال بريد إلكتروني صحيح';
      }
    }
    
    // Phone validation (Arabic/International)
    else if (type === 'tel' && value) {
      const phoneRegex = /^[\+]?[0-9\-\(\)\s]{8,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        errorMessage = 'يرجى إدخال رقم هاتف صحيح';
      }
    }
    
    // Name validation (Arabic/English)
    else if (field.name === 'name' && value) {
      const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]{2,}$/;
      if (!nameRegex.test(value)) {
        isValid = false;
        errorMessage = 'يرجى إدخال اسم صحيح (حروف عربية أو إنجليزية فقط)';
      }
    }

    this.showFieldValidation(field, isValid, errorMessage);
    return isValid;
  }

  showFieldValidation(field, isValid, message) {
    // Remove existing error
    this.clearFieldError(field);
    
    if (!isValid) {
      field.classList.add('error');
      
      // Create error message element
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.textContent = message;
      errorDiv.setAttribute('role', 'alert');
      
      // Insert after field
      field.parentNode.insertBefore(errorDiv, field.nextSibling);
    } else {
      field.classList.add('valid');
    }
  }

  clearFieldError(field) {
    field.classList.remove('error', 'valid');
    
    // Remove error message
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  async handleSubmit(event, formId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate all fields
    const isValid = this.validateForm(form);
    if (!isValid) {
      this.showFormMessage(form, 'يرجى تصحيح الأخطاء أدناه', 'error');
      return;
    }

    // Show loading state
    this.setFormLoading(form, true);
    
    try {
      // Submit to Netlify
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (response.ok) {
        this.handleSubmitSuccess(form, formId);
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      this.handleSubmitError(form, error);
    } finally {
      this.setFormLoading(form, false);
    }
  }

  validateForm(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  handleSubmitSuccess(form, formId) {
    // Update form stats
    const formData = this.forms.get(formId);
    if (formData) {
      formData.submissions++;
      formData.lastSubmission = new Date();
    }

    // Show success message
    this.showFormMessage(form, 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
    
    // Reset form
    form.reset();
    
    // Clear all validation states
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => this.clearFieldError(field));
    
    // Track successful submission
    if (window.analytics) {
      window.analytics.trackEvent('form_submit', {
        form_id: formId,
        form_name: form.name || 'contact_form'
      });
    }

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      this.hideFormMessage(form);
    }, 5000);
  }

  handleSubmitError(form, error) {
    console.error('Form submission error:', error);
    
    this.showFormMessage(
      form, 
      'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.', 
      'error'
    );
    
    // Track error
    if (window.analytics) {
      window.analytics.trackEvent('form_error', {
        error_message: error.message,
        form_id: form.id
      });
    }
  }

  setFormLoading(form, loading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري الإرسال...';
      form.classList.add('loading');
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText || 'إرسال';
      form.classList.remove('loading');
    }
  }

  showFormMessage(form, message, type) {
    // Remove existing message
    this.hideFormMessage(form);
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message--${type}`;
    messageDiv.textContent = message;
    messageDiv.setAttribute('role', type === 'error' ? 'alert' : 'status');
    
    // Insert at top of form
    form.insertBefore(messageDiv, form.firstChild);
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  hideFormMessage(form) {
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  // Get form statistics
  getFormStats(formId) {
    return this.forms.get(formId) || null;
  }

  // Get all forms statistics
  getAllStats() {
    const stats = {};
    this.forms.forEach((data, id) => {
      stats[id] = data;
    });
    return stats;
  }
}

// Initialize contact manager
const contactManager = new ContactManager();

// Export for global use
window.contactManager = contactManager;