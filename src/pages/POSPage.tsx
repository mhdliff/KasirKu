import { useState, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { OptionSelectModal } from '../components/pos/OptionSelectModal';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { useIsMobile } from '../hooks/useIsMobile';
import { CartItem, Product, SelectedOption } from '../types';
import { formatRupiah, calcDiscountedPrice, getImageUrl } from '../lib/utils';
import { Search, ShoppingCart, Trash2, Plus, Minus, CheckCircle, Loader2, X, Printer } from 'lucide-react';

/* ── Cart key ─────────────────────────────────────────────────── */
const makeCartKey = (productId: string, opts: SelectedOption[]) =>
  `${productId}::${opts.map(o => o.optionId).sort().join('|')}`;

/* ── Receipt modal ─────────────────────────────────────────────── */
interface ReceiptData {
  transactionNumber: string; items: CartItem[];
  total: number; discount: number;
  paymentAmount: number; changeAmount: number;
  shopName: string; date: string;
}

function ReceiptModal({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🧾 Struk Transaksi</div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="receipt">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{data.shopName}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{data.date}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>No: {data.transactionNumber}</div>
            </div>
            <hr className="receipt-divider" />
            {data.items.map(item => {
              const disc = calcDiscountedPrice(item.product.price, item.product.discount_percent, item.product.discount_nominal);
              const unitPrice = disc + item.optionTotal;
              return (
                <div key={item.cartKey} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.product.name}</div>
                  {item.selectedOptions.map(opt => (
                    <div key={opt.optionId} style={{ fontSize: 11.5, color: 'var(--gray-500)', paddingLeft: 8 }}>
                      › {opt.optionName} {opt.priceAddition > 0 ? `(+${formatRupiah(opt.priceAddition)})` : ''}
                    </div>
                  ))}
                  <div className="receipt-row" style={{ fontSize: 12.5 }}>
                    <span>{item.quantity} × {formatRupiah(unitPrice)}</span>
                    <span>{formatRupiah(unitPrice * item.quantity)}</span>
                  </div>
                </div>
              );
            })}
            <hr className="receipt-divider" />
            {data.discount > 0 && (
              <div className="receipt-row">
                <span>Diskon</span>
                <span style={{ color: 'var(--accent-emerald)' }}>- {formatRupiah(data.discount)}</span>
              </div>
            )}
            <div className="receipt-row receipt-total">
              <span>TOTAL</span><span>{formatRupiah(data.total)}</span>
            </div>
            <div className="receipt-row">
              <span>Bayar</span><span>{formatRupiah(data.paymentAmount)}</span>
            </div>
            <div className="receipt-row" style={{ fontWeight: 700 }}>
              <span>Kembalian</span>
              <span style={{ color: 'var(--accent-emerald)' }}>{formatRupiah(data.changeAmount)}</span>
            </div>
            <hr className="receipt-divider" />
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
              Terima kasih! 🙏
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={14} /> Cetak</button>
          <button className="btn btn-primary" onClick={onClose}>Selesai</button>
        </div>
      </div>
    </div>
  );
}

/* ── CartContent (shared desktop+mobile) ───────────────────────── */
function CartContent({
  cart, total, totalDiscount, subtotal,
  paymentAmount, setPaymentAmount,
  checkingOut, handleCheckout, updateQty,
}: {
  cart: CartItem[]; total: number; totalDiscount: number; subtotal: number;
  paymentAmount: string; setPaymentAmount: (v: string) => void;
  checkingOut: boolean; handleCheckout: () => void;
  updateQty: (key: string, delta: number) => void;
}) {
  const payment = Number(paymentAmount) || 0;
  const change  = payment - total;

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
        {cart.length === 0 ? (
          <div className="empty-state" style={{ padding: '28px 0' }}>
            <div className="empty-icon">🛒</div>
            <div className="empty-title" style={{ fontSize: 14 }}>Keranjang kosong</div>
            <div className="empty-text" style={{ fontSize: 12.5 }}>Klik produk untuk menambahkan</div>
          </div>
        ) : cart.map(item => {
          const discPrice = calcDiscountedPrice(item.product.price, item.product.discount_percent, item.product.discount_nominal);
          const unitPrice = discPrice + item.optionTotal;
          return (
            <div key={item.cartKey} className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <div style={{ display: 'flex', width: '100%', gap: 10, alignItems: 'flex-start' }}>
                <img src={getImageUrl(item.product.image_path)} alt={item.product.name}
                  className="cart-item-img"
                  onError={e => { (e.target as HTMLImageElement).src = getImageUrl(null); }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="cart-item-name">{item.product.name}</div>
                  {/* Selected options */}
                  {item.selectedOptions.length > 0 && (
                    <div style={{ marginTop: 3 }}>
                      {item.selectedOptions.map(opt => (
                        <div key={opt.optionId} style={{
                          fontSize: 11.5, color: 'var(--gray-500)',
                          display: 'flex', justifyContent: 'space-between',
                        }}>
                          <span>› {opt.optionName}</span>
                          <span style={{ color: opt.priceAddition > 0 ? 'var(--gray-600)' : 'var(--accent-emerald)', fontWeight: 500 }}>
                            {opt.priceAddition > 0 ? `+${formatRupiah(opt.priceAddition)}` : 'Gratis'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-900)' }}>
                    {formatRupiah(unitPrice * item.quantity)}
                  </span>
                  <div className="qty-control">
                    <button className={`qty-btn ${item.quantity === 1 ? 'danger' : ''}`} onClick={() => updateQty(item.cartKey, -1)}>
                      {item.quantity === 1 ? <Trash2 size={10} /> : <Minus size={10} />}
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.cartKey, 1)}>
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--gray-100)', flexShrink: 0 }}>
        <div className="summary-row">
          <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>Subtotal</span>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{formatRupiah(subtotal)}</span>
        </div>
        {totalDiscount > 0 && (
          <div className="summary-row">
            <span style={{ color: 'var(--accent-emerald)', fontSize: 13 }}>Diskon</span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, fontSize: 13 }}>- {formatRupiah(totalDiscount)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total</span>
          <span style={{ color: 'var(--brand-600)' }}>{formatRupiah(total)}</span>
        </div>

        <div style={{ marginTop: 12, marginBottom: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 5 }}>Nominal Bayar</label>
          <input
            type="number" inputMode="numeric" placeholder="0"
            value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
            className="form-control" style={{ fontWeight: 700, fontSize: 16 }}
          />
          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
            {[total, 50000, 100000, 200000].filter(v => v > 0).slice(0, 4).map(v => (
              <button key={v} onClick={() => setPaymentAmount(String(v))}
                className="btn btn-secondary btn-sm" style={{ fontSize: 11, fontWeight: 700 }}>
                {v === total ? 'Pas' : formatRupiah(v)}
              </button>
            ))}
          </div>
        </div>

        {payment > 0 && payment >= total && (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 9, padding: '8px 12px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--accent-emerald)' }}>
              <span>Kembalian</span><span>{formatRupiah(change)}</span>
            </div>
          </div>
        )}

        <button
          className="btn btn-success btn-full"
          onClick={handleCheckout}
          disabled={cart.length === 0 || payment < total || checkingOut}
          style={{ padding: '12px', fontSize: 14, borderRadius: 10 }}
        >
          {checkingOut ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={15} />}
          {checkingOut ? 'Memproses...' : `Checkout — ${formatRupiah(total)}`}
        </button>
      </div>
    </>
  );
}

/* ── Main POSPage ──────────────────────────────────────────────── */
export function POSPage() {
  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [checkingOut, setCheckingOut]     = useState(false);
  const [receipt, setReceipt]             = useState<ReceiptData | null>(null);
  const [cartOpen, setCartOpen]           = useState(false);
  // Option modal state
  const [optionProduct, setOptionProduct] = useState<Product | null>(null);

  const { products, loading: prodLoading } = useProducts(activeCategory);
  const { categories }                    = useCategories();
  const { checkout }                      = useTransactions();
  const { showToast }                     = useToast();
  const { profile }                       = useAuth();
  const isMobile                          = useIsMobile();

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  /* When user taps a product → open option modal (or add directly if out of stock) */
  const handleProductClick = (product: Product) => {
    if (product.stock === 0) return;
    setOptionProduct(product); // always open modal (hook fetches options, shows simple confirm if none)
  };

  /* Called from OptionSelectModal */
  const addToCart = (product: Product, qty: number, selectedOptions: SelectedOption[]) => {
    const optionTotal = selectedOptions.reduce((s, o) => s + o.priceAddition, 0);
    const key = makeCartKey(product.id, selectedOptions);

    setCart(prev => {
      const existing = prev.find(i => i.cartKey === key);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > product.stock) { showToast(`Stok ${product.name} tidak cukup`, 'error'); return prev; }
        return prev.map(i => i.cartKey === key ? { ...i, quantity: newQty } : i);
      }
      return [...prev, { cartKey: key, product, quantity: qty, selectedOptions, optionTotal }];
    });

    if (isMobile) setCartOpen(true);
    showToast(`${product.name} ditambahkan ✓`, 'success');
  };

  const updateQty = (cartKey: string, delta: number) => {
    setCart(prev => prev
      .map(i => i.cartKey === cartKey ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const totalDiscount = cart.reduce((sum, item) => {
    const base = item.product.price;
    const disc = calcDiscountedPrice(base, item.product.discount_percent, item.product.discount_nominal);
    return sum + ((base - disc) * item.quantity);
  }, 0);

  const subtotal = cart.reduce((sum, item) => {
    const disc = calcDiscountedPrice(item.product.price, item.product.discount_percent, item.product.discount_nominal);
    return sum + (disc + item.optionTotal) * item.quantity;
  }, 0);

  const total   = subtotal;
  const payment = Number(paymentAmount) || 0;

  const handleCheckout = async () => {
    if (cart.length === 0)   { showToast('Keranjang kosong!', 'error'); return; }
    if (payment < total)     { showToast('Nominal bayar kurang!', 'error'); return; }
    setCheckingOut(true);
    const { error, data } = await checkout(cart, payment);
    if (error) {
      showToast(error, 'error');
    } else if (data) {
      setReceipt({
        transactionNumber: data.transactionNumber || data.transaction_number,
        items: [...cart], total, discount: totalDiscount,
        paymentAmount: payment, changeAmount: payment - total,
        shopName: profile?.shop_name || 'Toko',
        date: new Date().toLocaleString('id-ID'),
      });
      setCart([]); setPaymentAmount('');
      if (isMobile) setCartOpen(false);
      showToast('Transaksi berhasil! 🎉', 'success');
    }
    setCheckingOut(false);
  };

  const totalItemQty = cart.reduce((s, i) => s + i.quantity, 0);

  /* ── Product Panel ───────────────────────────────────────────── */
  const ProductPanel = (
    <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, ...(isMobile ? {} : { borderRight: '1px solid var(--gray-200)' }) }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', flexShrink: 0 }}>
        <div className="search-bar" style={{ marginBottom: 10 }}>
          <Search size={15} className="search-icon" />
          <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="category-tags">
          <div className={`category-tag ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>Semua</div>
          {categories.map(c => (
            <div key={c.id} className={`category-tag ${activeCategory === c.id ? 'active' : ''}`} onClick={() => setActiveCategory(c.id)}>
              {c.category_name}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {prodLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">Produk tidak ditemukan</div>
            <div className="empty-text">Tambahkan produk di menu Produk</div>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => {
              const discPrice = calcDiscountedPrice(product.price, product.discount_percent, product.discount_nominal);
              const hasDisc   = discPrice < product.price;
              const inCartQty = cart.filter(i => i.product.id === product.id).reduce((s, i) => s + i.quantity, 0);
              return (
                <div key={product.id}
                  className={`product-card ${product.stock === 0 ? 'out-of-stock' : ''}`}
                  onClick={() => handleProductClick(product)}
                  style={{ position: 'relative' }}>
                  {inCartQty > 0 && (
                    <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 1, background: 'var(--brand-500)', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, boxShadow: '0 2px 6px rgba(217,130,28,0.4)' }}>
                      {inCartQty}
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', zIndex: 2, borderRadius: 'inherit', fontSize: 11, fontWeight: 800, color: 'var(--accent-rose)' }}>HABIS</div>
                  )}
                  <img src={getImageUrl(product.image_path)} alt={product.name} className="product-img" onError={e => { (e.target as HTMLImageElement).src = getImageUrl(null); }} />
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">{formatRupiah(discPrice)}</div>
                    {hasDisc && <div className="product-original">{formatRupiah(product.price)}</div>}
                    <div className="product-stock">Stok: {product.stock}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="page-header">
          <div>
            <div className="page-title">Kasir / POS</div>
            <div className="page-subtitle">{totalItemQty} item di keranjang</div>
          </div>
          {cart.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={() => setCart([])}>
              <Trash2 size={13} /><span>Kosongkan</span>
            </button>
          )}
        </div>

        {/* Desktop */}
        {!isMobile && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr clamp(296px, 28vw, 380px)', overflow: 'hidden', height: 'calc(var(--full-h) - 61px)' }}>
            {ProductPanel}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface-0)' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>
                  <ShoppingCart size={17} color="var(--brand-500)" />
                  Keranjang
                  {cart.length > 0 && <span className="badge badge-blue">{totalItemQty}</span>}
                </div>
              </div>
              <CartContent cart={cart} total={total} totalDiscount={totalDiscount} subtotal={subtotal}
                paymentAmount={paymentAmount} setPaymentAmount={setPaymentAmount}
                checkingOut={checkingOut} handleCheckout={handleCheckout} updateQty={updateQty} />
            </div>
          </div>
        )}

        {/* Mobile */}
        {isMobile && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 'calc(var(--full-h) - 61px)' }}>
            {ProductPanel}
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      {isMobile && (
        <button className="cart-fab" onClick={() => setCartOpen(true)}>
          <ShoppingCart size={22} />
          {totalItemQty > 0 && <span className="cart-fab-badge">{totalItemQty}</span>}
        </button>
      )}

      {/* Mobile cart sheet */}
      {isMobile && cartOpen && (
        <>
          <div className="cart-sheet-overlay" style={{ display: 'block' }} onClick={() => setCartOpen(false)} />
          <div className="cart-sheet">
            <div className="cart-sheet-handle" />
            <div className="cart-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                <ShoppingCart size={17} color="var(--brand-500)" />
                Keranjang
                {totalItemQty > 0 && <span className="badge badge-blue">{totalItemQty}</span>}
              </div>
              <button className="modal-close" onClick={() => setCartOpen(false)}><X size={18} /></button>
            </div>
            <CartContent cart={cart} total={total} totalDiscount={totalDiscount} subtotal={subtotal}
              paymentAmount={paymentAmount} setPaymentAmount={setPaymentAmount}
              checkingOut={checkingOut} handleCheckout={handleCheckout} updateQty={updateQty} />
          </div>
        </>
      )}

      {/* Option select modal */}
      {optionProduct && (
        <OptionSelectModal
          product={optionProduct}
          onAdd={addToCart}
          onClose={() => setOptionProduct(null)}
        />
      )}

      {receipt && <ReceiptModal data={receipt} onClose={() => setReceipt(null)} />}
      <MobileNav />
    </div>
  );
}
