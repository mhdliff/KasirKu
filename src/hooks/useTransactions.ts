import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, CartItem, AnalyticsSummary, TopProduct, DailyRevenue } from '../types';
import { useAuth } from './useAuth';
import { calcDiscountedPrice } from '../lib/utils';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth,
         startOfYear, endOfYear, subDays, subMonths, subYears } from 'date-fns';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*, transaction_details(*, products(name, image_path))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setTransactions((data as unknown as Transaction[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const generateTransactionNumber = (): string => {
    const now     = new Date();
    const datePart = format(now, 'yyyyMMdd');
    const timePart = format(now, 'HHmmss');
    const rand     = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TRX-${datePart}-${timePart}-${rand}`;
  };

  const checkout = async (cart: CartItem[], paymentAmount: number) => {
    if (!user || cart.length === 0) return { error: 'Cart is empty', data: null };

    const totalDiscount = cart.reduce((sum, item) => {
      const base = item.product.price;
      const disc = calcDiscountedPrice(base, item.product.discount_percent, item.product.discount_nominal);
      return sum + ((base - disc) * item.quantity);
    }, 0);

    const subtotal   = cart.reduce((sum, item) => {
      const disc    = calcDiscountedPrice(item.product.price, item.product.discount_percent, item.product.discount_nominal);
      return sum + (disc + item.optionTotal) * item.quantity;
    }, 0);

    const totalPrice  = subtotal;
    const changeAmount = paymentAmount - totalPrice;
    const txnNumber   = generateTransactionNumber();

    const { data: txn, error: txnError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_number: txnNumber,
        total_price: totalPrice,
        total_discount: totalDiscount,
        payment_amount: paymentAmount,
        change_amount: changeAmount,
      })
      .select()
      .single();

    if (txnError || !txn) return { error: txnError?.message || 'Gagal membuat transaksi', data: null };

    const details = cart.map(item => {
      const discPrice = calcDiscountedPrice(item.product.price, item.product.discount_percent, item.product.discount_nominal);
      const discAmount = item.product.price - discPrice;
      return {
        transaction_id:       txn.id,
        product_id:           item.product.id,
        quantity:             item.quantity,
        price_at_purchase:    item.product.price,
        discount_at_purchase: discAmount,
        options_total:        item.optionTotal,
        options_snapshot:     item.selectedOptions,
      };
    });

    const { error: detailsError } = await supabase.from('transaction_details').insert(details);
    if (detailsError) return { error: detailsError.message, data: null };

    fetchTransactions();
    return {
      error: null,
      data: {
        ...txn,
        changeAmount,
        transactionNumber: txnNumber,
      },
    };
  };

  return { transactions, loading, fetchTransactions, checkout };
}

/* ── Analytics hook ──────────────────────────────────────────── */
export function useAnalytics() {
  const { user }                          = useAuth();
  const [summary, setSummary]             = useState<AnalyticsSummary | null>(null);
  const [topProducts, setTopProducts]     = useState<TopProduct[]>([]);
  const [dailyRevenue, setDailyRevenue]   = useState<DailyRevenue[]>([]);
  const [loading, setLoading]             = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const now = new Date();

    const ranges = {
      today:      [startOfDay(now).toISOString(),             endOfDay(now).toISOString()],
      yesterday:  [startOfDay(subDays(now,1)).toISOString(),  endOfDay(subDays(now,1)).toISOString()],
      thisMonth:  [startOfMonth(now).toISOString(),           endOfMonth(now).toISOString()],
      lastMonth:  [startOfMonth(subMonths(now,1)).toISOString(), endOfMonth(subMonths(now,1)).toISOString()],
      thisYear:   [startOfYear(now).toISOString(),            endOfYear(now).toISOString()],
      lastYear:   [startOfYear(subYears(now,1)).toISOString(), endOfYear(subYears(now,1)).toISOString()],
    };

    const q = (start: string, end: string) =>
      supabase.from('transactions').select('total_price')
        .eq('user_id', user.id).gte('created_at', start).lte('created_at', end);

    const [td, yd, tm, lm, ty, ly] = await Promise.all([
      q(...ranges.today as [string,string]),
      q(...ranges.yesterday as [string,string]),
      q(...ranges.thisMonth as [string,string]),
      q(...ranges.lastMonth as [string,string]),
      q(...ranges.thisYear as [string,string]),
      q(...ranges.lastYear as [string,string]),
    ]);

    const sum = (d: { total_price: number }[] | null) =>
      (d || []).reduce((s, t) => s + Number(t.total_price), 0);

    setSummary({
      today_revenue:      sum(td.data),
      yesterday_revenue:  sum(yd.data),
      this_month_revenue: sum(tm.data),
      last_month_revenue: sum(lm.data),
      this_year_revenue:  sum(ty.data),
      last_year_revenue:  sum(ly.data),
      today_transactions: td.data?.length || 0,
      total_transactions: tm.data?.length || 0,
    });

    // Top products this month
    const { data: details } = await supabase
      .from('transaction_details')
      .select('product_id, quantity, price_at_purchase, options_total, transactions!inner(user_id, created_at), products(name)')
      .eq('transactions.user_id', user.id)
      .gte('transactions.created_at', ranges.thisMonth[0])
      .lte('transactions.created_at', ranges.thisMonth[1]);

    const map: Record<string, TopProduct> = {};
    (details || []).forEach((d: any) => {
      const pid = d.product_id;
      if (!map[pid]) map[pid] = { product_id: pid, product_name: d.products?.name || '?', total_qty: 0, total_revenue: 0 };
      map[pid].total_qty     += d.quantity;
      map[pid].total_revenue += d.quantity * (Number(d.price_at_purchase) + Number(d.options_total || 0));
    });
    setTopProducts(Object.values(map).sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 8));

    // Daily revenue last 30 days
    const last30 = startOfDay(subDays(now, 29)).toISOString();
    const { data: daily } = await supabase
      .from('transactions').select('total_price, created_at')
      .eq('user_id', user.id).gte('created_at', last30).order('created_at');

    const dailyMap: Record<string, DailyRevenue> = {};
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(now, i), 'MM/dd');
      dailyMap[d] = { date: d, revenue: 0, transactions: 0 };
    }
    (daily || []).forEach((t: any) => {
      const d = format(new Date(t.created_at), 'MM/dd');
      if (dailyMap[d]) { dailyMap[d].revenue += Number(t.total_price); dailyMap[d].transactions++; }
    });
    setDailyRevenue(Object.values(dailyMap));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const calcGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return { summary, topProducts, dailyRevenue, loading, fetchAnalytics, calcGrowth };
}
