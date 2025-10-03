import type { ValidationResult, ValidationError, LoginCredentials, RegisterData } from '../types';

// Helper function to create validation errors
const createError = (field: string, message: string): ValidationError => ({
  field,
  message,
});

// Individual field validators
export const validateEmail = (email: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push(createError('email', 'Email is required'));
    return errors;
  }

  if (email.length > 254) {
    errors.push(createError('email', 'Email is too long'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push(createError('email', 'Please enter a valid email address'));
  }

  return errors;
};

export const validateUsername = (username: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!username) {
    errors.push(createError('username', 'Username is required'));
    return errors;
  }

  if (username.length < 3) {
    errors.push(createError('username', 'Username must be at least 3 characters'));
  }

  if (username.length > 20) {
    errors.push(createError('username', 'Username must be no more than 20 characters'));
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    errors.push(createError('username', 'Username can only contain letters, numbers, and underscores'));
  }

  // Check for reserved usernames
  const reservedUsernames = ['admin', 'root', 'api', 'www', 'mail', 'support', 'help', 'about', 'privacy', 'terms'];
  if (reservedUsernames.includes(username.toLowerCase())) {
    errors.push(createError('username', 'This username is not available'));
  }

  return errors;
};

export const validatePassword = (password: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!password) {
    errors.push(createError('password', 'Password is required'));
    return errors;
  }

  if (password.length < 8) {
    errors.push(createError('password', 'Password must be at least 8 characters'));
  }

  if (password.length > 128) {
    errors.push(createError('password', 'Password is too long'));
  }

  // Check for at least one letter and one number for better security
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    errors.push(createError('password', 'Password should contain both letters and numbers'));
  }

  return errors;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!confirmPassword) {
    errors.push(createError('confirmPassword', 'Please confirm your password'));
    return errors;
  }

  if (password !== confirmPassword) {
    errors.push(createError('confirmPassword', 'Passwords do not match'));
  }

  return errors;
};

export const validateBio = (bio: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (bio && bio.length > 160) {
    errors.push(createError('bio', 'Bio must be no more than 160 characters'));
  }

  return errors;
};

export const validatePostContent = (content: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!content) {
    errors.push(createError('content', 'Post content is required'));
    return errors;
  }

  if (content.trim().length === 0) {
    errors.push(createError('content', 'Post cannot be empty'));
    return errors;
  }

  if (content.length > 500) {
    errors.push(createError('content', 'Post must be no more than 500 characters'));
  }

  return errors;
};

// Comprehensive form validators
export const validateLoginForm = (credentials: LoginCredentials): ValidationResult => {
  const errors: ValidationError[] = [
    ...validateEmail(credentials.email),
    ...validatePassword(credentials.password),
  ];

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRegisterForm = (data: RegisterData): ValidationResult => {
  const errors: ValidationError[] = [
    ...validateUsername(data.username),
    ...validateEmail(data.email),
    ...validatePassword(data.password),
    ...validateConfirmPassword(data.password, data.confirmPassword),
    ...validateBio(data.bio || ''),
  ];

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Real-time validation helpers (for individual fields as user types)
export const validateFieldRealTime = (field: string, value: string, formData?: Partial<RegisterData>): ValidationError[] => {
  switch (field) {
    case 'email':
      return validateEmail(value);
    case 'username':
      return validateUsername(value);
    case 'password':
      return validatePassword(value);
    case 'confirmPassword':
      return validateConfirmPassword(formData?.password || '', value);
    case 'bio':
      return validateBio(value);
    case 'content':
      return validatePostContent(value);
    default:
      return [];
  }
};

// Helper to get user-friendly error messages
export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  const error = errors.find(err => err.field === field);
  return error?.message;
};

// Helper to check if a specific field has errors
export const hasFieldError = (errors: ValidationError[], field: string): boolean => {
  return errors.some(err => err.field === field);
};