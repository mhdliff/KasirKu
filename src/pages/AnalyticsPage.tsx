import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { useAnalytics } from '../hooks/useTransactions';
import { useIsMobile } from '../hooks/useIsMobile';
import { formatRupiah, getGrowthLabel } from '../lib/utils';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, Calendar, BarChart3, RefreshCw } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#D9821C','#3C8160','#2E6B73','#C2562E','#BD4438','#A8651A'];

function GrowthBadge({ value }: { value: number }) {
  const isUp = value > 0, isDown = value < 0;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 100,
      background: isUp ? 'rgba(16,185,129,0.1)' : isDown ? 'rgba(239,68,68,0.1)' : 'var(--gray-100)',
      border: `1px solid ${isUp ? 'rgba(16,185,129,0.2)' : isDown ? 'rgba(239,68,68,0.2)' : 'var(--gray-200)'}`,
      fontSize: 11, fontWeight: 700,
      color: isUp ? 'var(--accent-emerald)' : isDown ? 'var(--accent-rose)' : 'var(--gray-500)',
    }}>
      {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : <Minus size={11} />}
      {getGrowthLabel(value)}
    </div>
  );
}

function CompareCard({ title, currentVal, prevVal, growth, currentLabel, prevLabel }: {
  title: string; currentVal: number; prevVal: number; growth: number; currentLabel: string; prevLabel: string;
}) {
  const pct = currentVal + prevVal > 0 ? Math.round((currentVal / (currentVal + prevVal)) * 100) : 50;
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>{title}</div>
        <GrowthBadge value={growth} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-200)', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 10, color: 'var(--brand-700)', fontWeight: 600, marginBottom: 2 }}>{currentLabel}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--brand-700)' }}>{formatRupiah(currentVal)}</div>
        </div>
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 10, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 2 }}>{prevLabel}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-600)' }}>{formatRupiah(prevVal)}</div>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const { summary, topProducts, dailyRevenue, loading, fetchAnalytics, calcGrowth } = useAnalytics();
  const isMobile = useIsMobile();

  const todayGrowth = summary ? calcGrowth(summary.today_revenue, summary.yesterday_revenue)       : 0;
  const monthGrowth = summary ? calcGrowth(summary.this_month_revenue, summary.last_month_revenue) : 0;
  const yearGrowth  = summary ? calcGrowth(summary.this_year_revenue, summary.last_year_revenue)   : 0;

  const pieData = topProducts.slice(0, 5).map(p => ({
    name: p.product_name.length > 14 ? p.product_name.slice(0, 14) + '…' : p.product_name,
    value: p.total_revenue,
  }));

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <div className="page-title">Analitik</div>
            <div className="page-subtitle">Perbandingan performa penjualan</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw size={13} style={loading ? { animation: 'spin 0.8s linear infinite' } : {}} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="page-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="stat-grid">
                <div className="stat-card blue">
                  <div className="stat-icon blue"><DollarSign size={18} /></div>
                  <div className="stat-label">Hari Ini</div>
                  <div className="stat-value">{formatRupiah(summary?.today_revenue || 0)}</div>
                  <GrowthBadge value={todayGrowth} />
                </div>
                <div className="stat-card green">
                  <div className="stat-icon green"><Calendar size={18} /></div>
                  <div className="stat-label">Bulan Ini</div>
                  <div className="stat-value">{formatRupiah(summary?.this_month_revenue || 0)}</div>
                  <GrowthBadge value={monthGrowth} />
                </div>
                <div className="stat-card amber">
                  <div className="stat-icon amber"><BarChart3 size={18} /></div>
                  <div className="stat-label">Tahun Ini</div>
                  <div className="stat-value">{formatRupiah(summary?.this_year_revenue || 0)}</div>
                  <GrowthBadge value={yearGrowth} />
                </div>
                <div className="stat-card violet">
                  <div className="stat-icon violet"><ShoppingCart size={18} /></div>
                  <div className="stat-label">Transaksi Bulan</div>
                  <div className="stat-value">{summary?.total_transactions || 0}</div>
                  <span className="stat-growth flat"><Minus size={11} /> total</span>
                </div>
              </div>

              {/* Comparison cards — 1 col on mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <CompareCard title="Hari ini vs Kemarin"   currentVal={summary?.today_revenue || 0}      prevVal={summary?.yesterday_revenue || 0}   growth={todayGrowth} currentLabel="Hari Ini"   prevLabel="Kemarin" />
                <CompareCard title="Bulan ini vs Lalu"     currentVal={summary?.this_month_revenue || 0} prevVal={summary?.last_month_revenue || 0}  growth={monthGrowth} currentLabel="Bulan Ini"  prevLabel="Bulan Lalu" />
                <CompareCard title="Tahun ini vs Lalu"     currentVal={summary?.this_year_revenue || 0}  prevVal={summary?.last_year_revenue || 0}   growth={yearGrowth}  currentLabel="Tahun Ini"  prevLabel="Tahun Lalu" />
              </div>

              {/* Area chart — full width */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <div className="card-title">Pendapatan Harian (30 Hari)</div>
                </div>
                <div className="card-body" style={{ paddingTop: 8 }}>
                  <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
                    <AreaChart data={dailyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="var(--brand-500)" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} interval={isMobile ? 6 : 4} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}K`} width={36} />
                      <Tooltip contentStyle={{ background: 'var(--gray-900)', border: 'none', borderRadius: 8, fontSize: 12, color: 'white' }} formatter={(v: number) => [formatRupiah(v), 'Pendapatan']} />
                      <Area type="monotone" dataKey="revenue" stroke="var(--brand-500)" strokeWidth={2.5} fill="url(#aGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom charts — stack on mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Top Products */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">🏆 Produk Terlaris Bulan Ini</div>
                  </div>
                  {topProducts.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📦</div><div className="empty-title">Belum ada data</div></div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Produk</th>
                            <th style={{ textAlign: 'right' }}>Terjual</th>
                            <th style={{ textAlign: 'right' }}>Omzet</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.map((p, i) => (
                            <tr key={p.product_id}>
                              <td>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 800,
                                  background: i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f9' : 'var(--gray-100)',
                                  color: i === 0 ? '#92400e' : 'var(--gray-500)',
                                }}>{i + 1}</span>
                              </td>
                              <td style={{ fontWeight: 600 }}>{p.product_name}</td>
                              <td style={{ textAlign: 'right' }}><span className="badge badge-blue">{p.total_qty}</span></td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-600)' }}>{formatRupiah(p.total_revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Bar chart transactions */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Transaksi per Hari (14 Hari)</div>
                  </div>
                  <div className="card-body" style={{ paddingTop: 8 }}>
                    <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
                      <BarChart data={dailyRevenue.slice(-14)} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: 'var(--gray-900)', border: 'none', borderRadius: 8, fontSize: 12, color: 'white' }} formatter={(v: number) => [v, 'Transaksi']} />
                        <Bar dataKey="transactions" fill="var(--accent-violet)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
