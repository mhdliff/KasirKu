import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { OptionManager } from '../components/inventory/OptionManager';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useToast } from '../components/ui/Toast';
import { Product } from '../types';
import { formatRupiah, calcDiscountedPrice, getImageUrl } from '../lib/utils';
import {
  Plus, Search, Pencil, Trash2, X, Loader2,
  ImageIcon, Package, Tag
} from 'lucide-react';

interface ProductFormData {
  name: string;
  category_id: string;
  price: string;
  discount_percent: string;
  discount_nominal: string;
  stock: string;
  image_path: string;
}

const defaultForm: ProductFormData = {
  name: '', category_id: '', price: '', discount_percent: '0',
  discount_nominal: '0', stock: '0', image_path: '',
};

function ProductModal({
  product, categories, onSave, onClose, uploadImage,
}: {
  product: Product | null;
  categories: { id: string; category_name: string }[];
  onSave: (data: ProductFormData, imageFile: File | null) => Promise<void>;
  onClose: () => void;
  uploadImage: (f: File) => Promise<string | null>;
}) {
  const [form, setForm] = useState<ProductFormData>(
    product
      ? {
          name: product.name,
          category_id: product.category_id || '',
          price: String(product.price),
          discount_percent: String(product.discount_percent),
          discount_nominal: String(product.discount_nominal),
          stock: String(product.stock),
          image_path: product.image_path || '',
        }
      : defaultForm
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(product?.image_path || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof ProductFormData, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form, imageFile);
    setSaving(false);
  };

  const discountedPrice = calcDiscountedPrice(
    Number(form.price) || 0,
    Number(form.discount_percent) || 0,
    Number(form.discount_nominal) || 0
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{product ? 'Edit Produk' : 'Tambah Produk Baru'}</div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Left Column */}
            <div>
              <div className="form-group">
                <label className="form-label">Nama Produk *</label>
                <input required className="form-control" placeholder="Contoh: Nasi Goreng Spesial"
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-control" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.category_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Harga (Rp) *</label>
                <input required type="number" min="0" className="form-control" placeholder="25000"
                  value={form.price} onChange={e => set('price', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Diskon (%)</label>
                  <input type="number" min="0" max="100" className="form-control" placeholder="0"
                    value={form.discount_percent} onChange={e => { set('discount_percent', e.target.value); set('discount_nominal', '0'); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Diskon (Rp)</label>
                  <input type="number" min="0" className="form-control" placeholder="0"
                    value={form.discount_nominal} onChange={e => { set('discount_nominal', e.target.value); set('discount_percent', '0'); }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Stok</label>
                <input type="number" min="0" className="form-control" placeholder="0"
                  value={form.stock} onChange={e => set('stock', e.target.value)} />
              </div>

              {/* Price Preview */}
              {Number(form.price) > 0 && (
                <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-200)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 12, color: 'var(--brand-700)', fontWeight: 600, marginBottom: 4 }}>Preview Harga</div>
                  {discountedPrice < Number(form.price) ? (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)', textDecoration: 'line-through' }}>{formatRupiah(Number(form.price))}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-600)' }}>{formatRupiah(discountedPrice)}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-600)' }}>{formatRupiah(Number(form.price))}</div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Image Upload */}
            <div>
              <label className="form-label">Foto Produk</label>
              <label className="img-upload-area" style={{ display: 'block', cursor: 'pointer' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                {previewUrl ? (
                  <div>
                    <img src={previewUrl} className="img-preview" alt="preview"
                      onError={e => { (e.target as HTMLImageElement).src = getImageUrl(null); }} />
                    <div style={{ fontSize: 12, color: 'var(--brand-600)', fontWeight: 600 }}>Klik untuk ganti foto</div>
                  </div>
                ) : (
                  <div>
                    <ImageIcon size={32} color="var(--gray-300)" style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>Klik untuk upload foto</div>
                    <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 4 }}>JPG, PNG, WebP. Maks 5MB</div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* ── Varian & Tambahan ── only visible when editing */}
          {product?.id && (
            <div style={{ padding: '16px 22px', borderTop: '1px solid var(--gray-100)' }}>
              <OptionManager productId={product.id} />
            </div>
          )}
          {!product && (
            <div style={{ padding: '10px 22px' }}>
              <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 10, fontSize: 12.5, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
                💡 Varian &amp; Tambahan dapat ditambahkan setelah produk disimpan (klik Edit)
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
              {saving ? 'Menyimpan...' : product ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { products, loading, createProduct, updateProduct, deleteProduct, uploadImage } = useProducts(filterCat);
  const { categories } = useCategories();
  const { showToast } = useToast();

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (form: ProductFormData, imageFile: File | null) => {
    let imagePath = form.image_path;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) imagePath = url;
    }

    const payload = {
      name: form.name,
      category_id: form.category_id || null,
      price: Number(form.price),
      discount_percent: Number(form.discount_percent),
      discount_nominal: Number(form.discount_nominal),
      stock: Number(form.stock),
      image_path: imagePath || null,
    };

    if (editProduct) {
      const { error } = await updateProduct(editProduct.id, payload);
      if (error) showToast(error, 'error');
      else { showToast('Produk berhasil diperbarui!', 'success'); setShowModal(false); setEditProduct(null); }
    } else {
      const { error } = await createProduct(payload);
      if (error) showToast(error, 'error');
      else { showToast('Produk berhasil ditambahkan!', 'success'); setShowModal(false); }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await deleteProduct(deleteId);
    if (error) showToast(error, 'error');
    else showToast('Produk dihapus.', 'info');
    setDeleteId(null);
  };

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <div className="page-title">Manajemen Produk</div>
            <div className="page-subtitle">{products.length} produk terdaftar</div>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowModal(true); }}>
            <Plus size={15} /> Tambah Produk
          </button>
        </div>

        <div className="page-body">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ maxWidth: 280 }}>
              <Search size={15} className="search-icon" />
              <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="category-tags" style={{ margin: 0 }}>
              <div className={`category-tag ${!filterCat ? 'active' : ''}`} onClick={() => setFilterCat(null)}>Semua</div>
              {categories.map(c => (
                <div key={c.id} className={`category-tag ${filterCat === c.id ? 'active' : ''}`} onClick={() => setFilterCat(c.id)}>
                  {c.category_name}
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="card">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <div className="empty-title">Belum ada produk</div>
                <div className="empty-text" style={{ marginBottom: 16 }}>Mulai tambahkan produk untuk toko Anda</div>
                <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowModal(true); }}>
                  <Plus size={14} /> Tambah Produk Pertama
                </button>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Kategori</th>
                      <th>Harga</th>
                      <th>Diskon</th>
                      <th>Harga Jual</th>
                      <th>Stok</th>
                      <th style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(product => {
                      const discPrice = calcDiscountedPrice(product.price, product.discount_percent, product.discount_nominal);
                      const hasDisc = discPrice < product.price;
                      return (
                        <tr key={product.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img
                                src={getImageUrl(product.image_path)}
                                alt={product.name}
                                style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: 'var(--gray-100)', flexShrink: 0 }}
                                onError={e => { (e.target as HTMLImageElement).src = getImageUrl(null); }}
                              />
                              <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{product.name}</span>
                            </div>
                          </td>
                          <td>
                            {product.categories ? (
                              <span className="badge badge-gray">
                                <Tag size={10} style={{ marginRight: 4 }} />
                                {product.categories.category_name}
                              </span>
                            ) : <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>—</span>}
                          </td>
                          <td>{formatRupiah(product.price)}</td>
                          <td>
                            {hasDisc ? (
                              <span className="badge badge-green">
                                {product.discount_percent > 0 ? `${product.discount_percent}%` : formatRupiah(product.discount_nominal)}
                              </span>
                            ) : <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>—</span>}
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: hasDisc ? 'var(--accent-emerald)' : 'var(--gray-800)' }}>
                              {formatRupiah(discPrice)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${product.stock === 0 ? 'badge-amber' : product.stock < 5 ? 'badge-amber' : 'badge-green'}`}>
                              {product.stock === 0 ? 'Habis' : product.stock}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => { setEditProduct(product); setShowModal(true); }}>
                                <Pencil size={12} /> Edit
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(product.id)}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editProduct}
          categories={categories}
          uploadImage={uploadImage}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Hapus Produk?</div>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.6 }}>
                Produk ini akan dihapus permanen beserta semua data terkait. Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={14} /> Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
      <MobileNav />
    </div>
  );
}
