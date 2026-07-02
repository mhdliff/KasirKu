import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useAuth } from './useAuth';

export function useProducts(categoryFilter?: string | null) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, categories(id, category_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (categoryFilter) query = query.eq('category_id', categoryFilter);

    const { data, error } = await query;
    if (error) setError(error.message);
    else setProducts((data as unknown as Product[]) || []);
    setLoading(false);
  }, [user, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const createProduct = async (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'categories'>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('products').insert({ ...product, user_id: user.id });
    if (!error) fetchProducts();
    return { error: error?.message || null };
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (!error) fetchProducts();
    return { error: error?.message || null };
  };

  const deleteProduct = async (id: string) => {
    const { data: product } = await supabase.from('products').select('image_path').eq('id', id).single();
    if (product?.image_path) {
      const path = product.image_path.split('/').pop();
      if (path) await supabase.storage.from('product-images').remove([`${user?.id}/${path}`]);
    }
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
    return { error: error?.message || null };
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) return null;
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  return { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct, uploadImage };
}
