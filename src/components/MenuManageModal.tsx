import React, { useState } from 'react';
import { MenuItem, CategoryId } from '../types/pos';
import { CATEGORIES } from '../data/mockMenu';
import { formatRupiah } from '../utils/format';
import { X, Plus, UtensilsCrossed, Check } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface MenuManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: MenuItem[];
  onAddProduct: (product: MenuItem) => void;
  onToggleAvailability: (productId: string) => void;
}

export const MenuManageModal: React.FC<MenuManageModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onToggleAvailability,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newCategory, setNewCategory] = useState<CategoryId>('makanan');
  const [newImage, setNewImage] = useState('');

  if (!isOpen) return null;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice || Number(newPrice) <= 0) {
      alert('Mohon isi nama menu dan harga dengan benar.');
      return;
    }

    const defaultImg =
      newCategory === 'minuman'
        ? 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80'
        : newCategory === 'hotplate'
        ? 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80';

    const item: MenuItem = {
      id: `prod-custom-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      price: Number(newPrice),
      image: newImage.trim() || defaultImg,
      isAvailable: true,
      isPopular: false,
    };

    posAudio.playSuccess();
    onAddProduct(item);
    setNewName('');
    setNewPrice('');
    setNewImage('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#2563eb] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-blue-100" />
            <h3 className="text-base sm:text-lg font-bold">Kelola Menu & Harga · Dapur Hasymi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            Total {products.length} menu terdaftar di sistem POS Dapur Hasymi
          </span>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Form' : 'Tambah Menu Baru'}</span>
          </button>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateProduct}
            className="p-4 bg-blue-50/50 border-b border-blue-100 space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
              Input Menu Baru
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nama Menu
                </label>
                <input
                  type="text"
                  placeholder="cth: Bebek Goreng Madura"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Kategori
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CategoryId)}
                  className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  placeholder="35000"
                  value={newPrice}
                  onChange={(e) =>
                    setNewPrice(e.target.value ? Number(e.target.value) : '')
                  }
                  required
                  className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                URL Foto (Opsional, gunakan Unsplash atau kosongkan untuk otomatis)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-[#2563eb] text-white rounded-lg text-xs font-bold hover:bg-[#1d4ed8] cursor-pointer shadow-xs"
              >
                Simpan Menu Baru
              </button>
            </div>
          </form>
        )}

        {/* Menu list */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-neutral-100">
          {products.map((item) => (
            <div
              key={item.id}
              className="py-2.5 flex items-center justify-between gap-3 hover:bg-neutral-50 px-2 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-neutral-800 truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 capitalize">
                    {item.category} · {formatRupiah(item.price)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    posAudio.playBeep(450, 0.03);
                    onToggleAvailability(item.id);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                    item.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                  }`}
                >
                  {item.isAvailable ? 'Tersedia' : 'Habis'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
