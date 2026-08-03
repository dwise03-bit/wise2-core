/**
 * Intake Form Validation Utilities
 *
 * Provides reusable validation functions for all form field types
 * Used by the WISE² intake form component
 */

/**
 * Standard validation result format
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Form-level validation errors mapped by field name
 */
export interface FormErrors {
  [key: string]: string | undefined;
}

/**
 * Validate required field - non-empty string
 *
 * @param value - The string value to validate
 * @returns ValidationResult with validity and error message
 */
export function validateRequired(value: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      valid: false,
      error: 'This field is required',
    };
  }
  return { valid: true };
}

/**
 * Validate email address
 *
 * Checks for basic email format: must contain @ symbol and a domain
 *
 * @param email - The email address to validate
 * @returns ValidationResult with validity and error message
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      valid: false,
      error: 'Email is required',
    };
  }

  // Basic email regex: something@something.something
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { valid: true };
}

/**
 * Validate phone number
 *
 * Accepts digits, +, -, (), spaces
 * Requires minimum 7 digits
 *
 * @param phone - The phone number to validate
 * @returns ValidationResult with validity and error message
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return {
      valid: false,
      error: 'Phone number is required',
    };
  }

  // Extract only digits from the phone number
  const digitsOnly = phone.replace(/\D/g, '');

  // Check if at least 7 digits are present
  if (digitsOnly.length < 7) {
    return {
      valid: false,
      error: 'Phone number must contain at least 7 digits',
    };
  }

  // Validate that the string only contains allowed characters
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return {
      valid: false,
      error: 'Phone number contains invalid characters',
    };
  }

  return { valid: true };
}

/**
 * Validate URL
 *
 * Must start with http:// or https://
 * Uses URL constructor for validation
 *
 * @param url - The URL to validate
 * @param required - Whether the field is required (default: true)
 * @returns ValidationResult with validity and error message
 */
export function validateUrl(url: string, required: boolean = true): ValidationResult {
  // If not required and empty, it's valid
  if (!required && (!url || url.trim().length === 0)) {
    return { valid: true };
  }

  if (!url || url.trim().length === 0) {
    return {
      valid: false,
      error: 'URL is required',
    };
  }

  // Check if URL starts with http:// or https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return {
      valid: false,
      error: 'URL must start with http:// or https://',
    };
  }

  // Try to parse with URL constructor
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid URL',
    };
  }
}

/**
 * Validate date
 *
 * Parses date string and checks if it's a valid date
 * Accepts any date format that JavaScript's Date constructor understands
 *
 * @param dateString - The date string to validate
 * @param required - Whether the field is required (default: true)
 * @returns ValidationResult with validity and error message
 */
export function validateDate(dateString: string, required: boolean = true): ValidationResult {
  // If not required and empty, it's valid
  if (!required && (!dateString || dateString.trim().length === 0)) {
    return { valid: true };
  }

  if (!dateString || dateString.trim().length === 0) {
    return {
      valid: false,
      error: 'Date is required',
    };
  }

  // Parse the date
  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: 'Please enter a valid date',
    };
  }

  return { valid: true };
}

/**
 * Validate checkbox array
 *
 * Ensures at least the minimum required number of items are selected
 *
 * @param values - Array of selected checkbox values
 * @param minRequired - Minimum number of required selections (default: 1)
 * @returns ValidationResult with validity and error message
 */
export function validateCheckboxArray(
  values: string[],
  minRequired: number = 1
): ValidationResult {
  if (!values || values.length === 0) {
    if (minRequired > 0) {
      return {
        valid: false,
        error: `Please select at least ${minRequired} option${minRequired > 1 ? 's' : ''}`,
      };
    }
    return { valid: true };
  }

  if (values.length < minRequired) {
    return {
      valid: false,
      error: `Please select at least ${minRequired} option${minRequired > 1 ? 's' : ''}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file uploads
 *
 * Constraints:
 * - Maximum 5 files
 * - Maximum 5MB per file
 * - Allowed file types: pdf, doc, docx, jpg, png, gif
 *
 * @param files - Array of File objects or null
 * @returns ValidationResult with validity and error message
 */
export function validateFiles(files: File[] | null): ValidationResult {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
  const maxFiles = 5;

  // If no files, that's valid (files are optional)
  if (!files || files.length === 0) {
    return { valid: true };
  }

  // Check file count
  if (files.length > maxFiles) {
    return {
      valid: false,
      error: `Maximum ${maxFiles} files allowed, ${files.length} provided`,
    };
  }

  // Validate each file
  for (const file of files) {
    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds maximum size of 5MB`,
      };
    }

    // Check file type by MIME type
    if (!allowedMimeTypes.includes(file.type)) {
      // Also check by file extension as fallback
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return {
          valid: false,
          error: `File type "${file.type || fileExtension}" is not allowed. Allowed types: PDF, DOC, DOCX, JPG, PNG, GIF`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Validate entire intake form
 *
 * Validates all fields in the form object
 *
 * @param formData - The form data object containing all fields
 * @returns FormErrors object with field names as keys and error messages as values
 */
export function validateIntakeForm(formData: any): FormErrors {
  const errors: FormErrors = {};

  // Validate required text fields
  if (formData.firstName !== undefined) {
    const result = validateRequired(formData.firstName);
    if (!result.valid) {
      errors.firstName = result.error;
    }
  }

  if (formData.lastName !== undefined) {
    const result = validateRequired(formData.lastName);
    if (!result.valid) {
      errors.lastName = result.error;
    }
  }

  if (formData.companyName !== undefined) {
    const result = validateRequired(formData.companyName);
    if (!result.valid) {
      errors.companyName = result.error;
    }
  }

  if (formData.jobTitle !== undefined) {
    const result = validateRequired(formData.jobTitle);
    if (!result.valid) {
      errors.jobTitle = result.error;
    }
  }

  // Validate email
  if (formData.email !== undefined) {
    const result = validateEmail(formData.email);
    if (!result.valid) {
      errors.email = result.error;
    }
  }

  // Validate phone
  if (formData.phone !== undefined) {
    const result = validatePhone(formData.phone);
    if (!result.valid) {
      errors.phone = result.error;
    }
  }

  // Validate website (optional)
  if (formData.website !== undefined) {
    const result = validateUrl(formData.website, false);
    if (!result.valid) {
      errors.website = result.error;
    }
  }

  // Validate date of birth (optional)
  if (formData.dateOfBirth !== undefined) {
    const result = validateDate(formData.dateOfBirth, false);
    if (!result.valid) {
      errors.dateOfBirth = result.error;
    }
  }

  // Validate checkboxes
  if (formData.interests !== undefined) {
    const result = validateCheckboxArray(formData.interests, 1);
    if (!result.valid) {
      errors.interests = result.error;
    }
  }

  if (formData.services !== undefined) {
    const result = validateCheckboxArray(formData.services, 1);
    if (!result.valid) {
      errors.services = result.error;
    }
  }

  // Validate file uploads (optional)
  if (formData.attachments !== undefined) {
    const result = validateFiles(formData.attachments);
    if (!result.valid) {
      errors.attachments = result.error;
    }
  }

  // Validate terms acceptance (required)
  if (formData.acceptTerms !== undefined && !formData.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions';
  }

  return errors;
}
