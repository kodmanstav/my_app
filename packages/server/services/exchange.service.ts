// packages/server/services/exchange.service.ts
const rates: Record<string, number> = {
   USD: 3.75,
   EUR: 4.05,
   GBP: 4.75,
   ILS: 1,
};

export function getExchangeRate(currencyCode: string): string {
   const code = currencyCode.trim().toUpperCase();
   const rate = rates[code];

   if (!rate) return `Unknown currency code: ${code}. Try USD/EUR/GBP.`;
   return `Official ${code} rate is ${rate} ILS.`;
}
