/**
 * Validation & Utility Functions
 * Input validation, sanitization, formatting, error handling
 */

/**
 * Sanitize string input
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 200); // Limit length
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: unknown): number | null {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  return num;
}

/**
 * Format currency (AED)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${(value).toFixed(decimals)}%`;
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate percentage (0-100)
 */
export function validatePercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && isFinite(value);
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Round to decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Merge deep objects
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Calculate percentage from two numbers
 */
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return (current / total) * 100;
}

/**
 * Compare two floats with tolerance
 */
export function floatsEqual(a: number, b: number, tolerance = 0.001): boolean {
  return Math.abs(a - b) < tolerance;
}

/**
 * Error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate object against schema
 */
export function validate(
  obj: Record<string, any>,
  schema: Record<string, (value: any) => boolean | string>
): ValidationResult {
  const errors: string[] = [];

  for (const key in schema) {
    const validator = schema[key];
    const value = obj[key];
    const result = validator(value);

    if (result !== true) {
      errors.push(typeof result === 'string' ? result : `${key} is invalid`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
