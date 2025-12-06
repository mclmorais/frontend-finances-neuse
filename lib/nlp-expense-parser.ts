import { Category, Account } from "./types";
import { format, subDays, addDays, parse, isValid } from "date-fns";

export interface ParsedExpense {
  description: string;
  amount: number | null;
  date: string | null;
  categoryId: number | null;
  accountId: number | null;
  categoryName?: string;
  accountName?: string;
}

/**
 * Simple Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Find best matching item from a list based on fuzzy search
 */
function fuzzyMatch<T extends { name: string; id: number }>(
  input: string,
  items: T[],
): T | null {
  const lowerInput = input.toLowerCase().trim();

  // First try exact match
  const exactMatch = items.find(
    (item) => item.name.toLowerCase() === lowerInput,
  );
  if (exactMatch) return exactMatch;

  // Try substring match
  const substringMatch = items.find((item) =>
    item.name.toLowerCase().includes(lowerInput),
  );
  if (substringMatch) return substringMatch;

  // Try fuzzy match with Levenshtein distance
  let bestMatch: T | null = null;
  let bestDistance = Infinity;

  for (const item of items) {
    const distance = levenshteinDistance(lowerInput, item.name.toLowerCase());
    const threshold = Math.max(3, Math.floor(item.name.length * 0.3)); // 30% tolerance

    if (distance < threshold && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = item;
    }
  }

  return bestMatch;
}

/**
 * Extract amount from text (e.g., "$50", "50", "50.99", "R$25")
 */
function extractAmount(
  text: string,
): { amount: number; cleanText: string } | null {
  // Match patterns like: $50, 50, 50.99, R$25, 25,50
  const patterns = [
    /\$\s*(\d+(?:[.,]\d{1,2})?)/i,
    /R\$\s*(\d+(?:[.,]\d{1,2})?)/i,
    /(\d+[.,]\d{1,2})/,
    /\b(\d+)\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amountStr = match[1].replace(",", ".");
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        const cleanText = text.replace(match[0], "").trim();
        return { amount, cleanText };
      }
    }
  }

  return null;
}

/**
 * Extract date from text
 */
export function extractDate(
  text: string,
): { date: string; cleanText: string } | null {
  const lowerText = text.toLowerCase();
  const today = new Date();

  // Relative dates
  if (lowerText.includes("hoje") || lowerText.includes("today")) {
    return {
      date: format(today, "yyyy-MM-dd"),
      cleanText: text.replace(/\b(hoje|today)\b/gi, "").trim(),
    };
  }

  if (lowerText.includes("ontem") || lowerText.includes("yesterday")) {
    return {
      date: format(subDays(today, 1), "yyyy-MM-dd"),
      cleanText: text.replace(/\b(ontem|yesterday)\b/gi, "").trim(),
    };
  }

  if (lowerText.includes("amanhã") || lowerText.includes("tomorrow")) {
    return {
      date: format(addDays(today, 1), "yyyy-MM-dd"),
      cleanText: text.replace(/\b(amanhã|tomorrow)\b/gi, "").trim(),
    };
  }

  // Try parsing specific dates (dd/mm, dd-mm, etc.)
  // Match dd/MM format
  const ddMMMatch = text.match(/\b(\d{1,2})[\/\-](\d{1,2})\b/);
  if (ddMMMatch) {
    try {
      const day = parseInt(ddMMMatch[1], 10);
      const month = parseInt(ddMMMatch[2], 10);
      const year = new Date().getFullYear();

      // Validate day and month
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        const parsedDate = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
        if (isValid(parsedDate)) {
          return {
            date: format(parsedDate, "yyyy-MM-dd"),
            cleanText: text.replace(ddMMMatch[0], "").trim(),
          };
        }
      }
    } catch {
      // Continue
    }
  }

  // Try parsing yyyy-MM-dd format
  const isoMatch = text.match(/\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/);
  if (isoMatch) {
    try {
      const parsedDate = parse(isoMatch[0], "yyyy-MM-dd", new Date());
      if (isValid(parsedDate)) {
        return {
          date: format(parsedDate, "yyyy-MM-dd"),
          cleanText: text.replace(isoMatch[0], "").trim(),
        };
      }
    } catch {
      // Continue
    }
  }

  return null;
}

/**
 * Parse natural language input into expense fields
 */
export function parseExpenseInput(
  input: string,
  categories: Category[],
  accounts: Account[],
): ParsedExpense {
  let workingText = input.trim();
  const result: ParsedExpense = {
    description: "",
    amount: null,
    date: null,
    categoryId: null,
    accountId: null,
  };

  // Extract amount
  const amountResult = extractAmount(workingText);
  if (amountResult) {
    result.amount = amountResult.amount;
    workingText = amountResult.cleanText;
  }

  // Extract date
  const dateResult = extractDate(workingText);
  if (dateResult) {
    result.date = dateResult.date;
    workingText = dateResult.cleanText;
  } else {
    // Default to today
    result.date = format(new Date(), "yyyy-MM-dd");
  }

  // Split remaining text into words for category/account matching
  const words = workingText.split(/\s+/).filter((w) => w.length > 0);
  const usedWordIndices: Set<number> = new Set();

  // Try to match category
  for (let i = 0; i < words.length; i++) {
    if (usedWordIndices.has(i)) continue;

    const match = fuzzyMatch(words[i], categories);
    if (match) {
      result.categoryId = match.id;
      result.categoryName = match.name;
      usedWordIndices.add(i);
      break;
    }
  }

  // Try to match account
  for (let i = 0; i < words.length; i++) {
    if (usedWordIndices.has(i)) continue;

    const match = fuzzyMatch(words[i], accounts);
    if (match) {
      result.accountId = match.id;
      result.accountName = match.name;
      usedWordIndices.add(i);
      break;
    }
  }

  // Remaining words form the description
  const descriptionWords = words.filter((_, i) => !usedWordIndices.has(i));
  result.description = descriptionWords.join(" ");

  return result;
}
