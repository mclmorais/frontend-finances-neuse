import { format as dateFnsFormat, Locale } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";

export type DateLocale = "en" | "pt";

/**
 * Get date-fns locale object from locale string
 */
function getDateFnsLocale(locale: DateLocale): Locale {
  return locale === "pt" ? ptBR : enUS;
}

/**
 * Format date based on locale
 * - English (en): MM/dd/yyyy (e.g., 12/31/2024)
 * - Portuguese (pt): dd/MM/yyyy (e.g., 31/12/2024)
 */
export function formatDate(date: Date | string, locale: DateLocale, formatStr?: string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const fnsLocale = getDateFnsLocale(locale);
  
  // If custom format string provided, use it
  if (formatStr) {
    return dateFnsFormat(dateObj, formatStr, { locale: fnsLocale });
  }
  
  // Default format based on locale
  const defaultFormat = locale === "pt" ? "dd/MM/yyyy" : "MM/dd/yyyy";
  return dateFnsFormat(dateObj, defaultFormat, { locale: fnsLocale });
}

/**
 * Format date in short format (e.g., "Jan 15, 2024" or "15 de jan, 2024")
 */
export function formatDateShort(date: Date | string, locale: DateLocale): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const fnsLocale = getDateFnsLocale(locale);
  
  const formatStr = locale === "pt" ? "dd 'de' MMM, yyyy" : "MMM dd, yyyy";
  return dateFnsFormat(dateObj, formatStr, { locale: fnsLocale });
}

/**
 * Format month and year (e.g., "December 2024" or "dezembro de 2024")
 */
export function formatMonthYear(date: Date | string, locale: DateLocale): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const fnsLocale = getDateFnsLocale(locale);
  
  const formatStr = locale === "pt" ? "MMMM 'de' yyyy" : "MMMM yyyy";
  return dateFnsFormat(dateObj, formatStr, { locale: fnsLocale });
}

/**
 * Format full date (e.g., "December 31, 2024" or "31 de dezembro de 2024")
 */
export function formatDateFull(date: Date | string, locale: DateLocale): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const fnsLocale = getDateFnsLocale(locale);
  
  const formatStr = locale === "pt" ? "dd 'de' MMMM 'de' yyyy" : "MMMM dd, yyyy";
  return dateFnsFormat(dateObj, formatStr, { locale: fnsLocale });
}

