export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const validateNumber = (
  value: string | number,
  min = 0,
  max = Infinity
): { valid: boolean; value: number } => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return { valid: false, value: 0 };
  }
  if (num < min || num > max) {
    return { valid: false, value: 0 };
  }
  return { valid: true, value: num };
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
