import React, { useState } from 'react';
import { OrderItem } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  Zap, 
  ShoppingBag, 
  Check, 
  Edit3
} from 'lucide-react';
import { posAudio } from '../utils/audio';

interface OrderSidebarProps {
  orderItems: OrderItem[];
  tableNumber: string | number;
  taxRate: number; // e.g. 0.1 for 10%
  serviceRate: number; // e.g. 0.05 for 5%
  discountNominal: number;
  discountPercentage: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearOrder: () => void;
  onUpdateNote: (id: string, note: string) => void;
  onToggleTax: () => void;
  onToggleService: () => void;
  isTaxEnabled: boolean;
  isServiceEnabled: boolean;
  onSaveOrder: () => void;
  onCheckout: () => void;
  onOpenQuickAction: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const OrderSidebar: React.FC<OrderSidebarProps> = ({
  orderItems,
  tableNumber,
  taxRate,
  serviceRate,
  discountNominal,
  discountPercentage,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onUpdateNote,
  onToggleTax,
  onToggleService,
  isTaxEnabled,
  isServiceEnabled,
  onSaveOrder,
  onCheckout,
  onOpenQuickAction,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [showFeeOptions, setShowFeeOptions] = useState(false);

  // Calculate totals
  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const discountAmount =
    discountNominal + (discountPercentage > 0 ? (subtotal * discountPercentage) / 100 : 0);

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  const tax = isTaxEnabled ? discountedSubtotal * taxRate : 0;
  const service = isServiceEnabled ? discountedSubtotal * serviceRate : 0;
  const grandTotal = Math.round(discountedSubtotal + tax + service);

  const handleStartEditNote = (item: OrderItem) => {
    setEditingNoteId(item.id);
    setTempNote(item.note || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateNote(id, tempNote.trim());
    setEditingNoteId(null);
  };

  return (
    <aside
      className={`bg-white border-l border-neutral-200 flex flex-col h-full shadow-lg lg:shadow-none transition-transform z-30 ${
        isMobileOpen
          ? 'fixed inset-y-0 right-0 w-full sm:w-[420px] max-w-full'
          : 'hidden lg:flex lg:w-[380px] xl:w-[420px] shrink-0'
      }`}
    >
      {/* Header matching screenshot */}
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-md text-neutral-400 hover:text-neutral-700 mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-base sm:text-lg font-bold text-neutral-800 tracking-tight">
            Daftar Pesanan
          </h2>
          <span className="text-xs bg-blue-50 text-[#2563eb] font-semibold px-2 py-0.5 rounded-md border border-blue-100">
            Meja {tableNumber}
          </span>
        </div>

        {orderItems.length > 0 && (
          <button
            onClick={() => {
              posAudio.playRemove();
              if (window.confirm('Hapus semua pesanan saat ini?')) {
                onClearOrder();
              }
            }}
            className="text-xs text-neutral-500 hover:text-[#2563eb] border border-neutral-200 hover:border-[#2563eb] px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        )}
      </div>

      {/* Order List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-neutral-100">
        {orderItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-neutral-400 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-[#2563eb]/60" />
            </div>
            <p className="text-sm font-semibold text-neutral-700">
              Belum ada pesanan
            </p>
            <p className="text-xs text-neutral-400 mt-1 max-w-[220px]">
              Klik pada menu di sebelah kiri untuk menambahkan pesanan ke keranjang
            </p>
          </div>
        ) : (
          orderItems.map((item) => {
            const itemTotal = item.price * item.quantity;
            const isEditing = editingNoteId === item.id;

            return (
              <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 group">
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Item name & note */}
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs sm:text-[13px] font-semibold text-neutral-800 truncate">
                      {item.name}
                    </h4>
                    {item.note && !isEditing && (
                      <div className="text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        ✎ {item.note}
                      </div>
                    )}
                  </div>

                  {/* Center: Quantity Pill / Quick Controls matching screenshot 'x2' */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-5 h-5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-xs opacity-75 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Kurangi"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs sm:text-sm font-bold text-neutral-600 px-1 font-mono min-w-[24px] text-center">
                      x{item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-5 h-5 rounded bg-blue-50 hover:bg-blue-100 text-[#2563eb] flex items-center justify-center text-xs opacity-75 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Tambah"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Right: Total Item Price & Remove matching screenshot */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs sm:text-[13px] font-bold text-neutral-700 font-mono">
                      {formatRupiah(itemTotal)}
                    </span>
                    <button
                      onClick={() => {
                        posAudio.playRemove();
                        onRemoveItem(item.id);
                      }}
                      className="text-neutral-300 hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                      title="Hapus menu ini"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Inline Note Editor */}
                {isEditing ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Catatan pesanan (cth: pedas manis, tanpa es)..."
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(item.id)}
                      autoFocus
                      className="flex-1 text-xs px-2 py-1 bg-neutral-50 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                    />
                    <button
                      onClick={() => handleSaveNote(item.id)}
                      className="p-1 bg-[#2563eb] text-white rounded hover:bg-[#1d4ed8]"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="p-1 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>@ {formatRupiah(item.price)}</span>
                    <button
                      onClick={() => handleStartEditNote(item)}
                      className="hover:text-[#2563eb] transition-colors flex items-center gap-0.5 cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>{item.note ? 'Ubah Catatan' : '+ Catatan'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Extra fees toggle & summary */}
      <div className="p-3 sm:p-4 border-t border-neutral-200 bg-neutral-50/70 shrink-0 space-y-2">
        {/* "+ Biaya Tambahan" toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowFeeOptions(!showFeeOptions)}
            className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors cursor-pointer py-0.5"
          >
            {showFeeOptions ? '- Tutup Biaya Tambahan' : '+ Biaya Tambahan'}
          </button>
        </div>

        {/* Expandable Fee Toggles */}
        {showFeeOptions && (
          <div className="bg-white rounded-lg p-2.5 border border-neutral-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTaxEnabled}
                  onChange={onToggleTax}
                  className="rounded text-[#2563eb] focus:ring-[#2563eb]"
                />
                <span>Pajak Resto PB1 ({(taxRate * 100).toFixed(0)}%)</span>
              </label>
              <span className="font-mono text-neutral-600">
                {isTaxEnabled ? formatRupiah(tax) : 'Rp 0'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isServiceEnabled}
                  onChange={onToggleService}
                  className="rounded text-[#2563eb] focus:ring-[#2563eb]"
                />
                <span>Biaya Layanan ({(serviceRate * 100).toFixed(0)}%)</span>
              </label>
              <span className="font-mono text-neutral-600">
                {isServiceEnabled ? formatRupiah(service) : 'Rp 0'}
              </span>
            </div>

            {(discountAmount > 0) && (
              <div className="flex items-center justify-between text-emerald-600">
                <span>Diskon Terpasang</span>
                <span className="font-mono font-semibold">
                  -{formatRupiah(discountAmount)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Breakdown if tax/discount active */}
        {(isTaxEnabled || isServiceEnabled || discountAmount > 0) && !showFeeOptions && (
          <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
            <span>Subtotal ({orderItems.reduce((a, b) => a + b.quantity, 0)} item)</span>
            <span className="font-mono">{formatRupiah(subtotal)}</span>
          </div>
        )}

        {/* Total Section matching screenshot */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-base sm:text-lg font-bold text-neutral-800">
            Total
          </span>
          <span className="text-lg sm:text-2xl font-black text-[#2563eb] font-mono tracking-tight">
            {formatRupiah(grandTotal)}
          </span>
        </div>

        {/* Bottom 3 Action Buttons in Blue Palette */}
        <div className="grid grid-cols-12 gap-2 pt-2">
          {/* Lightning Button (⚡) */}
          <button
            onClick={() => {
              posAudio.playBeep(650, 0.04);
              onOpenQuickAction();
            }}
            className="col-span-2 sm:col-span-2 h-11 bg-neutral-700 hover:bg-neutral-800 active:scale-95 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="Aksi Cepat: Split Bill / Diskon / Cetak Cepat"
            aria-label="Aksi Cepat"
          >
            <Zap className="w-5 h-5 fill-white text-white" />
          </button>

          {/* Simpan Button */}
          <button
            onClick={() => {
              posAudio.playBeep(520, 0.05);
              onSaveOrder();
            }}
            disabled={orderItems.length === 0}
            className="col-span-4 sm:col-span-4 h-11 bg-white hover:bg-blue-50 active:scale-95 text-[#2563eb] font-bold text-sm rounded-lg border-2 border-[#2563eb] flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            Simpan
          </button>

          {/* Bayar Button */}
          <button
            onClick={() => {
              posAudio.playBeep(700, 0.05);
              onCheckout();
            }}
            disabled={orderItems.length === 0}
            className="col-span-6 sm:col-span-6 h-11 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-95 text-white font-black text-sm sm:text-base rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            Bayar
          </button>
        </div>
      </div>
    </aside>
  );
};
