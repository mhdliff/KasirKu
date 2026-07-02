import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { useCategories } from '../hooks/useCategories';
import { useToast } from '../components/ui/Toast';
import { Plus, Pencil, Trash2, X, Loader2, Tag } from 'lucide-react';

export function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { showToast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    const { error } = await createCategory(newName.trim());
    if (error) showToast(error, 'error');
    else { showToast('Kategori berhasil ditambahkan!', 'success'); setNewName(''); setShowAdd(false); }
    setSaving(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editName.trim()) return;
    setSaving(true);
    const { error } = await updateCategory(editId, editName.trim());
    if (error) showToast(error, 'error');
    else { showToast('Kategori diperbarui!', 'success'); setEditId(null); setEditName(''); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await deleteCategory(deleteId);
    if (error) showToast('Gagal hapus. Mungkin ada produk di kategori ini.', 'error');
    else showToast('Kategori dihapus.', 'info');
    setDeleteId(null);
  };

  // Color palette for category cards
  const cardColors = [
    { bg: 'var(--brand-50)', border: 'var(--brand-200)', icon: 'var(--brand-500)' },
    { bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.2)', icon: 'var(--accent-violet)' },
    { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.2)', icon: 'var(--accent-emerald)' },
    { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)', icon: 'var(--accent-amber)' },
    { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)', icon: 'var(--accent-rose)' },
  ];

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <div className="page-title">Kategori Produk</div>
            <div className="page-subtitle">{categories.length} kategori terdaftar</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Tambah Kategori
          </button>
        </div>

        <div className="page-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" />
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 60 }}>
              <div className="empty-icon">🏷️</div>
              <div className="empty-title">Belum ada kategori</div>
              <div className="empty-text" style={{ marginBottom: 20 }}>Buat kategori untuk mengorganisir produk Anda</div>
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                <Plus size={14} /> Buat Kategori Pertama
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {categories.map((cat, i) => {
                const color = cardColors[i % cardColors.length];
                const isEditing = editId === cat.id;
                return (
                  <div key={cat.id} style={{
                    background: color.bg,
                    border: `1.5px solid ${color.border}`,
                    borderRadius: 14,
                    padding: '18px 18px',
                    transition: 'all 200ms',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.07)' }}>
                        <Tag size={18} color={color.icon} />
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditId(cat.id); setEditName(cat.category_name); }}
                          style={{ padding: '4px 8px' }}>
                          <Pencil size={12} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(cat.id)}
                          style={{ padding: '4px 8px' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleEdit} style={{ display: 'flex', gap: 6 }}>
                        <input
                          autoFocus
                          className="form-control"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          style={{ fontSize: 13, padding: '6px 10px', flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                          {saving ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : '✓'}
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>
                          <X size={12} />
                        </button>
                      </form>
                    ) : (
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>
                          {cat.category_name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3 }}>
                          Kategori produk
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Tambah Kategori Baru</div>
              <button className="modal-close" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Kategori</label>
                  <input
                    autoFocus required
                    className="form-control"
                    placeholder="Contoh: Makanan, Minuman, Snack..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={14} />}
                  {saving ? 'Menyimpan...' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Hapus Kategori?</div>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.6 }}>
                Kategori akan dihapus. Produk yang menggunakan kategori ini tidak akan terhapus, namun akan menjadi tidak berkategori.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      <MobileNav />
    </div>
  );
}
