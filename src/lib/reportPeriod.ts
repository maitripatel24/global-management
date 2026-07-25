export const REPORT_PERIODS = {
  week: { label: "This week", days: 6 },
  month: { label: "This month", days: 29 },
  year: { label: "This year", days: 364 },
} as const;

export type ReportPeriodKey = keyof typeof REPORT_PERIODS;

export function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function resolveReportPeriod(period?: string) {
  const activePeriod: ReportPeriodKey = period && period in REPORT_PERIODS ? (period as ReportPeriodKey) : "week";
  const today = startOfDay(new Date());
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - REPORT_PERIODS[activePeriod].days);
  const toDate = today;
  const rangeEnd = new Date(toDate);
  rangeEnd.setHours(23, 59, 59, 999);
  const totalDaysInRange = REPORT_PERIODS[activePeriod].days + 1;
  return { activePeriod, fromDate, toDate, rangeEnd, totalDaysInRange };
}
