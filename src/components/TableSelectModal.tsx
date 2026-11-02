import React from 'react';
import { TableInfo } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { X, Users, UtensilsCrossed, CheckCircle } from 'lucide-react';
import { posAudio } from '../utils/audio';

interface TableSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableInfo[];
  selectedTable: string | number;
  onSelectTable: (tableNumber: string | number) => void;
}

export const TableSelectModal: React.FC<TableSelectModalProps> = ({
  isOpen,
  onClose,
  tables,
  selectedTable,
  onSelectTable,
}) => {
  if (!isOpen) return null;

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
            <h3 className="text-base sm:text-lg font-bold">Pilih Meja Restoran · Dapur Hasymi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="bg-neutral-50 px-5 py-2.5 border-b border-neutral-200 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-neutral-300" />
            <span className="text-neutral-600">Kosong</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600" />
            <span className="text-neutral-600">Terisi / Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-neutral-600">Reservasi</span>
          </div>
          <div className="ml-auto text-neutral-400">
            Meja Terpilih: <strong className="text-[#2563eb] font-bold">Meja {selectedTable}</strong>
          </div>
        </div>

        {/* Table Grid */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tables.map((table) => {
              const isCurrent = String(table.number) === String(selectedTable);
              const isOccupied = table.status === 'occupied';
              const isReserved = table.status === 'reserved';

              return (
                <button
                  key={table.id}
                  onClick={() => {
                    posAudio.playBeep(520, 0.04);
                    onSelectTable(table.number);
                    onClose();
                  }}
                  className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                    isCurrent
                      ? 'border-[#2563eb] ring-2 ring-[#2563eb]/30 bg-blue-50/70'
                      : isOccupied
                      ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'
                      : isReserved
                      ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-extrabold text-sm sm:text-base text-neutral-800">
                        {table.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" />
                        <span>
                          {isOccupied ? 'Terisi' : isReserved ? 'Reservasi' : 'Tersedia'}
                        </span>
                      </div>
                    </div>

                    {isCurrent && (
                      <CheckCircle className="w-4 h-4 text-[#2563eb]" />
                    )}
                  </div>

                  {/* Active total if occupied */}
                  {isOccupied && table.activeTotal ? (
                    <div className="mt-2 pt-1 border-t border-blue-100 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">{table.activeItemsCount || 0} item</span>
                      <span className="font-bold text-[#2563eb] font-mono">
                        {formatRupiah(table.activeTotal)}
                      </span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
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
