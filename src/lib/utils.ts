export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('id-ID').format(n);

export const calcDiscountedPrice = (price: number, discPercent: number, discNominal: number): number => {
  if (discNominal > 0) return Math.max(0, price - discNominal);
  if (discPercent > 0) return Math.max(0, price - (price * discPercent) / 100);
  return price;
};

export const calcGrowthColor = (growth: number): string => {
  if (growth > 0) return '#10b981';
  if (growth < 0) return '#ef4444';
  return '#94a3b8';
};

export const getGrowthLabel = (growth: number): string => {
  if (growth > 0) return `+${growth}%`;
  return `${growth}%`;
};

export const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return `https://ui-avatars.com/api/?name=P&background=4f46e5&color=fff&size=200`;
  return imagePath;
};
