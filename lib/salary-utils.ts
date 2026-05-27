import type { SalaryReport } from './data';

export const MODALITY_LABELS: Record<SalaryReport['modality'], string> = {
  en_blanco: 'En blanco',
  en_negro: 'En negro',
  monotributo: 'Monotributo',
  autonomo: 'Autonomo',
};

export const WORKLOAD_LABELS: Record<NonNullable<SalaryReport['workload']>, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  por_horas: 'Por horas / Proyecto',
};

export const SENIORITY_LABELS: Record<SalaryReport['seniority'], string> = {
  junior: 'Junior',
  semi: 'Semi Sr',
  senior: 'Senior',
  no_aplica: 'No aplica',
};

export const MIN_REASONABLE_SALARY = 50000;
export const MAX_REASONABLE_SALARY = 20000000;

export function formatMoney(value: number) {
  return `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

export function formatReportDate(timestamp: number) {
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86400000));

  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} dias`;

  const months = Math.floor(days / 30);
  if (months === 1) return 'hace 1 mes';
  if (months < 12) return `hace ${months} meses`;

  const years = Math.floor(months / 12);
  return years === 1 ? 'hace 1 anio' : `hace ${years} anios`;
}

function percentile(sortedAmounts: number[], percentileValue: number) {
  if (sortedAmounts.length === 0) return 0;
  if (sortedAmounts.length === 1) return sortedAmounts[0];

  const index = (sortedAmounts.length - 1) * percentileValue;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sortedAmounts[lower] * (1 - weight) + sortedAmounts[upper] * weight;
}

export function getMedian(sortedAmounts: number[]) {
  return percentile(sortedAmounts, 0.5);
}

export function getSalaryStats(reports: SalaryReport[]) {
  const validReports = reports.filter(report => (
    Number.isFinite(report.amountMonthly) &&
    report.amountMonthly >= MIN_REASONABLE_SALARY &&
    report.amountMonthly <= MAX_REASONABLE_SALARY
  ));

  const rawAmounts = validReports.map(report => report.amountMonthly).sort((a, b) => a - b);
  const rawMedian = getMedian(rawAmounts);

  const cleanedReports = validReports.filter(report => {
    if (rawMedian <= 0 || rawAmounts.length < 4) return true;
    return report.amountMonthly >= rawMedian * 0.25 && report.amountMonthly <= rawMedian * 4;
  });

  const amounts = cleanedReports.map(report => report.amountMonthly).sort((a, b) => a - b);
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  const average = amounts.length > 0 ? total / amounts.length : 0;
  const median = getMedian(amounts);
  const min = amounts.length > 0 ? amounts[0] : 0;
  const max = amounts.length > 0 ? amounts[amounts.length - 1] : 0;

  return {
    average,
    median,
    min,
    max,
    count: amounts.length,
    rawCount: reports.length,
    ignoredCount: reports.length - amounts.length,
    hasEnoughData: amounts.length >= 3,
    reports: cleanedReports,
  };
}

