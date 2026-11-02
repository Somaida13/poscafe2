import React, { useState } from 'react';
import { formatRupiah } from '../utils/format';
import { X, Zap, Users, Tag, Percent, DollarSign, Check } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  discountPercentage: number;
  discountNominal: number;
  onApplyDiscount: (percentage: number, nominal: number) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  total,
  discountPercentage,
  discountNominal,
  onApplyDiscount,
}) => {
  const [splitCount, setSplitCount] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'split' | 'discount'>('split');
  const [customPercent, setCustomPercent] = useState<number>(discountPercentage);
  const [customNominal, setCustomNominal] = useState<number>(discountNominal);

  if (!isOpen) return null;

  const perPersonAmount = Math.ceil(total / splitCount);

  const handleSetPercent = (p: number) => {
    posAudio.playBeep(520, 0.04);
    setCustomPercent(p);
    setCustomNominal(0);
    onApplyDiscount(p, 0);
  };

  const handleSetNominal = (n: number) => {
    posAudio.playBeep(520, 0.04);
    setCustomNominal(n);
    setCustomPercent(0);
    onApplyDiscount(0, n);
  };

  const handleResetDiscount = () => {
    setCustomPercent(0);
    setCustomNominal(0);
    onApplyDiscount(0, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-neutral-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-base font-bold">Aksi Cepat Kasir</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 p-1">
          <button
            onClick={() => setActiveTab('split')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'split'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Users className="w-4 h-4 text-neutral-600" />
            <span>Kalkulator Split Bill</span>
          </button>

          <button
            onClick={() => setActiveTab('discount')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'discount'
                ? 'bg-white text-[#2563eb] shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Tag className="w-4 h-4 text-[#2563eb]" />
            <span>Diskon & Promo</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeTab === 'split' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-xs text-neutral-500">Total Tagihan Saat Ini</div>
                <div className="text-2xl font-black text-[#2563eb] font-mono mt-0.5">
                  {formatRupiah(total)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Jumlah Orang yang Membagi:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        posAudio.playBeep(500, 0.03);
                        setSplitCount(count);
                      }}
                      className={`py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        splitCount === count
                          ? 'bg-[#2563eb] text-white shadow-xs'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {count} Orang
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <div className="text-xs text-emerald-800 font-semibold">
                  Bayar Masing-masing ({splitCount} orang):
                </div>
                <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                  {formatRupiah(perPersonAmount)}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1">
                  Rata per orang sudah dibulatkan
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discount' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-[#2563eb]" />
                  Diskon Persentase:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSetPercent(p)}
                      className={`py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        customPercent === p
                          ? 'bg-[#2563eb] text-white'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Potongan Nominal:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10000, 25000, 50000].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleSetNominal(n)}
                      className={`py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        customNominal === n
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {formatRupiah(n)}
                    </button>
                  ))}
                </div>
              </div>

              {(customPercent > 0 || customNominal > 0) && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg text-xs text-blue-700 border border-blue-200">
                  <span>
                    Diskon aktif:{' '}
                    <strong>
                      {customPercent > 0 ? `${customPercent}%` : formatRupiah(customNominal)}
                    </strong>
                  </span>
                  <button
                    onClick={handleResetDiscount}
                    className="text-neutral-500 hover:text-blue-600 underline font-semibold cursor-pointer"
                  >
                    Hapus Diskon
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
