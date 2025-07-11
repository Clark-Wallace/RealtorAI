// Form validation utilities with helpful messages

export const validators = {
  // Required field validation
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validation
  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address (e.g., name@example.com)';
    }
    return null;
  },

  // Phone validation
  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number (e.g., (555) 123-4567)';
    }
    return null;
  },

  // Minimum length validation
  minLength: (value, min, fieldName = 'This field') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  },

  // Maximum length validation
  maxLength: (value, max, fieldName = 'This field') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters`;
    }
    return null;
  },

  // Number range validation
  numberRange: (value, min, max, fieldName = 'Value') => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName} must be a number`;
    }
    if (min !== undefined && num < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (max !== undefined && num > max) {
      return `${fieldName} must be no more than ${max}`;
    }
    return null;
  },

  // Price validation
  price: (value) => {
    if (!value) return null;
    const price = Number(value);
    if (isNaN(price) || price < 0) {
      return 'Please enter a valid price';
    }
    return null;
  },

  // URL validation
  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL (e.g., https://example.com)';
    }
  },

  // Custom pattern validation
  pattern: (value, pattern, message) => {
    if (!value) return null;
    if (!pattern.test(value)) {
      return message || 'Invalid format';
    }
    return null;
  }
};

// Validate multiple fields
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Only show first error per field
      }
    }
  });
  
  return errors;
};

// Common validation rules for real estate forms
export const realtorValidationRules = {
  client: {
    name: [
      (v) => validators.required(v, 'Client name'),
      (v) => validators.minLength(v, 2, 'Name'),
      (v) => validators.maxLength(v, 100, 'Name')
    ],
    email: [
      (v) => validators.required(v, 'Email'),
      validators.email
    ],
    phone: [
      (v) => validators.required(v, 'Phone number'),
      validators.phone
    ],
    budget: {
      min: [
        (v) => validators.numberRange(v, 0, 100000000, 'Minimum budget')
      ],
      max: [
        (v) => validators.numberRange(v, 0, 100000000, 'Maximum budget')
      ]
    }
  },
  
  property: {
    address: [
      (v) => validators.required(v, 'Property address'),
      (v) => validators.minLength(v, 10, 'Address')
    ],
    price: [
      (v) => validators.required(v, 'Price'),
      validators.price
    ],
    bedrooms: [
      (v) => validators.required(v, 'Number of bedrooms'),
      (v) => validators.numberRange(v, 0, 20, 'Bedrooms')
    ],
    bathrooms: [
      (v) => validators.required(v, 'Number of bathrooms'),
      (v) => validators.numberRange(v, 0, 20, 'Bathrooms')
    ],
    sqft: [
      (v) => validators.numberRange(v, 0, 100000, 'Square footage')
    ]
  },

  feedback: {
    overallRating: [
      (v) => validators.required(v, 'Overall rating'),
      (v) => validators.numberRange(v, 1, 5, 'Rating')
    ],
    interestedLevel: [
      (v) => validators.required(v, 'Interest level')
    ],
    priceOpinion: [
      (v) => validators.required(v, 'Price opinion')
    ]
  }
};

// Helper to get field-specific error message
export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] || null;
};

// Helper to check if form has errors
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

// Format validation messages for display
export const formatValidationMessage = (error) => {
  if (!error) return null;
  
  // Add icon based on error type
  if (error.includes('required')) {
    return `⚠️ ${error}`;
  }
  if (error.includes('valid')) {
    return `❌ ${error}`;
  }
  return `ℹ️ ${error}`;
};