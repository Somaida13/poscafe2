import React from 'react';
import { CompletedTransaction } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { Printer, Check, X, Share2, PlusCircle } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: CompletedTransaction | null;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onNewTransaction,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    posAudio.playBeep(600, 0.05);
    window.print();
  };

  const handleShare = () => {
    const text = `*RESTORAN DAPUR HASYMI*\nNo: ${transaction.orderNumber}\nMeja: ${transaction.tableNumber}\nKasir: ${transaction.cashierName}\nTotal: ${formatRupiah(transaction.total)}\nStatus: LUNAS\nTerima kasih atas kunjungan Anda di Dapur Hasymi!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Ringkasan struk Dapur Hasymi disalin ke papan klip!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-neutral-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="bg-neutral-800 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <h3 className="text-sm font-bold">Struk Pembayaran · Dapur Hasymi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Paper Card (scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex justify-center bg-neutral-200">
          <div
            id="thermal-receipt"
            className="w-full max-w-[340px] bg-white p-5 rounded shadow-md border-t-4 border-[#2563eb] font-mono text-xs text-neutral-800 leading-relaxed"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-neutral-300 space-y-0.5">
              <h2 className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-neutral-900">
                DAPUR HASYMI
              </h2>
              <p className="text-[10px] text-neutral-500">
                Kuliner Istimewa & Citarasa Nusantara
              </p>
              <p className="text-[10px] text-neutral-500">
                Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan
              </p>
              <p className="text-[10px] text-neutral-500">Telp: (021) 789-2234</p>
            </div>

            {/* Meta info */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">No. Order:</span>
                <span className="font-bold">{transaction.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Waktu:</span>
                <span>{transaction.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Kasir:</span>
                <span>{transaction.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Meja:</span>
                <span className="font-bold bg-neutral-100 px-1.5 py-0.2 rounded">
                  {transaction.tableNumber}
                </span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pelanggan:</span>
                  <span>{transaction.customerName}</span>
                </div>
              )}
            </div>

            {/* Itemized List */}
            <div className="py-3 border-b border-dashed border-neutral-300 space-y-2 text-[11px]">
              {transaction.items.map((item) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="flex justify-between font-medium">
                    <span className="text-neutral-900 truncate pr-2">
                      {item.name}
                    </span>
                    <span className="shrink-0 font-bold">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>
                      {item.quantity} x {formatRupiah(item.price)}
                    </span>
                    {item.note && (
                      <span className="italic text-amber-700">({item.note})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculation Totals */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>

              {transaction.tax > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Pajak Resto (10%)</span>
                  <span>{formatRupiah(transaction.tax)}</span>
                </div>
              )}

              {transaction.service > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Biaya Layanan (5%)</span>
                  <span>{formatRupiah(transaction.service)}</span>
                </div>
              )}

              {transaction.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Diskon</span>
                  <span>-{formatRupiah(transaction.discount)}</span>
                </div>
              )}

              <div className="flex justify-between pt-1 border-t border-neutral-300 text-xs sm:text-sm font-extrabold text-neutral-900">
                <span>TOTAL AKHIR</span>
                <span className="text-[#2563eb] font-black">
                  {formatRupiah(transaction.total)}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Metode Bayar:</span>
                <span className="uppercase font-bold text-neutral-800">
                  {transaction.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Diterima:</span>
                <span>{formatRupiah(transaction.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-neutral-500">Kembalian:</span>
                <span className="text-emerald-700">
                  {formatRupiah(transaction.change)}
                </span>
              </div>
            </div>

            {/* Footer message & Barcode */}
            <div className="text-center pt-3 space-y-1.5">
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                LUNAS / PAID
              </div>
              <p className="text-[10px] text-neutral-600">
                Terima kasih atas kunjungan Anda di Dapur Hasymi!
              </p>
              <p className="text-[9px] text-neutral-400">
                Kritik & Saran WA: 0812-3456-7890
              </p>

              {/* Decorative barcode */}
              <div className="pt-2 flex justify-center">
                <div className="flex items-center gap-0.5 h-6">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full ${
                        i % 4 === 0 || i % 7 === 0 ? 'w-1 bg-neutral-900' : 'w-0.5 bg-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-[8px] tracking-widest text-neutral-400 font-mono">
                *{transaction.orderNumber}*
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-white border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs transition-colors cursor-pointer"
              title="Salin Struk"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              posAudio.playBeep(700, 0.05);
              onNewTransaction();
            }}
            className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
