import React from 'react';
import { Category, CategoryId } from '../types/pos';
import { posAudio } from '../utils/audio';

interface CategoryBarProps {
  categories: Category[];
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  categoryCounts?: Record<CategoryId, number>;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  categoryCounts = {} as Record<CategoryId, number>,
}) => {
  return (
    <div className="bg-white border-b border-neutral-200 px-3 sm:px-4 shadow-xs sticky top-[53px] sm:top-[61px] z-20">
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = categoryCounts[cat.id];

          return (
            <button
              key={cat.id}
              onClick={() => {
                posAudio.playBeep(480, 0.03);
                onSelectCategory(cat.id);
              }}
              className={`relative px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'text-[#2563eb]'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span>{cat.label}</span>
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-blue-100 text-[#2563eb] font-bold'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {count}
                </span>
              )}

              {/* Blue underline indicator for active category */}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#2563eb] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
