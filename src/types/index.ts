export interface User {
  id: string;
  email: string;
  shop_name: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  category_name: string;
}

export interface Product {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  image_path: string | null;
  price: number;
  discount_percent: number;
  discount_nominal: number;
  stock: number;
  created_at: string;
  categories?: Category;
}

// ── Option system ───────────────────────────────────────────────
export interface ProductOptionGroup {
  id: string;
  product_id: string;
  user_id: string;
  name: string;
  required: boolean;
  max_select: number;   // 1 = single, >1 = multi
  sort_order: number;
  created_at: string;
  product_options?: ProductOption[];
}

export interface ProductOption {
  id: string;
  group_id: string;
  product_id: string;
  user_id: string;
  name: string;
  price_addition: number;  // 0 = gratis
  sort_order: number;
  created_at: string;
}

// What user picked in POS
export interface SelectedOption {
  optionId: string;
  optionName: string;
  groupId: string;
  groupName: string;
  priceAddition: number;
}

// ── Cart ─────────────────────────────────────────────────────────
export interface CartItem {
  cartKey: string;            // productId::optionId1|optionId2
  product: Product;
  quantity: number;
  selectedOptions: SelectedOption[];
  optionTotal: number;        // sum of priceAddition
}

// ── Transactions ─────────────────────────────────────────────────
export interface Transaction {
  id: string;
  user_id: string;
  transaction_number: string;
  total_price: number;
  total_discount: number;
  payment_amount: number;
  change_amount: number;
  created_at: string;
  transaction_details?: TransactionDetail[];
}

export interface TransactionDetail {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  discount_at_purchase: number;
  options_total: number;
  options_snapshot: SelectedOption[];
  products?: Product;
}

// ── Analytics ────────────────────────────────────────────────────
export interface AnalyticsSummary {
  today_revenue: number;
  yesterday_revenue: number;
  this_month_revenue: number;
  last_month_revenue: number;
  this_year_revenue: number;
  last_year_revenue: number;
  today_transactions: number;
  total_transactions: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  transactions: number;
}
