/**
 * Validation & Sanitization Utilities
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
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
 * Sanitize numeric input
 */
export function sanitizeNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }

  return num < 0 ? 0 : num;
}

/**
 * Round number to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Validate staff name
 */
export function validateStaffName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Staff name is required' };
  }

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Staff name cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Staff name must be less than 100 characters' };
  }

  return { valid: true };
}

/**
 * Validate sales amount
 */
export function validateSales(sales: unknown): { valid: boolean; error?: string } {
  if (sales === null || sales === undefined) {
    return { valid: false, error: 'Sales amount is required' };
  }

  const num = Number(sales);
  if (isNaN(num)) {
    return { valid: false, error: 'Sales must be a valid number' };
  }

  if (num < 0) {
    return { valid: false, error: 'Sales cannot be negative' };
  }

  if (!isFinite(num)) {
    return { valid: false, error: 'Sales must be a finite number' };
  }

  return { valid: true };
}

/**
 * Validate target amount
 */
export function validateTarget(target: unknown): { valid: boolean; error?: string } {
  if (target === null || target === undefined) {
    return { valid: false, error: 'Target amount is required' };
  }

  const num = Number(target);
  if (isNaN(num)) {
    return { valid: false, error: 'Target must be a valid number' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Target must be greater than 0' };
  }

  if (!isFinite(num)) {
    return { valid: false, error: 'Target must be a finite number' };
  }

  return { valid: true };
}

/**
 * Validate percentage split (0-100)
 */
export function validatePercentage(value: unknown): { valid: boolean; error?: string } {
  if (value === null || value === undefined) {
    return { valid: false, error: 'Percentage is required' };
  }

  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Percentage must be a valid number' };
  }

  if (num < 0 || num > 100) {
    return { valid: false, error: 'Percentage must be between 0 and 100' };
  }

  return { valid: true };
}

/**
 * Format currency value
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
 * Format percentage value
 */
export function formatPercentage(value: number): string {
  return `${roundTo(value, 2)}%`;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Clean and validate JSON
 */
export function validateJSON(json: string): { valid: boolean; error?: string; data?: unknown } {
  try {
    const data = JSON.parse(json);
    return { valid: true, data };
  } catch (err) {
    return { valid: false, error: 'Invalid JSON format' };
  }
}
