const forexRates = {
  USD: 1, // Base
  INR: 83.50,
  EUR: 0.92,
  GBP: 0.79
};

// Assuming all database inputs natively normalize to USD when aggregated natively,
// or that the multiplier adapts the local DB output cleanly to their targeted aesthetic string.
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) return String(amount);

  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
};
