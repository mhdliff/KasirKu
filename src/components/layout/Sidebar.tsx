import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Tag,
  BarChart3, LogOut, Receipt, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/dashboard' },
  { icon: ShoppingCart,    label: 'Kasir / POS', path: '/pos' },
  { icon: Package,         label: 'Produk',      path: '/products' },
  { icon: Tag,             label: 'Kategori',    path: '/categories' },
  { icon: BarChart3,       label: 'Analitik',    path: '/analytics' },
];

export function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = profile?.shop_name
    ? profile.shop_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'T';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Receipt size={18} strokeWidth={2.4} /></div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Tokoku</span>
          <span className="sidebar-brand-sub">Kasir Digital</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu Utama</div>
        {navItems.map(({ icon: Icon, label, path }) => (
          <div
            key={path}
            className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon className="nav-item-icon" size={17} />
            <span>{label}</span>
            {location.pathname === path && (
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-mini">
          <div className="user-avatar">{initials}</div>
          <div className="user-info" style={{ flex: 1, overflow: 'hidden' }}>
            <div className="user-name">{profile?.shop_name || 'Toko Saya'}</div>
            <div className="user-role">{profile?.email || ''}</div>
          </div>
        </div>
        <div
          className="nav-item"
          onClick={handleSignOut}
          style={{ color: 'rgba(189,68,56,0.75)', marginTop: 5 }}
        >
          <LogOut size={17} />
          <span>Keluar</span>
        </div>
      </div>
    </aside>
  );
}
