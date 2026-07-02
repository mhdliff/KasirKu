import { useState } from 'react';
import { useProductOptions } from '../../hooks/useProductOptions';
import { ProductOptionGroup, ProductOption } from '../../types';
import { formatRupiah } from '../../lib/utils';
import {
  Plus, Trash2, ChevronDown, ChevronUp,
  Pencil, Check, X, Loader2, GripVertical, ToggleLeft, ToggleRight
} from 'lucide-react';

// ── Inline editable option row ──────────────────────────────────
function OptionRow({
  option, onUpdate, onDelete,
}: {
  option: ProductOption;
  onUpdate: (id: string, name: string, price: number) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(option.name);
  const [price, setPrice]     = useState(String(option.price_addition));
  const [saving, setSaving]   = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(option.id, name.trim() || option.name, Number(price) || 0);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0' }}>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nama pilihan"
          style={{
            flex: 2, padding: '7px 10px', border: '1.5px solid var(--brand-400)',
            borderRadius: 8, fontSize: 13, outline: 'none',
            fontFamily: 'var(--font-body)',
          }}
        />
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--gray-400)', pointerEvents: 'none' }}>Rp</span>
          <input
            type="number" min="0"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0"
            style={{
              width: '100%', padding: '7px 8px 7px 24px',
              border: '1.5px solid var(--brand-400)', borderRadius: 8, fontSize: 13, outline: 'none',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
        <button
          onClick={save} disabled={saving}
          style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--brand-500)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}
        >
          {saving ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={13} />}
        </button>
        <button
          onClick={() => { setName(option.name); setPrice(String(option.price_addition)); setEditing(false); }}
          style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--gray-100)', border: '1px solid var(--gray-200)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)', flexShrink: 0 }}
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  const price_n = Number(option.price_addition);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
      borderBottom: '1px solid var(--gray-50)',
    }}>
      <GripVertical size={14} color="var(--gray-300)" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13.5, color: 'var(--gray-800)' }}>{option.name}</span>
      <span style={{
        fontSize: 13, fontWeight: 700, minWidth: 70, textAlign: 'right',
        color: price_n === 0 ? 'var(--accent-emerald)' : 'var(--gray-700)',
      }}>
        {price_n === 0 ? 'Gratis' : `+${formatRupiah(price_n)}`}
      </span>
      <button
        onClick={() => setEditing(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4, borderRadius: 6 }}
        title="Edit"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={() => onDelete(option.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)', padding: 4, borderRadius: 6 }}
        title="Hapus"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── Add option form ─────────────────────────────────────────────
function AddOptionForm({
  onSave, onCancel,
}: {
  onSave: (name: string, price: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName]   = useState('');
  const [price, setPrice] = useState('0');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), Number(price) || 0);
    setSaving(false);
    setName(''); setPrice('0');
    onCancel();
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0' }}>
      <input
        autoFocus required
        value={name} onChange={e => setName(e.target.value)}
        placeholder="Nama pilihan (cth: Pedas)"
        style={{
          flex: 2, padding: '8px 10px',
          border: '1.5px solid var(--brand-400)', borderRadius: 9, fontSize: 13,
          fontFamily: 'var(--font-body)', outline: 'none',
        }}
      />
      <div style={{ position: 'relative', flex: 1 }}>
        <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--gray-400)', pointerEvents: 'none' }}>Rp</span>
        <input
          type="number" min="0" inputMode="numeric"
          value={price} onChange={e => setPrice(e.target.value)}
          placeholder="0 = Gratis"
          style={{
            width: '100%', padding: '8px 8px 8px 24px',
            border: '1.5px solid var(--brand-400)', borderRadius: 9, fontSize: 13,
            fontFamily: 'var(--font-body)', outline: 'none',
          }}
        />
      </div>
      <button type="submit" disabled={saving}
        style={{ padding: '8px 14px', background: 'var(--brand-500)', color: 'white', border: 'none', borderRadius: 9, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        {saving ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={12} />}
        Simpan
      </button>
      <button type="button" onClick={onCancel}
        style={{ width: 32, height: 32, background: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)', flexShrink: 0 }}>
        <X size={14} />
      </button>
    </form>
  );
}

// ── Group card ──────────────────────────────────────────────────
function GroupCard({
  group,
  onUpdateGroup, onDeleteGroup,
  onCreateOption, onUpdateOption, onDeleteOption,
}: {
  group: ProductOptionGroup;
  onUpdateGroup: (id: string, data: Partial<ProductOptionGroup>) => void;
  onDeleteGroup: (id: string) => void;
  onCreateOption: (groupId: string, name: string, price: number) => Promise<void>;
  onUpdateOption: (id: string, name: string, price: number) => void;
  onDeleteOption: (id: string) => void;
}) {
  const [expanded, setExpanded]       = useState(true);
  const [showAddOpt, setShowAddOpt]   = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [groupName, setGroupName]     = useState(group.name);

  const options = group.product_options || [];

  return (
    <div style={{
      border: '1.5px solid var(--gray-200)', borderRadius: 14,
      overflow: 'hidden', marginBottom: 10,
      background: 'var(--surface-0)',
    }}>
      {/* Group header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 14px',
        background: expanded ? 'var(--gray-50)' : 'var(--surface-0)',
        borderBottom: expanded ? '1px solid var(--gray-200)' : 'none',
      }}>
        {editingName ? (
          <input
            autoFocus
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            onBlur={() => { onUpdateGroup(group.id, { name: groupName }); setEditingName(false); }}
            onKeyDown={e => { if (e.key === 'Enter') { onUpdateGroup(group.id, { name: groupName }); setEditingName(false); } if (e.key === 'Escape') { setGroupName(group.name); setEditingName(false); } }}
            style={{ flex: 1, padding: '4px 8px', border: '1.5px solid var(--brand-400)', borderRadius: 6, fontSize: 13.5, fontWeight: 600, outline: 'none', fontFamily: 'var(--font-body)' }}
          />
        ) : (
          <span
            style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--gray-900)', cursor: 'pointer' }}
            onDoubleClick={() => setEditingName(true)}
          >
            {group.name}
          </span>
        )}

        {/* Required toggle */}
        <button
          onClick={() => onUpdateGroup(group.id, { required: !group.required })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: group.required ? 'var(--accent-rose)' : 'var(--gray-400)', fontSize: 11, fontWeight: 600 }}
          title={group.required ? 'Wajib dipilih' : 'Opsional'}
        >
          {group.required ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          <span style={{ fontSize: 11 }}>{group.required ? 'Wajib' : 'Opsional'}</span>
        </button>

        {/* Max select badge */}
        <select
          value={group.max_select}
          onChange={e => onUpdateGroup(group.id, { max_select: Number(e.target.value) })}
          style={{ border: '1px solid var(--gray-200)', borderRadius: 6, padding: '3px 6px', fontSize: 11, color: 'var(--gray-600)', background: 'white', cursor: 'pointer' }}
          title="Maks pilihan"
        >
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n === 1 ? 'Pilih 1' : `Maks ${n}`}</option>)}
        </select>

        <button
          onClick={() => setExpanded(e => !e)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4 }}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <button
          onClick={() => onDeleteGroup(group.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)', padding: 4, borderRadius: 6 }}
          title="Hapus grup"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Options list */}
      {expanded && (
        <div style={{ padding: '6px 14px 10px' }}>
          {options.length === 0 && !showAddOpt && (
            <p style={{ fontSize: 12.5, color: 'var(--gray-400)', padding: '6px 0', fontStyle: 'italic' }}>
              Belum ada pilihan. Klik + untuk menambahkan.
            </p>
          )}
          {options.map(opt => (
            <OptionRow
              key={opt.id}
              option={opt}
              onUpdate={onUpdateOption}
              onDelete={onDeleteOption}
            />
          ))}

          {showAddOpt ? (
            <AddOptionForm
              onSave={(name, price) => onCreateOption(group.id, name, price)}
              onCancel={() => setShowAddOpt(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddOpt(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 10px', marginTop: 6,
                background: 'var(--brand-50)', color: 'var(--brand-600)',
                border: '1.5px dashed var(--brand-300)', borderRadius: 9,
                cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
              }}
            >
              <Plus size={13} /> Tambah Pilihan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main OptionManager export ───────────────────────────────────
interface Props {
  productId: string | null;
}

export function OptionManager({ productId }: Props) {
  const {
    groups, loading,
    createGroup, updateGroup, deleteGroup,
    createOption, updateOption, deleteOption,
  } = useProductOptions(productId);

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [savingGroup, setSavingGroup]   = useState(false);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setSavingGroup(true);
    await createGroup(newGroupName.trim(), false, 1);
    setSavingGroup(false);
    setNewGroupName('');
    setShowAddGroup(false);
  };

  if (!productId) {
    return (
      <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 12, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
          💾 Simpan produk terlebih dahulu untuk menambahkan varian
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
            Varian &amp; Tambahan
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
            Buat grup pilihan seperti ukuran, tingkat kepedasan, topping, dll
          </div>
        </div>
        <button
          onClick={() => setShowAddGroup(true)}
          className="btn btn-primary btn-sm"
          style={{ flexShrink: 0 }}
        >
          <Plus size={13} /> Grup Baru
        </button>
      </div>

      {/* Add group form */}
      {showAddGroup && (
        <form onSubmit={handleAddGroup} style={{
          display: 'flex', gap: 8, marginBottom: 12, padding: '12px',
          background: 'var(--brand-50)', border: '1.5px solid var(--brand-200)', borderRadius: 12,
        }}>
          <input
            autoFocus required
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            placeholder="Nama grup (cth: Tingkat Kepedasan)"
            style={{ flex: 1, padding: '8px 12px', border: '1.5px solid var(--brand-400)', borderRadius: 9, fontSize: 13.5, fontFamily: 'var(--font-body)', outline: 'none' }}
          />
          <button type="submit" disabled={savingGroup}
            className="btn btn-primary btn-sm">
            {savingGroup ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={12} />}
            Buat
          </button>
          <button type="button" onClick={() => { setShowAddGroup(false); setNewGroupName(''); }}
            className="btn btn-secondary btn-sm">
            <X size={12} />
          </button>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Loader2 size={22} color="var(--brand-500)" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Empty state */}
      {!loading && groups.length === 0 && !showAddGroup && (
        <div style={{
          padding: '24px', textAlign: 'center',
          background: 'var(--gray-50)', borderRadius: 12,
          border: '1.5px dashed var(--gray-200)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🍽️</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 4 }}>
            Belum ada varian
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--gray-400)' }}>
            Tambahkan grup varian seperti ukuran porsi, tingkat kepedasan, atau topping
          </div>
        </div>
      )}

      {/* Groups */}
      {groups.map(group => (
        <GroupCard
          key={group.id}
          group={group}
          onUpdateGroup={(id, data) => updateGroup(id, data)}
          onDeleteGroup={(id) => deleteGroup(id)}
          onCreateOption={(gId, name, price) => createOption(gId, name, price)}
          onUpdateOption={(id, name, price) => updateOption(id, { name, price_addition: price })}
          onDeleteOption={(id) => deleteOption(id)}
        />
      ))}
    </div>
  );
}
