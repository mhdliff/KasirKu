import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useTransactions';
import { useIsMobile } from '../hooks/useIsMobile';
import { formatRupiah, getGrowthLabel } from '../lib/utils';
import { DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function GrowthBadge({ growth, label }: { growth: number; label: string }) {
  const isUp = growth > 0, isDown = growth < 0;
  return (
    <span className={`stat-growth ${isUp ? 'up' : isDown ? 'down' : 'flat'}`}>
      {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
      {getGrowthLabel(growth)} {label}
    </span>
  );
}

export function DashboardPage() {
  const { profile }                                         = useAuth();
  const { summary, topProducts, dailyRevenue, loading, calcGrowth } = useAnalytics();
  const navigate                                            = useNavigate();
  const isMobile                                           = useIsMobile();

  const todayGrowth = summary ? calcGrowth(summary.today_revenue, summary.yesterday_revenue)        : 0;
  const monthGrowth = summary ? calcGrowth(summary.this_month_revenue, summary.last_month_revenue)  : 0;
  const yearGrowth  = summary ? calcGrowth(summary.this_year_revenue, summary.last_year_revenue)    : 0;

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <div className="page-title">
              {isMobile ? `Hi, ${profile?.shop_name?.split(' ')[0] || 'Toko'} 👋` : `Selamat Datang, ${profile?.shop_name || 'Toko'} 👋`}
            </div>
            <div className="page-subtitle">Ringkasan bisnis hari ini</div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/pos')}>
            <ShoppingCart size={15} />
            <span>Buka Kasir</span>
          </button>
        </div>

        <div className="page-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="stat-grid">
                <div className="stat-card blue">
                  <div className="stat-icon blue"><DollarSign size={19} /></div>
                  <div className="stat-label">Hari Ini</div>
                  <div className="stat-value">{formatRupiah(summary?.today_revenue || 0)}</div>
                  <GrowthBadge growth={todayGrowth} label="vs kemarin" />
                </div>
                <div className="stat-card green">
                  <div className="stat-icon green"><ShoppingCart size={19} /></div>
                  <div className="stat-label">Transaksi Hari Ini</div>
                  <div className="stat-value">{summary?.today_transactions || 0}</div>
                  <span className="stat-growth flat"><Minus size={12} /> total hari ini</span>
                </div>
                <div className="stat-card amber">
                  <div className="stat-icon amber"><TrendingUp size={19} /></div>
                  <div className="stat-label">Bulan Ini</div>
                  <div className="stat-value">{formatRupiah(summary?.this_month_revenue || 0)}</div>
                  <GrowthBadge growth={monthGrowth} label="vs bulan lalu" />
                </div>
                <div className="stat-card violet">
                  <div className="stat-icon violet"><Package size={19} /></div>
                  <div className="stat-label">Tahun Ini</div>
                  <div className="stat-value">{formatRupiah(summary?.this_year_revenue || 0)}</div>
                  <GrowthBadge growth={yearGrowth} label="vs tahun lalu" />
                </div>
              </div>

              {/* Charts Row — stacks on mobile */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
                gap: 16, marginBottom: 16,
              }}>
                {/* Revenue Chart */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Tren Pendapatan (30 Hari)</div>
                  </div>
                  <div className="card-body" style={{ paddingTop: 8 }}>
                    <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
                      <AreaChart data={dailyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="var(--brand-500)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} interval={isMobile ? 6 : 4} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}K`} width={36} />
                        <Tooltip
                          contentStyle={{ background: 'var(--gray-900)', border: 'none', borderRadius: 8, fontSize: 12, color: 'white' }}
                          formatter={(v: number) => [formatRupiah(v), 'Pendapatan']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="var(--brand-500)" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Products — hidden on mobile to save space */}
                {!isMobile && (
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">Produk Terlaris</div>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/analytics')}>
                        Lihat <ArrowRight size={12} />
                      </button>
                    </div>
                    <div className="card-body" style={{ padding: '10px 14px' }}>
                      {topProducts.length === 0 ? (
                        <div className="empty-state" style={{ padding: '24px 0' }}>
                          <div className="empty-icon" style={{ fontSize: 32 }}>📦</div>
                          <div className="empty-title" style={{ fontSize: 13 }}>Belum ada data</div>
                        </div>
                      ) : topProducts.slice(0, 6).map((p, i) => (
                        <div key={p.product_id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', minWidth: 16 }}>{i + 1}.</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product_name}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--gray-500)' }}>{p.total_qty} terjual</div>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--brand-700)', flexShrink: 0 }}>{formatRupiah(p.total_revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
                gap: isMobile ? 10 : 12,
              }}>
                {[
                  { label: 'Kasir',    desc: 'Proses transaksi',  path: '/pos',        icon: '🛒' },
                  { label: 'Produk',   desc: 'Kelola inventori',  path: '/products',   icon: '📦' },
                  { label: 'Analitik', desc: 'Laporan lengkap',   path: '/analytics',  icon: '📊' },
                ].map(action => (
                  <div
                    key={action.path}
                    className="card"
                    style={{ padding: isMobile ? '14px 12px' : '16px 18px', cursor: 'pointer', transition: 'all 200ms' }}
                    onClick={() => navigate(action.path)}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                  >
                    <div style={{ fontSize: isMobile ? 22 : 24, marginBottom: 8 }}>{action.icon}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 13 : 14, fontWeight: 700, color: 'var(--gray-900)' }}>{action.label}</div>
                    {!isMobile && <div style={{ fontSize: 12.5, color: 'var(--gray-500)', marginTop: 2 }}>{action.desc}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
