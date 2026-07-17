export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface IntakeFormErrors {
  [key: string]: string | undefined;
}

export function validateRequired(value: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: 'This field is required' };
  }
  return { valid: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    return { valid: false, error: 'Phone number must contain at least 7 digits' };
  }
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Phone number contains invalid characters' };
  }
  return { valid: true };
}

export function validateUrl(url: string, required: boolean = true): ValidationResult {
  if (!required && (!url || url.trim().length === 0)) {
    return { valid: true };
  }
  if (!url || url.trim().length === 0) {
    return { valid: false, error: 'URL is required' };
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { valid: false, error: 'URL must start with http:// or https://' };
  }
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

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
  const maxFileSize = 5 * 1024 * 1024;
  const maxFiles = 5;

  if (!files || files.length === 0) {
    return { valid: true };
  }

  if (files.length > maxFiles) {
    return {
      valid: false,
      error: `Maximum ${maxFiles} files allowed, ${files.length} provided`,
    };
  }

  for (const file of files) {
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds maximum size of 5MB`,
      };
    }

    if (!allowedMimeTypes.includes(file.type)) {
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

export function validateIntakeForm(formData: any): IntakeFormErrors {
  const errors: IntakeFormErrors = {};

  if (formData.fullName !== undefined) {
    const result = validateRequired(formData.fullName);
    if (!result.valid) errors.fullName = result.error;
  }

  if (formData.companyName !== undefined) {
    const result = validateRequired(formData.companyName);
    if (!result.valid) errors.companyName = result.error;
  }

  if (formData.phone !== undefined) {
    const result = validatePhone(formData.phone);
    if (!result.valid) errors.phone = result.error;
  }

  if (formData.email !== undefined) {
    const result = validateEmail(formData.email);
    if (!result.valid) errors.email = result.error;
  }

  if (formData.projectDescription !== undefined) {
    const result = validateRequired(formData.projectDescription);
    if (!result.valid) errors.projectDescription = result.error;
  }

  if (formData.services !== undefined) {
    const result = validateCheckboxArray(formData.services, 1);
    if (!result.valid) errors.services = result.error;
  }

  if (formData.files !== undefined) {
    const result = validateFiles(formData.files);
    if (!result.valid) errors.files = result.error;
  }

  if (formData.agreement !== undefined && !formData.agreement) {
    errors.agreement = 'You must agree to proceed';
  }

  return errors;
}
