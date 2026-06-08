export const getBillingPeriodLabel = (billingPeriod: string): string => {
  
  if (billingPeriod.includes("semester")) {
    const match = billingPeriod.match(/\d(?:st|nd)-semester\s*\((.*?)\)/);
    if (match) {
      return `${billingPeriod.substring(0, billingPeriod.indexOf("(") - 1)} (${match[1]})`;
    }
    return billingPeriod;
  }

  if (/^\d{4}-\d{2}$/.test(billingPeriod)) {
    const [year, month] = billingPeriod.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  }

  return billingPeriod;
};
