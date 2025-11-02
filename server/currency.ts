import axios from "axios";

const EXCHANGE_RATE_API = "https://api.exchangerate.host";
const DEFAULT_CURRENCY = "GHS";

interface ExchangeRates {
  [key: string]: number;
}

let ratesCache: { rates: ExchangeRates; timestamp: number } | null = null;
const CACHE_DURATION = 3600000; // 1 hour

export async function getExchangeRates(base: string = DEFAULT_CURRENCY): Promise<ExchangeRates> {
  const now = Date.now();
  
  if (ratesCache && now - ratesCache.timestamp < CACHE_DURATION) {
    return ratesCache.rates;
  }

  try {
    const response = await axios.get(`${EXCHANGE_RATE_API}/latest?base=${base}`);
    const rates = response.data.rates;
    
    ratesCache = {
      rates,
      timestamp: now,
    };
    
    return rates;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return { [base]: 1 };
  }
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  if (from === to) return amount;
  
  const rates = await getExchangeRates(from);
  const rate = rates[to];
  
  if (!rate) {
    console.error(`No exchange rate found for ${from} to ${to}`);
    return amount;
  }
  
  return amount * rate;
}

export const SUPPORTED_CURRENCIES = ["GHS", "USD", "NGN", "EUR", "GBP"];
