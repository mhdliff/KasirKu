import { useState, useEffect } from 'react';
import { Product, ProductOptionGroup, SelectedOption } from '../../types';
import { formatRupiah, calcDiscountedPrice, getImageUrl } from '../../lib/utils';
import { fetchProductOptions } from '../../hooks/useProductOptions';
import { X, Plus, Minus, ShoppingCart, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  product: Product;
  onAdd: (product: Product, qty: number, selectedOptions: SelectedOption[]) => void;
  onClose: () => void;
}

export function OptionSelectModal({ product, onAdd, onClose }: Props) {
  const [groups, setGroups] = useState<ProductOptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);

  const basePrice = calcDiscountedPrice(product.price, product.discount_percent, product.discount_nominal);

  useEffect(() => {
    fetchProductOptions(product.id).then(g => {
      setGroups(g);
      // Pre-select first option for required single-select groups
      const preselect: Record<string, string[]> = {};
      g.forEach(group => {
        if (group.required && group.max_select === 1 && group.product_options?.length) {
          preselect[group.id] = [group.product_options[0].id];
        } else {
          preselect[group.id] = [];
        }
      });
      setSelected(preselect);
      setLoading(false);
    });
  }, [product.id]);

  // Toggle an option
  const toggle = (groupId: string, optionId: string, maxSelect: number) => {
    setSelected(prev => {
      const current = prev[groupId] || [];
      if (maxSelect === 1) {
        // Radio behaviour — clicking same = deselect (unless required)
        const group = groups.find(g => g.id === groupId);
        const isRequired = group?.required;
        if (current.includes(optionId)) {
          return isRequired ? prev : { ...prev, [groupId]: [] };
        }
        return { ...prev, [groupId]: [optionId] };
      } else {
        // Checkbox behaviour
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter(id => id !== optionId) };
        }
        if (current.length >= maxSelect) return prev; // limit reached
        return { ...prev, [groupId]: [...current, optionId] };
      }
    });
  };

  // Build SelectedOption array
  const buildSelected = (): SelectedOption[] => {
    const result: SelectedOption[] = [];
    groups.forEach(group => {
      const pickedIds = selected[group.id] || [];
      pickedIds.forEach(optId => {
        const opt = group.product_options?.find(o => o.id === optId);
        if (opt) {
          result.push({
            optionId: opt.id,
            optionName: opt.name,
            groupId: group.id,
            groupName: group.name,
            priceAddition: Number(opt.price_addition),
          });
        }
      });
    });
    return result;
  };

  const optionTotal = groups.reduce((sum, group) => {
    const pickedIds = selected[group.id] || [];
    return sum + pickedIds.reduce((s, id) => {
      const opt = group.product_options?.find(o => o.id === id);
      return s + (opt ? Number(opt.price_addition) : 0);
    }, 0);
  }, 0);

  const unitPrice = basePrice + optionTotal;
  const totalPrice = unitPrice * qty;

  // Check if all required groups are satisfied
  const isValid = groups.every(g =>
    !g.required || (selected[g.id] && selected[g.id].length > 0)
  );

  const handleAdd = () => {
    if (!isValid) return;
    onAdd(product, qty, buildSelected());
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end',
        animation: 'fadeIn 150ms ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 520,
          margin: '0 auto',
          background: 'var(--surface-0)',
          borderRadius: '24px 24px 0 0',
          maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          animation: 'slideUpSheet 260ms cubic-bezier(0.34, 1.3, 0.64, 1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'var(--gray-200)', borderRadius: 2, margin: '12px auto 0' }} />

        {/* Product Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 20px 14px',
          borderBottom: '1px solid var(--gray-100)',
          flexShrink: 0,
        }}>
          <img
            src={getImageUrl(product.image_path)}
            alt={product.name}
            style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', background: 'var(--gray-100)', flexShrink: 0 }}
            onError={e => { (e.target as HTMLImageElement).src = getImageUrl(null); }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
              {product.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--brand-600)' }}>
                {formatRupiah(basePrice)}
              </span>
              {basePrice < product.price && (
                <span style={{ fontSize: 12, color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                  {formatRupiah(product.price)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'var(--gray-100)', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)', flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable options body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Loader2 size={24} color="var(--brand-500)" style={{ animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : groups.length === 0 ? (
            // No options — simple confirmation
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
              <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>Tidak ada varian untuk produk ini</div>
            </div>
          ) : groups.map(group => (
            <div key={group.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-50)' }}>
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 700, color: 'var(--gray-900)' }}>
                  {group.name}
                </div>
                {group.required && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100,
                    background: 'rgba(239,68,68,0.1)', color: 'var(--accent-rose)',
                    border: '1px solid rgba(239,68,68,0.2)', letterSpacing: 0.3,
                  }}>
                    WAJIB
                  </span>
                )}
                {group.max_select > 1 && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100,
                    background: 'rgba(139,92,246,0.1)', color: 'var(--accent-violet)',
                    border: '1px solid rgba(139,92,246,0.2)',
                  }}>
                    Maks {group.max_select}
                  </span>
                )}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(group.product_options || []).map(option => {
                  const isSelected = (selected[group.id] || []).includes(option.id);
                  const price = Number(option.price_addition);
                  return (
                    <div
                      key={option.id}
                      onClick={() => toggle(group.id, option.id, group.max_select)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
                        background: isSelected ? 'linear-gradient(135deg, rgba(217,130,28,0.10), rgba(60,129,96,0.05))' : 'var(--gray-50)',
                        border: `1.5px solid ${isSelected ? 'var(--brand-400)' : 'var(--gray-200)'}`,
                        transition: 'all 150ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Checkbox/Radio indicator */}
                        <div style={{
                          width: 20, height: 20, borderRadius: group.max_select === 1 ? '50%' : 5,
                          border: `2px solid ${isSelected ? 'var(--brand-500)' : 'var(--gray-300)'}`,
                          background: isSelected ? 'var(--brand-500)' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 150ms',
                          flexShrink: 0,
                        }}>
                          {isSelected && <CheckCircle2 size={12} color="white" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, color: 'var(--gray-800)' }}>
                          {option.name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: 13.5, fontWeight: 700,
                        color: price === 0 ? 'var(--accent-emerald)' : 'var(--gray-700)',
                      }}>
                        {price === 0 ? 'Gratis' : `+${formatRupiah(price)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: qty + total + add button */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--gray-100)',
          flexShrink: 0,
          background: 'var(--surface-0)',
        }}>
          {/* Qty + Total */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="qty-btn"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: 34, height: 34 }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)', minWidth: 28, textAlign: 'center' }}>
                {qty}
              </span>
              <button
                className="qty-btn"
                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                style={{ width: 34, height: 34 }}
              >
                <Plus size={14} />
              </button>
            </div>
            <div style={{ textAlign: 'right' }}>
              {optionTotal > 0 && (
                <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginBottom: 2 }}>
                  {formatRupiah(basePrice)} + {formatRupiah(optionTotal)}
                </div>
              )}
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand-600)' }}>
                {formatRupiah(totalPrice)}
              </div>
            </div>
          </div>

          {/* Validation hint */}
          {!isValid && (
            <div style={{
              fontSize: 12, color: 'var(--accent-rose)',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '6px 12px', marginBottom: 10, textAlign: 'center',
            }}>
              Pilih item yang wajib dipilih terlebih dahulu
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!isValid}
            style={{
              width: '100%', padding: '13px',
              background: isValid
                ? 'linear-gradient(135deg, var(--brand-500), var(--brand-600))'
                : 'var(--gray-200)',
              color: isValid ? 'white' : 'var(--gray-400)',
              border: 'none', borderRadius: 14, cursor: isValid ? 'pointer' : 'not-allowed',
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: isValid ? '0 4px 16px rgba(217,130,28,0.3)' : 'none',
              transition: 'all 150ms',
            }}
          >
            <ShoppingCart size={17} />
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
