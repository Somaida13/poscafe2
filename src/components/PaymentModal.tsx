import React, { useState, useMemo } from 'react';
import { PaymentMethodType, OrderItem } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { posAudio } from '../utils/audio';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  subtotal: number;
  tax: number;
  service: number;
  discount: number;
  orderItems: OrderItem[];
  tableNumber: string | number;
  cashierName: string;
  onPaymentSuccess: (paymentData: {
    method: PaymentMethodType;
    amountPaid: number;
    change: number;
    customerName: string;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  subtotal,
  tax,
  service,
  discount,
  orderItems,
  tableNumber,
  cashierName: _cashierName,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethodType>('tunai');
  const [amountPaid, setAmountPaid] = useState<number>(total);
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Quick cash amount presets based on current total
  const quickCashOptions = useMemo(() => {
    const list = [total];
    const rounded50k = Math.ceil(total / 50000) * 50000;
    const rounded100k = Math.ceil(total / 100000) * 100000;
    const commonValues = [50000, 100000, 200000, 500000];

    const set = new Set<number>();
    set.add(total);
    if (rounded50k > total) set.add(rounded50k);
    if (rounded100k > total) set.add(rounded100k);
    commonValues.forEach((v) => {
      if (v >= total) set.add(v);
    });

    return Array.from(set).sort((a, b) => a - b).slice(0, 5);
  }, [total]);

  // Keep amountPaid in sync when total changes
  React.useEffect(() => {
    setAmountPaid(total);
  }, [total]);

  if (!isOpen) return null;

  const change = Math.max(0, amountPaid - total);
  const isCashInsufficient = method === 'tunai' && amountPaid < total;

  const handleProcessPayment = () => {
    if (isCashInsufficient) {
      alert('Nominal uang tunai kurang dari total pembayaran!');
      return;
    }

    setIsProcessing(true);
    posAudio.playSuccess();

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }

    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess({
        method,
        amountPaid: method === 'tunai' ? amountPaid : total,
        change: method === 'tunai' ? change : 0,
        customerName: customerName.trim() || `Pelanggan Meja ${tableNumber}`,
      });
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#2563eb] text-white px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-100 font-semibold">
              Pembayaran Pesanan · Dapur Hasymi
            </div>
            <h3 className="text-lg font-bold">Meja {tableNumber}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Display Banner */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-500 block">
              Total Tagihan ({orderItems.reduce((a, b) => a + b.quantity, 0)} item)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#2563eb] font-mono">
              {formatRupiah(total)}
            </span>
          </div>

          <div className="text-right text-xs text-neutral-500">
            <div>Subtotal: {formatRupiah(subtotal)}</div>
            {tax > 0 && <div>Pajak (10%): {formatRupiah(tax)}</div>}
            {service > 0 && <div>Layanan (5%): {formatRupiah(service)}</div>}
            {discount > 0 && <div className="text-emerald-600 font-bold">Diskon: -{formatRupiah(discount)}</div>}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Customer Name Input (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nama Pelanggan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pak Budi / Meja 12"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  posAudio.playBeep(500, 0.03);
                  setMethod('tunai');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  method === 'tunai'
                    ? 'border-[#2563eb] bg-blue-50/50 text-[#2563eb] shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs font-bold">Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  posAudio.playBeep(500, 0.03);
                  setMethod('qris');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  method === 'qris'
                    ? 'border-[#2563eb] bg-blue-50/50 text-[#2563eb] shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-bold">QRIS Instant</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  posAudio.playBeep(500, 0.03);
                  setMethod('debit');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  method === 'debit'
                    ? 'border-[#2563eb] bg-blue-50/50 text-[#2563eb] shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-bold">Kartu Debit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  posAudio.playBeep(500, 0.03);
                  setMethod('transfer');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  method === 'transfer'
                    ? 'border-[#2563eb] bg-blue-50/50 text-[#2563eb] shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs font-bold">Transfer / EDC</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Mode Details */}
          {method === 'tunai' && (
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3">
              <label className="block text-xs font-semibold text-neutral-700">
                Uang Diterima dari Pelanggan
              </label>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-1.5">
                {quickCashOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      posAudio.playBeep(560, 0.03);
                      setAmountPaid(opt);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                      amountPaid === opt
                        ? 'bg-[#2563eb] text-white shadow-xs'
                        : 'bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    {opt === total ? 'Uang Pas' : formatRupiah(opt)}
                  </button>
                ))}
              </div>

              {/* Custom Cash Amount Input */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-neutral-400">
                  Rp
                </span>
                <input
                  type="number"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 text-base font-bold font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              {/* Real-time Kembalian (Change) Display */}
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-600">
                  Kembalian:
                </span>
                <span
                  className={`text-xl font-mono font-black ${
                    isCashInsufficient ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  {isCashInsufficient
                    ? `Kurang ${formatRupiah(total - amountPaid)}`
                    : formatRupiah(change)}
                </span>
              </div>
            </div>
          )}

          {/* QRIS Payment Mode Details */}
          {method === 'qris' && (
            <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 flex flex-col items-center text-center space-y-3">
              <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-xs">
                <div className="w-44 h-44 bg-neutral-900 rounded-lg p-2 flex flex-col items-center justify-between text-white">
                  <div className="text-[10px] tracking-wider uppercase font-semibold">QRIS STANDAR NASIONAL</div>
                  {/* Decorative QR code pattern */}
                  <div className="grid grid-cols-6 gap-1.5 w-32 h-32 bg-white p-2 rounded">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 && i % 3 !== 0) || i === 0 || i === 5 || i === 30 || i === 35
                            ? 'bg-neutral-900'
                            : 'bg-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">NMID: ID102026889921</div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-700">
                  Scan dengan GoPay, OVO, Dana, BCA, Livin, ShopeePay
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Total otomatis Rp {total.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}

          {/* Debit & EDC Mode */}
          {(method === 'debit' || method === 'transfer') && (
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-2">
              <div className="text-xs text-neutral-600">
                Pilih mesin EDC dan masukkan kartu pelanggan:
              </div>
              <div className="flex gap-2">
                {['EDC BCA', 'EDC Mandiri', 'EDC BRI', 'QR EDC'].map((edc, i) => (
                  <span
                    key={edc}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                      i === 0 ? 'bg-white border-[#2563eb] text-[#2563eb] font-bold' : 'bg-white border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {edc}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400 pt-1">
                Pastikan pembayaran berhasil dan struk EDC telah keluar sebelum menyelesaikan transaksi.
              </p>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleProcessPayment}
            disabled={isProcessing || isCashInsufficient}
            className="flex-1 py-3 px-5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Pembayaran...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Konfirmasi Pembayaran ({formatRupiah(total)})</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
