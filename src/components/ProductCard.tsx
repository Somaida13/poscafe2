import React from 'react';
import { MenuItem } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { Check, Plus } from 'lucide-react';

interface ProductCardProps {
  product: MenuItem;
  orderedQuantity?: number;
  onAddToCart: (product: MenuItem) => void;
  viewMode?: 'grid' | 'compact';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  orderedQuantity = 0,
  onAddToCart,
  viewMode = 'grid',
}) => {
  const isSelected = orderedQuantity > 0;

  if (viewMode === 'compact') {
    return (
      <div
        onClick={() => onAddToCart(product)}
        className={`group bg-white rounded-xl border p-2.5 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.98] ${
          isSelected ? 'border-blue-500/60 ring-1 ring-blue-500/40 bg-blue-50/20' : 'border-neutral-200/80 hover:border-[#2563eb]/40'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {isSelected && (
              <div className="absolute top-1 right-1 bg-[#2563eb] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-xs">
                {orderedQuantity}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-neutral-800 truncate">
              {product.name}
            </h4>
            <div className="text-xs font-bold text-[#2563eb] mt-0.5">
              {formatRupiah(product.price)}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => onAddToCart(product)}
      className={`group relative bg-white rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col active:scale-[0.98] select-none ${
        isSelected
          ? 'border-blue-500/70 ring-1 ring-blue-500/40'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      {/* Image Container matching aspect ratio in screenshot */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Selected badge in blue */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-[#2563eb] text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md animate-in zoom-in-75 duration-150">
            {orderedQuantity > 1 ? (
              <span className="text-[11px] font-bold font-mono">
                {orderedQuantity}
              </span>
            ) : (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            )}
          </div>
        )}

        {/* Hover quick add overlay on desktop */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-neutral-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-[#2563eb]" /> Tambah
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between bg-white">
        <h4 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800 leading-snug line-clamp-2 min-h-[2.4em] group-hover:text-[#2563eb] transition-colors">
          {product.name}
        </h4>
        <div className="mt-1 flex items-center justify-between text-neutral-500">
          <span className="text-[11px] sm:text-xs font-bold text-[#2563eb]">
            {formatRupiah(product.price)}
          </span>
          {product.isPopular && (
            <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Favorit
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
