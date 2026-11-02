import React from 'react';
import { CompletedTransaction } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { X, ReceiptText, Printer, ArrowUpRight, DollarSign, ShoppingBag } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface TransactionsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: CompletedTransaction[];
  onSelectTransactionToReprint: (tx: CompletedTransaction) => void;
}

export const TransactionsHistoryModal: React.FC<TransactionsHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onSelectTransactionToReprint,
}) => {
  if (!isOpen) return null;

  const totalSales = transactions.reduce((acc, tx) => acc + tx.total, 0);
  const totalItemsSold = transactions.reduce(
    (acc, tx) => acc + tx.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

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
            <ReceiptText className="w-5 h-5 text-blue-100" />
            <h3 className="text-base sm:text-lg font-bold">Riwayat Transaksi · Dapur Hasymi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shift Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-neutral-50 border-b border-neutral-200">
          <div className="bg-white p-3 rounded-xl border border-neutral-200">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Penjualan</span>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-600 font-mono mt-0.5">
              {formatRupiah(totalSales)}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-neutral-200">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <ReceiptText className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Total Transaksi</span>
            </div>
            <div className="text-base sm:text-lg font-black text-neutral-800 font-mono mt-0.5">
              {transactions.length} Struk
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-neutral-200 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>Item Terjual</span>
            </div>
            <div className="text-base sm:text-lg font-black text-neutral-800 font-mono mt-0.5">
              {totalItemsSold} Porsi
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-neutral-100">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-neutral-400">
              <ReceiptText className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
              <p className="text-sm font-semibold text-neutral-600">
                Belum ada transaksi hari ini
              </p>
              <p className="text-xs text-neutral-400">
                Selesaikan transaksi di kasir untuk melihat riwayat struk di sini.
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-neutral-50/80 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-neutral-900">
                      {tx.orderNumber}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-[#2563eb] font-bold px-1.5 py-0.5 rounded">
                      Meja {tx.tableNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {tx.paymentMethod}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 truncate">
                    {tx.items.map((it) => `${it.name} (${it.quantity})`).join(', ')}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {tx.timestamp} · Kasir: {tx.cashierName}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold font-mono text-neutral-900">
                    {formatRupiah(tx.total)}
                  </span>
                  <button
                    onClick={() => {
                      posAudio.playBeep(520, 0.04);
                      onSelectTransactionToReprint(tx);
                    }}
                    className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    title="Cetak Ulang Struk"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Struk</span>
                  </button>
                </div>
              </div>
            ))
          )}
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
