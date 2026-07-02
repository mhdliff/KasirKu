import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ProductOptionGroup, ProductOption } from '../types';
import { useAuth } from './useAuth';

export function useProductOptions(productId: string | null) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<ProductOptionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    if (!productId) { setGroups([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('product_option_groups')
      .select('*, product_options(*)') 
      .eq('product_id', productId)
      .order('sort_order')
      .order('created_at', { referencedTable: 'product_options' });
    setGroups((data as unknown as ProductOptionGroup[]) || []);
    setLoading(false);
  }, [productId]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  // ── Groups ──────────────────────────────────────────────────
  const createGroup = async (name: string, required: boolean, max_select: number) => {
    if (!user || !productId) return { error: 'Not ready' };
    const { error } = await supabase.from('product_option_groups').insert({
      product_id: productId, user_id: user.id, name, required, max_select,
      sort_order: groups.length,
    });
    if (!error) fetchGroups();
    return { error: error?.message || null };
  };

  const updateGroup = async (groupId: string, data: Partial<ProductOptionGroup>) => {
    const { error } = await supabase
      .from('product_option_groups').update(data).eq('id', groupId);
    if (!error) fetchGroups();
    return { error: error?.message || null };
  };

  const deleteGroup = async (groupId: string) => {
    const { error } = await supabase
      .from('product_option_groups').delete().eq('id', groupId);
    if (!error) fetchGroups();
    return { error: error?.message || null };
  };

  // ── Options ──────────────────────────────────────────────────
  const createOption = async (groupId: string, name: string, price_addition: number) => {
    if (!user || !productId) return { error: 'Not ready' };
    const group = groups.find(g => g.id === groupId);
    const sortOrder = group?.product_options?.length || 0;
    const { error } = await supabase.from('product_options').insert({
      group_id: groupId, product_id: productId, user_id: user.id,
      name, price_addition, sort_order: sortOrder,
    });
    if (!error) fetchGroups();
    return { error: error?.message || null };
  };

  const updateOption = async (optionId: string, data: Partial<ProductOption>) => {
    const { error } = await supabase
      .from('product_options').update(data).eq('id', optionId);
    if (!error) fetchGroups();
    return { error: error?.message || null };
  };

  const deleteOption = async (optionId: string) => {
    const { error } = await supabase
      .from('product_options').delete().eq('id', optionId);
    if (!error) fetchGroups();
    return { error: error?.message || null };
  };

  return {
    groups, loading, fetchGroups,
    createGroup, updateGroup, deleteGroup,
    createOption, updateOption, deleteOption,
  };
}

// Lightweight fetch for POS — just reads option groups + options for a product
export async function fetchProductOptions(productId: string): Promise<ProductOptionGroup[]> {
  const { data } = await supabase
    .from('product_option_groups')
    .select('*, product_options(*)')
    .eq('product_id', productId)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'product_options' });
  return (data as unknown as ProductOptionGroup[]) || [];
}
