-- ============================================================
-- POS UMKM — Addon: Product Options / Variants
-- Jalankan di Supabase SQL Editor SETELAH supabase_schema.sql
-- ============================================================

-- TABLE: product_option_groups
-- Contoh: "Tingkat Kepedasan", "Tambahan", "Ukuran"
CREATE TABLE IF NOT EXISTS public.product_option_groups (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id   UUID REFERENCES public.products(id)  ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES public.profiles(id)  ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  required     BOOLEAN DEFAULT FALSE,
  max_select   INTEGER DEFAULT 1,   -- 1 = pilih satu, >1 = bisa pilih banyak
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: product_options
-- Contoh: "Pedas - Gratis", "Telor Ceplok - +Rp5000"
CREATE TABLE IF NOT EXISTS public.product_options (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id        UUID REFERENCES public.product_option_groups(id) ON DELETE CASCADE NOT NULL,
  product_id      UUID REFERENCES public.products(id)              ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES public.profiles(id)              ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  price_addition  NUMERIC(15,2) DEFAULT 0,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Add options snapshot to transaction_details
ALTER TABLE public.transaction_details
  ADD COLUMN IF NOT EXISTS options_total    NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS options_snapshot JSONB         DEFAULT '[]'::jsonb;

-- ── Row Level Security ──────────────────────────────────────────
ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own option groups"
  ON public.product_option_groups FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users CRUD own options"
  ON public.product_options FOR ALL USING (auth.uid() = user_id);

-- ── Indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_option_groups_product_id
  ON public.product_option_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_options_group_id
  ON public.product_options(group_id);
CREATE INDEX IF NOT EXISTS idx_options_product_id
  ON public.product_options(product_id);
