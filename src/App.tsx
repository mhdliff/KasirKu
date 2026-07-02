import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './components/ui/Toast';
import { LandingPage } from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { POSPage } from './pages/POSPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { supabaseConfigured } from './lib/supabase';
import './styles/globals.css';

// ── Loading Screen ───────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: 'var(--full-h)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#15100B', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(246,230,200,0.12)',
        borderTopColor: '#D9821C',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: 'rgba(251,243,230,0.35)', fontFamily: 'sans-serif' }}>Memuat Tokoku...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Setup Warning (no .env) ──────────────────────────────────
function SetupWarning() {
  const codeStyle = { background: 'rgba(246,230,200,0.08)', padding: '2px 6px', borderRadius: 4 };
  return (
    <div style={{ minHeight: 'var(--full-h)', background: '#15100B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ background: 'rgba(246,230,200,0.035)', border: '1px solid rgba(189,68,56,0.3)', borderRadius: 22, padding: '36px 32px', maxWidth: 520, width: '100%' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#FBF3E6', marginBottom: 10 }}>Supabase belum dikonfigurasi</h2>
        <p style={{ color: 'rgba(251,243,230,0.5)', fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>
          File <code style={codeStyle}>.env</code> belum diisi. Ikuti langkah berikut untuk menjalankan Tokoku:
        </p>
        <ol style={{ color: 'rgba(251,243,230,0.6)', fontSize: 13.5, lineHeight: 2.1, paddingLeft: 20 }}>
          <li>Buat project di <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: '#EFB458' }}>supabase.com</a></li>
          <li>Jalankan <code style={codeStyle}>supabase_schema.sql</code> di SQL Editor</li>
          <li>Salin <code style={codeStyle}>.env.example</code> jadi <code style={codeStyle}>.env</code></li>
          <li>Isi <code style={codeStyle}>VITE_SUPABASE_URL</code> dan <code style={codeStyle}>VITE_SUPABASE_ANON_KEY</code></li>
          <li>Jalankan ulang <code style={codeStyle}>npm run dev</code></li>
        </ol>
        <div style={{ marginTop: 24, background: 'rgba(217,130,28,0.08)', border: '1px solid rgba(217,130,28,0.22)', borderRadius: 11, padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'rgba(251,243,230,0.55)' }}>
          # .env<br />
          VITE_SUPABASE_URL=https://xxxx.supabase.co<br />
          VITE_SUPABASE_ANON_KEY=eyJhbGci...
        </div>
      </div>
    </div>
  );
}

// ── Error Boundary ───────────────────────────────────────────
import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: '' };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error: error.message }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Tokoku Error:', error, info); }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: 'var(--full-h)', background: '#15100B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
          <div style={{ background: 'rgba(246,230,200,0.035)', border: '1px solid rgba(189,68,56,0.28)', borderRadius: 20, padding: '32px', maxWidth: 480, width: '100%' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💥</div>
            <h2 style={{ color: '#FBF3E6', fontSize: 18, marginBottom: 8 }}>Terjadi Error</h2>
            <p style={{ color: 'rgba(251,243,230,0.4)', fontSize: 13, marginBottom: 16 }}>{this.state.error}</p>
            <p style={{ color: 'rgba(251,243,230,0.3)', fontSize: 12, marginBottom: 20 }}>
              Buka <strong style={{ color: 'rgba(251,243,230,0.55)' }}>DevTools → Console</strong> untuk detail error.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: 'linear-gradient(135deg, #E69A2E, #BD6912)', color: '#20140A', border: 'none', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Route Guards ─────────────────────────────────────────────
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ── Routes ───────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/pos"        element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
      <Route path="/products"   element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
      <Route path="/analytics"  element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ── Root App ─────────────────────────────────────────────────
export default function App() {
  if (!supabaseConfigured) return <SetupWarning />;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
