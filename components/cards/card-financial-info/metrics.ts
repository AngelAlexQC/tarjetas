import type { Card } from '@/repositories';

export interface CardMetrics {
  usagePercentage: number;
  availableCredit: number;
  dailyPurchaseLimit: number;
  dailyATMLimit: number;
  todaySpent: number;
  dailySpentPercentage: number;
  spendingLimit: number;
  isReloadable: boolean;
  minimumPayment: number;
  isPaymentSoon: boolean;
  nextPaymentDate: Date;
  usageColors: { bg: string; fg: string };
  dailySpentColors: { bg: string; fg: string };
  heroColor: string;
  baseOrder: number;
}

export function calculateCardMetrics(
  card: Card,
  isCredit: boolean,
  balance: number,
  creditLimit: number,
  usedCredit: number,
  nextPaymentDays: number,
  primaryColor: string
): CardMetrics {
  const isDebit = card.cardType === 'debit';
  const isVirtual = card.cardType === 'virtual';
  
  const usagePercentage = isCredit && creditLimit > 0 
    ? Math.round((usedCredit / creditLimit) * 100) 
    : 0;
  const availableCredit = isCredit ? creditLimit - usedCredit : balance;
  
  const dailyPurchaseLimit = isDebit ? 5000 : 0;
  const dailyATMLimit = isDebit ? 2000 : 0;
  const todaySpent = isDebit ? 1250 : 0;
  const dailySpentPercentage = dailyPurchaseLimit > 0 
    ? Math.round((todaySpent / dailyPurchaseLimit) * 100) 
    : 0;
  
  const spendingLimit = isVirtual ? 3000 : 0;
  const isReloadable = isVirtual;
  
  const minimumPayment = isCredit && creditLimit > 0 ? usedCredit * 0.05 : 0;
  const isPaymentSoon = isCredit && nextPaymentDays <= 5;

  const nextPaymentDate = new Date();
  nextPaymentDate.setDate(nextPaymentDate.getDate() + nextPaymentDays);
  nextPaymentDate.setHours(9, 0, 0, 0);

  const getUsageColor = () => ({ bg: `${primaryColor}20`, fg: primaryColor });
  
  const usageColors = getUsageColor();
  const dailySpentColors = getUsageColor();
  const heroColor = primaryColor;
  const baseOrder = card.cardType === 'credit' ? 100 : card.cardType === 'debit' ? 200 : 300;

  return {
    usagePercentage,
    availableCredit,
    dailyPurchaseLimit,
    dailyATMLimit,
    todaySpent,
    dailySpentPercentage,
    spendingLimit,
    isReloadable,
    minimumPayment,
    isPaymentSoon,
    nextPaymentDate,
    usageColors,
    dailySpentColors,
    heroColor,
    baseOrder,
  };
}
