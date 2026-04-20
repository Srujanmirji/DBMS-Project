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

  // Dynamic Multiplier Engine based on preferred currency
  const multiplier = forexRates[currencyCode] || 1;
  const dynamicallyConvertedAmount = numericAmount * (currencyCode !== 'USD' ? multiplier : 1);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dynamicallyConvertedAmount);
};
