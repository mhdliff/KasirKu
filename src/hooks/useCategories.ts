import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import { useAuth } from './useAuth';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('category_name');
    setCategories((data as Category[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const createCategory = async (name: string) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('categories').insert({ category_name: name, user_id: user.id });
    if (!error) fetchCategories();
    return { error: error?.message || null };
  };

  const updateCategory = async (id: string, name: string) => {
    const { error } = await supabase.from('categories').update({ category_name: name }).eq('id', id);
    if (!error) fetchCategories();
    return { error: error?.message || null };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) fetchCategories();
    return { error: error?.message || null };
  };

  return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory };
}
