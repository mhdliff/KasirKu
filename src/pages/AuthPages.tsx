import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Receipt, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{
      minHeight: 'var(--full-h)', background: '#15100B', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '18%', left: '16%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(217,130,28,0.10), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '14%', right: '12%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(60,129,96,0.08), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none', width: 'fit-content' }}>
          <ArrowLeft size={15} color="rgba(251,243,230,0.3)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 6 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(150deg, var(--brand-300), var(--brand-600))', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={15} color="#20140A" strokeWidth={2.4} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#FBF3E6' }}>Tokoku</span>
          </div>
        </Link>

        <div style={{
          background: 'rgba(246,230,200,0.035)', border: '1px solid rgba(246,230,200,0.09)',
          borderRadius: 24, padding: '34px 28px', backdropFilter: 'blur(20px)',
        }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#FBF3E6', marginBottom: 6, letterSpacing: '-0.4px' }}>{title}</h1>
          <p style={{ fontSize: 14, color: 'rgba(251,243,230,0.4)', marginBottom: 28 }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'rgba(246,230,200,0.05)', border: '1.5px solid rgba(246,230,200,0.12)',
  borderRadius: 11, color: '#FBF3E6', fontSize: 16, fontFamily: 'var(--font-body)', outline: 'none',
};

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await signIn(email, password);
    if (error) setError('Email atau kata sandi belum cocok. Coba lagi.');
    else navigate('/dashboard');
    setLoading(false);
  };

  return (
    <AuthLayout title="Selamat datang kembali" subtitle="Masuk untuk lanjut melayani pelanggan">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: 'rgba(189,68,56,0.12)', border: '1px solid rgba(189,68,56,0.25)', borderRadius: 11, padding: '11px 15px', marginBottom: 17, fontSize: 13, color: '#F0A99E' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(251,243,230,0.55)', marginBottom: 7 }}>Email</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="email@toko.com" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(217,130,28,0.55)'; e.target.style.boxShadow = '0 0 0 3.5px rgba(217,130,28,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(246,230,200,0.12)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(251,243,230,0.55)', marginBottom: 7 }}>Kata Sandi</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={e => { e.target.style.borderColor = 'rgba(217,130,28,0.55)'; e.target.style.boxShadow = '0 0 0 3.5px rgba(217,130,28,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(246,230,200,0.12)'; e.target.style.boxShadow = 'none'; }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(251,243,230,0.3)' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, var(--brand-400), var(--brand-600))',
            color: '#20140A', fontSize: 14.5, fontWeight: 700, fontFamily: 'var(--font-display)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 6px 20px rgba(217,130,28,0.32)', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
          {loading ? 'Memproses…' : 'Masuk ke Toko'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13.5, color: 'rgba(251,243,230,0.32)' }}>
          Belum punya toko di Tokoku?{' '}
          <Link to="/register" style={{ color: 'var(--brand-300)', fontWeight: 600, textDecoration: 'none' }}>Daftar gratis</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Kata sandi minimal 6 karakter.'); return; }
    setLoading(true); setError('');
    const { error } = await signUp(email, password, shopName);
    if (error) setError(error.message || 'Pendaftaran belum berhasil. Coba lagi.');
    else setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <AuthLayout title="Hampir selesai 🎉" subtitle="Tinggal satu langkah lagi">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 46, marginBottom: 14 }}>📬</div>
          <p style={{ color: 'rgba(251,243,230,0.5)', fontSize: 14, lineHeight: 1.75, marginBottom: 26 }}>
            Kami sudah mengirim tautan konfirmasi ke <strong style={{ color: '#FBF3E6' }}>{email}</strong>. Buka email itu untuk mengaktifkan toko Anda.
          </p>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>
            Lanjut ke Halaman Masuk
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Buka toko baru" subtitle="Gratis, dan siap dipakai dalam 5 menit">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: 'rgba(189,68,56,0.12)', border: '1px solid rgba(189,68,56,0.25)', borderRadius: 11, padding: '11px 15px', marginBottom: 17, fontSize: 13, color: '#F0A99E' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(251,243,230,0.55)', marginBottom: 7 }}>Nama Toko</label>
          <input
            type="text" required value={shopName} onChange={e => setShopName(e.target.value)}
            placeholder="Toko Berkah Jaya" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(217,130,28,0.55)'; e.target.style.boxShadow = '0 0 0 3.5px rgba(217,130,28,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(246,230,200,0.12)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(251,243,230,0.55)', marginBottom: 7 }}>Email</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="email@toko.com" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(217,130,28,0.55)'; e.target.style.boxShadow = '0 0 0 3.5px rgba(217,130,28,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(246,230,200,0.12)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(251,243,230,0.55)', marginBottom: 7 }}>Kata Sandi</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter" style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={e => { e.target.style.borderColor = 'rgba(217,130,28,0.55)'; e.target.style.boxShadow = '0 0 0 3.5px rgba(217,130,28,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(246,230,200,0.12)'; e.target.style.boxShadow = 'none'; }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(251,243,230,0.3)' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, var(--brand-400), var(--brand-600))',
            color: '#20140A', fontSize: 14.5, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 6px 20px rgba(217,130,28,0.32)', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
          {loading ? 'Membuat toko…' : 'Buat Toko Sekarang'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13.5, color: 'rgba(251,243,230,0.32)' }}>
          Sudah punya toko?{' '}
          <Link to="/login" style={{ color: 'var(--brand-300)', fontWeight: 600, textDecoration: 'none' }}>Masuk di sini</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
