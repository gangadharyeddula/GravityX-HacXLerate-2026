export const COUNTRY_CURRENCY_MAP = {
  India: { currency: 'INR', symbol: '₹', rate: 83 },
  'United Kingdom': { currency: 'GBP', symbol: '£', rate: 0.78 },
  'United States': { currency: 'USD', symbol: '$', rate: 1 },
  'European Union': { currency: 'EUR', symbol: '€', rate: 0.93 },
  Australia: { currency: 'AUD', symbol: 'A$', rate: 1.51 },
  Canada: { currency: 'CAD', symbol: 'C$', rate: 1.36 },
  Japan: { currency: 'JPY', symbol: '¥', rate: 157 },
};

export const COUNTRY_OPTIONS = Object.keys(COUNTRY_CURRENCY_MAP);

export function convertBaseRateToLocalPrice(baseUsdPrice, country = 'United States') {
  const config = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP['United States'];
  return Math.round(Number(baseUsdPrice || 0) * config.rate);
}

export function formatLocalCurrencyDisplay(baseUsdPrice, country = 'United States') {
  const value = convertBaseRateToLocalPrice(baseUsdPrice, country);
  const config = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP['United States'];
  return `${config.symbol}${value.toLocaleString()}`;
}
