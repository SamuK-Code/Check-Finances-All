import { useMemo } from 'react';

export function useFilteredExpenses(expenses, period, type = 'all', cardId = 'all') {
  return useMemo(() => {
    let filtered = expenses;
    const now = new Date();

    if (period !== 'all') {
      filtered = filtered.filter(e => {
        const d = new Date(e.date);
        if (period === 'today') return d.toDateString() === now.toDateString();
        if (period === 'week') return d >= new Date(now - 7 * 24 * 60 * 60 * 1000);
        if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (period === 'year') return d.getFullYear() === now.getFullYear();
        return true;
      });
    }

    if (type === 'card') filtered = filtered.filter(e => e.cardId && !e.isBill);
    else if (type === 'standalone') filtered = filtered.filter(e => !e.cardId && !e.isBill);
    else if (type === 'bill') filtered = filtered.filter(e => e.isBill);

    if (cardId !== 'all') filtered = filtered.filter(e => e.cardId === cardId);

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, period, type, cardId]);
}

export function useFilteredCash(cashTransactions, period) {
  return useMemo(() => {
    let filtered = cashTransactions || [];
    const now = new Date();

    if (period !== 'all') {
      filtered = filtered.filter(e => {
        const d = new Date(e.date);
        if (period === 'today') return d.toDateString() === now.toDateString();
        if (period === 'week') return d >= new Date(now - 7 * 24 * 60 * 60 * 1000);
        if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (period === 'year') return d.getFullYear() === now.getFullYear();
        return true;
      });
    }
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [cashTransactions, period]);
}
