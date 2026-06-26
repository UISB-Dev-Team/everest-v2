export const generateBillingPeriods = (semester: string, academicYear: string): string[] => {
  if (!semester || !academicYear) return [];
  const [startYear, endYear] = academicYear.split("-");

  if (semester === "1st") {
    return [
      `August ${startYear}`,
      `September ${startYear}`,
      `October ${startYear}`,
      `November ${startYear}`,
      `December ${startYear}`,
      `August - December ${startYear}`,
    ];
  }
  if (semester === "2nd") {
    return [
      `January ${endYear}`,
      `February ${endYear}`,
      `March ${endYear}`,
      `April ${endYear}`,
      `May ${endYear}`,
      `January - May ${endYear}`,
    ];
  }
  if (semester === "Summer") {
    return [
      `June ${endYear}`,
      `July ${endYear}`,
      `June - July ${endYear}`,
    ];
  }
  return [];
};

/**
 * Wraps a billing period string for safe CSV export.
 * Prevents Excel/Sheets from auto-formatting "June 2026" → "Jun-2026".
 * Usage: when writing a CSV cell, use csvSafe(period) instead of period.
 */
export const csvSafe = (value: string): string => `="${value}"`;