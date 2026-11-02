import React from 'react';
import { MenuItem, OrderItem } from '../types/pos';
import { ProductCard } from './ProductCard';
import { Utensils, SearchX } from 'lucide-react';

interface ProductGridProps {
  products: MenuItem[];
  orderItems: OrderItem[];
  onAddToCart: (product: MenuItem) => void;
  viewMode: 'grid' | 'compact';
  searchQuery: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  orderItems,
  onAddToCart,
  viewMode,
  searchQuery,
}) => {
  // Map product id to ordered quantity
  const quantityMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of orderItems) {
      map.set(item.productId, (map.get(item.productId) || 0) + item.quantity);
    }
    return map;
  }, [orderItems]);

  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
          {searchQuery ? <SearchX className="w-8 h-8 text-neutral-400" /> : <Utensils className="w-8 h-8 text-neutral-400" />}
        </div>
        <h3 className="text-base font-semibold text-neutral-700">
          {searchQuery ? 'Produk Tidak Ditemukan' : 'Belum Ada Menu'}
        </h3>
        <p className="text-xs text-neutral-500 max-w-xs mt-1">
          {searchQuery
            ? `Tidak ada menu yang sesuai dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
            : 'Silakan pilih kategori lain atau tambahkan menu baru.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-neutral-50/60">
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2.5 sm:gap-3.5'
            : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5'
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            orderedQuantity={quantityMap.get(product.id) || 0}
            onAddToCart={onAddToCart}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};
