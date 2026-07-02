import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt, ShoppingCart, BarChart3, Package, ChevronDown,
  CheckCircle2, Shield, TrendingUp, ArrowRight, Tag, Sparkles
} from 'lucide-react';

const features = [
  {
    icon: ShoppingCart,
    title: 'Kasir yang Bisa Diandalkan',
    desc: 'Cari produk, ketuk untuk tambah ke keranjang, terima pembayaran — semua dalam satu alur tanpa jeda.',
  },
  {
    icon: Package,
    title: 'Varian Tanpa Ribet',
    desc: 'Tambahkan tingkat pedas, topping, atau ukuran porsi langsung dari menu produk. Pelanggan tinggal pilih.',
  },
  {
    icon: BarChart3,
    title: 'Angka yang Jujur',
    desc: 'Bandingkan omzet hari ini vs kemarin, bulan ini vs bulan lalu — tanpa perlu buka kalkulator.',
  },
  {
    icon: Shield,
    title: 'Data Milik Anda Sendiri',
    desc: 'Setiap toko punya ruang data terpisah dan terenkripsi. Tidak ada yang bisa mengintip catatan Anda.',
  },
];

const steps = [
  { label: 'Daftar toko',     desc: 'Isi nama toko dan email, langsung aktif tanpa verifikasi berbelit.' },
  { label: 'Susun etalase',   desc: 'Tambahkan kategori dan produk, lengkap dengan foto serta varian.' },
  { label: 'Mulai melayani',  desc: 'Buka halaman kasir, dan setiap transaksi otomatis tercatat rapi.' },
];

const faqs = [
  { q: 'Apakah Tokoku gratis digunakan?', a: 'Ya. Semua fitur inti — kasir, inventori, dan analitik — bisa dipakai tanpa biaya berlangganan.' },
  { q: 'Apakah data toko saya aman?', a: 'Setiap toko memiliki ruang data terpisah dengan enkripsi end-to-end dan kontrol akses ketat, jadi hanya Anda yang bisa membuka catatan transaksi sendiri.' },
  { q: 'Bisa dipakai di HP atau tablet?', a: 'Bisa. Tampilan kasir menyesuaikan otomatis ke layar HP, tablet, sampai layar kasir di meja kasir.' },
  { q: 'Bagaimana cara melihat laporan penjualan?', a: 'Buka halaman Analitik — di sana tersedia perbandingan harian, bulanan, dan tahunan secara otomatis.' },
  { q: 'Apakah saya bisa menambahkan varian produk seperti tingkat pedas?', a: 'Bisa. Setiap produk bisa diberi grup varian — wajib atau opsional — lengkap dengan harga tambahan masing-masing pilihan.' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: 'var(--full-h)', background: '#15100B', color: '#FBF3E6', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '15px 5vw',
        background: 'rgba(21,16,11,0.82)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(246,208,138,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(150deg, var(--brand-300), var(--brand-600))',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(217,130,28,0.4)',
          }}>
            <Receipt size={16} color="#20140A" strokeWidth={2.4} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.4px' }}>
            Tokoku
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'rgba(246,230,200,0.06)', color: 'rgba(251,243,230,0.75)', border: '1px solid rgba(246,230,200,0.12)', padding: '9px 17px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            Masuk
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Daftar Gratis <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: 'var(--full-h)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '90px 24px 70px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '14%', left: '8%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(217,130,28,0.16), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '6%', width: 340, height: 340, background: 'radial-gradient(circle, rgba(60,129,96,0.12), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(217,130,28,0.13)', color: 'var(--brand-200)',
          border: '1px solid rgba(217,130,28,0.28)', borderRadius: 100,
          padding: '6px 15px', fontSize: 12.5, fontWeight: 600, marginBottom: 22,
        }}>
          <Sparkles size={13} /> Dibuat khusus untuk UMKM Indonesia
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 6.4vw, 76px)',
          fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2.2px', maxWidth: 820, marginBottom: 26,
        }}>
          Setiap transaksi,<br />
          <span style={{ background: 'linear-gradient(120deg, var(--brand-200), var(--brand-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            tercatat rapi sendiri.
          </span>
        </h1>

        <p style={{ fontSize: 17, color: 'rgba(251,243,230,0.55)', maxWidth: 540, lineHeight: 1.75, marginBottom: 38 }}>
          Tokoku merapikan kasir, stok, dan omzet toko Anda dalam satu layar — dari warung kopi sampai toko kelontong, tanpa perlu belajar pembukuan rumit.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')} style={{ fontSize: 15, padding: '14px 30px' }}>
            Mulai Pakai Gratis <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'rgba(246,230,200,0.06)', color: 'rgba(251,243,230,0.7)', border: '1px solid rgba(246,230,200,0.14)', padding: '14px 30px', fontSize: 15, borderRadius: 14, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            Saya Sudah Punya Toko
          </button>
        </div>

        {/* Receipt preview card — the signature element */}
        <div className="scallop-bottom" style={{ '--scallop-color': '#FBF7F2' } as React.CSSProperties}>
          <div style={{
            width: 'min(340px, 86vw)', background: '#FBF7F2', borderRadius: '18px 18px 0 0',
            padding: '26px 24px 30px', boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
            fontFamily: 'var(--font-mono)', color: '#2B2218', textAlign: 'left',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>TOKO BERKAH JAYA</div>
              <div style={{ fontSize: 10.5, color: '#7A6A56', marginTop: 3 }}>Jl. Merdeka No. 12 · 30 Jun 2026</div>
            </div>
            <div style={{ borderTop: '1px dashed #CDBCA3', margin: '10px 0' }} />
            {[
              ['Kopi Susu Gula Aren', '18.000'],
              ['  › Es Batu Extra', 'Gratis'],
              ['Roti Bakar Coklat', '15.000'],
              ['  › Keju + 5.000', '5.000'],
            ].map(([label, val], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, padding: '2.5px 0', color: label.startsWith('  ') ? '#A28E73' : '#2B2218' }}>
                <span>{label}</span><span>{val}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed #CDBCA3', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14.5 }}>
              <span>TOTAL</span><span>Rp 38.000</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: 10, color: '#A28E73', marginTop: 16 }}>
              dicatat otomatis oleh Tokoku ✦
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '120px 5vw 80px', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.2, color: 'var(--brand-400)', textTransform: 'uppercase', marginBottom: 13 }}>
            Yang Dikerjakan Tokoku
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 14 }}>
            Empat tugas yang biasanya<br />merepotkan, sekarang otomatis
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: 'rgba(246,230,200,0.03)', border: '1px solid rgba(246,230,200,0.08)',
                borderRadius: 18, padding: 26, transition: 'all 220ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(246,230,200,0.055)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(217,130,28,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(246,230,200,0.03)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(246,230,200,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(217,130,28,0.12)', border: '1px solid rgba(217,130,28,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 17 }}>
                <Icon size={20} color="var(--brand-300)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 9 }}>{title}</h3>
              <p style={{ fontSize: 13.5, color: 'rgba(251,243,230,0.42)', lineHeight: 1.75 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '70px 5vw', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(150deg, rgba(217,130,28,0.10), rgba(60,129,96,0.06))',
          border: '1px solid rgba(217,130,28,0.18)', borderRadius: 26, padding: '44px 36px',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 27, fontWeight: 800, marginBottom: 32, textAlign: 'center' }}>
            Buka toko digital dalam tiga langkah
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {steps.map((step, i) => (
              <div key={step.label}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--brand-300)',
                  border: '1.5px solid rgba(217,130,28,0.35)', width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 13,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15.5, fontWeight: 700, marginBottom: 7 }}>{step.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(251,243,230,0.45)', lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Checklist ── */}
      <section style={{ padding: '50px 5vw 70px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
          {[
            'Tanpa biaya berlangganan',
            'Tanpa instalasi aplikasi',
            'Siap pakai dalam 5 menit',
            'Varian produk fleksibel',
            'Struk otomatis tiap transaksi',
            'Laporan harian, bulanan, tahunan',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={17} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: 'rgba(251,243,230,0.7)' }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '50px 5vw 80px', maxWidth: 740, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, marginBottom: 10 }}>
            Pertanyaan yang Sering Muncul
          </h2>
          <p style={{ color: 'rgba(251,243,230,0.4)', fontSize: 14 }}>Kalau masih ada yang mengganjal, ini jawabannya.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              background: 'rgba(246,230,200,0.03)',
              border: `1px solid ${openFaq === i ? 'rgba(217,130,28,0.32)' : 'rgba(246,230,200,0.08)'}`,
              borderRadius: 15, overflow: 'hidden', transition: 'border-color 220ms',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '17px 21px', background: 'none', border: 'none', cursor: 'pointer', color: '#FBF3E6', textAlign: 'left', gap: 12 }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 600 }}>{faq.q}</span>
                <ChevronDown size={16} style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 220ms', opacity: 0.5 }} />
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 21px 17px', fontSize: 13.5, color: 'rgba(251,243,230,0.5)', lineHeight: 1.75 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '50px 24px 90px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 15, letterSpacing: '-0.6px' }}>
            Toko Anda layak dicatat serapi ini.
          </h2>
          <p style={{ color: 'rgba(251,243,230,0.42)', fontSize: 15, marginBottom: 30 }}>
            Daftar gratis sekarang, dan transaksi pertama Anda bisa langsung tercatat hari ini.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Buat Toko Gratis <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(246,230,200,0.07)', padding: '26px 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Receipt size={15} color="var(--brand-400)" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'rgba(251,243,230,0.5)' }}>Tokoku</span>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(251,243,230,0.22)' }}>
          © 2026 Tokoku — Kasir Digital untuk UMKM Indonesia 🇮🇩
        </span>
      </footer>
    </div>
  );
}
