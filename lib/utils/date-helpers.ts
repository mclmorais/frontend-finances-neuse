export interface MonthYear {
  year: string;
  month: string;
}

/**
 * Generate a range of months starting from offset months before/after current month
 * @param startOffset - Number of months before current (negative) or after (positive)
 * @param endOffset - Number of months before current (negative) or after (positive)
 * @returns Array of {year, month} objects
 */
export function generateMonthRange(startOffset: number, endOffset: number): MonthYear[] {
  const months: MonthYear[] = [];
  const now = new Date();

  for (let i = startOffset; i <= endOffset; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    months.push({ year, month });
  }

  return months;
}

/**
 * Format a month-year object as a readable string
 * Shows only month name if it's the current year, otherwise shows "Month Year"
 * @param monthYear - The month-year object to format
 * @param currentYear - The current year for comparison
 * @returns Formatted string like "January" or "Jan 2024"
 */
export function formatMonthYear(monthYear: MonthYear, currentYear: string): string {
  const monthIndex = parseInt(monthYear.month, 10) - 1;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthName = monthYear.year === currentYear
    ? monthNames[monthIndex]
    : monthNamesShort[monthIndex];

  return monthYear.year === currentYear
    ? monthName
    : `${monthName} ${monthYear.year}`;
}

/**
 * Check if two month-year objects represent the same month
 * @param a - First month-year object
 * @param b - Second month-year object
 * @returns True if they represent the same month and year
 */
export function isSameMonth(a: MonthYear | null, b: MonthYear | null): boolean {
  if (!a || !b) return false;
  return a.year === b.year && a.month === b.month;
}

/**
 * Get the current month-year as an object
 * @returns Current month-year object
 */
export function getCurrentMonthYear(): MonthYear {
  const now = new Date();
  return {
    year: now.getFullYear().toString(),
    month: (now.getMonth() + 1).toString().padStart(2, '0')
  };
}
