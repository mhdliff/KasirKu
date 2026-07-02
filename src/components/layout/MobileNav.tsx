import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Tag, BarChart3
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ShoppingCart,    label: 'Kasir',     path: '/pos' },
  { icon: Package,         label: 'Produk',    path: '/products' },
  { icon: Tag,             label: 'Kategori',  path: '/categories' },
  { icon: BarChart3,       label: 'Analitik',  path: '/analytics' },
];

export function MobileNav() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <nav className="mobile-nav">
      {navItems.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            className={`mobile-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={20} className="mobile-nav-icon" />
            <span className="mobile-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
