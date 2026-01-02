/**
 * Currency formatting utilities with locale support
 */

export type CurrencyLocale = "en" | "pt";

interface CurrencyFormatOptions {
  locale: CurrencyLocale;
  value: number;
}

/**
 * Format currency based on locale
 * - English (en): $1,234.56
 * - Portuguese (pt): R$ 1 234,56 (space as thousand separator, comma as decimal)
 */
export function formatCurrency({ locale, value }: CurrencyFormatOptions): string {
  if (locale === "pt") {
    // Brazilian Real formatting: R$ 1 234,56
    // Use custom formatting because Intl.NumberFormat doesn't support space as thousand separator
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    
    // Split into integer and decimal parts
    const [integerPart, decimalPart = "00"] = absValue.toFixed(2).split(".");
    
    // Add space as thousand separator
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    
    // Combine with comma as decimal separator
    const formatted = `R$ ${formattedInteger},${decimalPart}`;
    
    return isNegative ? `-${formatted}` : formatted;
  } else {
    // English (US Dollar): $1,234.56
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }
}

/**
 * Parse currency string to number (removes formatting)
 */
export function parseCurrency(value: string, locale: CurrencyLocale = "en"): number {
  if (locale === "pt") {
    // Remove R$, spaces, and replace comma with dot
    const cleaned = value
      .replace(/R\$\s?/g, "")
      .replace(/\s/g, "")
      .replace(/,/g, ".");
    return parseFloat(cleaned) || 0;
  } else {
    // Remove $, commas
    const cleaned = value.replace(/[$,]/g, "");
    return parseFloat(cleaned) || 0;
  }
}

