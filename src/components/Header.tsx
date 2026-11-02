import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  LayoutGrid, 
  List, 
  Volume2, 
  VolumeX, 
  ReceiptText, 
  UtensilsCrossed, 
  X,
  Wifi,
  Battery
} from 'lucide-react';
import { posAudio } from '../utils/audio';

interface HeaderProps {
  cashierName: string;
  cashierRole: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTable: string | number;
  onOpenTableModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenMenuManageModal: () => void;
  viewMode: 'grid' | 'compact';
  onToggleViewMode: () => void;
  onOpenQuickAction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cashierName,
  cashierRole,
  searchQuery,
  onSearchChange,
  selectedTable,
  onOpenTableModal,
  onOpenHistoryModal,
  onOpenMenuManageModal,
  viewMode,
  onToggleViewMode,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(posAudio.isEnabled());
  const [currentTime, setCurrentTime] = useState('12:30');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const next = posAudio.toggle();
    setSoundEnabled(next);
  };

  return (
    <>
      <header className="bg-[#2563eb] text-white shadow-md sticky top-0 z-30">
        {/* Tablet / POS top mini status bar */}
        <div className="flex items-center justify-between px-4 py-0.5 text-[11px] font-medium text-white/80 bg-[#1d4ed8]">
          <div className="flex items-center gap-2">
            <span>Dapur Hasymi POS v2.4</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Dapur Hasymi Resto</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-200" />
              <span className="text-[10px]">Online</span>
            </span>
            <span className="flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-white/90" />
              <span className="text-[10px]">100%</span>
            </span>
            <span className="font-mono font-semibold tracking-wide">{currentTime}</span>
          </div>
        </div>

        {/* Main POS Navbar */}
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 gap-2 sm:gap-4">
          {/* Left section: Hamburger & Cashier Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                posAudio.playBeep(450, 0.04);
                setMenuOpen(true);
              }}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15 active:scale-95 transition-all text-white cursor-pointer focus:outline-none"
              title="Menu Navigasi & Laporan"
              aria-label="Buka Menu"
            >
              <Menu className="w-6 h-6 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setMenuOpen(true)}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {cashierName.slice(0, 1)}
              </div>
              <div className="leading-tight">
                <div className="font-bold text-sm sm:text-base tracking-tight text-white">
                  {cashierName}
                </div>
                <div className="text-[11px] text-white/80 font-medium">
                  {cashierRole}
                </div>
              </div>
            </div>
          </div>

          {/* Middle section: Search Bar */}
          <div className="flex-1 max-w-md mx-1 sm:mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari Menu Dapur Hasymi..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-neutral-800 placeholder-neutral-400 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right section: View mode toggle & Table Number Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View Mode Toggle */}
            <button
              onClick={() => {
                posAudio.playBeep(500, 0.04);
                onToggleViewMode();
              }}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15 active:scale-95 transition-all text-white hidden sm:flex items-center justify-center cursor-pointer"
              title={viewMode === 'grid' ? 'Ganti ke Tampilan Daftar' : 'Ganti ke Tampilan Grid'}
            >
              {viewMode === 'grid' ? (
                <List className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15 active:scale-95 transition-all text-white hidden md:flex items-center justify-center cursor-pointer"
              title={soundEnabled ? 'Matikan Suara Beep' : 'Nyalakan Suara Beep'}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5 text-white/60" />
              )}
            </button>

            {/* Table Badge matching screenshot in blue */}
            <button
              onClick={() => {
                posAudio.playBeep(520, 0.05);
                onOpenTableModal();
              }}
              className="group flex items-center justify-center bg-white text-[#2563eb] font-black text-sm sm:text-base px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg shadow-sm border border-white/60 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
              title="Ganti / Pilih Meja"
            >
              <span className="text-[10px] text-neutral-500 mr-1 hidden sm:inline uppercase font-bold tracking-wider">Meja</span>
              <span className="font-extrabold">{selectedTable}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="bg-[#2563eb] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-lg">
                  {cashierName.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-base">{cashierName}</h3>
                  <p className="text-xs text-white/80">{cashierRole} · Dapur Hasymi</p>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 py-2">
                Operasional Kasir
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenTableModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-blue-50 hover:text-[#2563eb] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2563eb] flex items-center justify-center font-bold text-xs">
                  {selectedTable}
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Pilih / Pindah Meja</div>
                  <div className="text-xs text-neutral-400">Meja aktif: {selectedTable}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenHistoryModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-blue-50 hover:text-[#2563eb] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0284c7] flex items-center justify-center">
                  <ReceiptText className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Riwayat Transaksi & Struk</div>
                  <div className="text-xs text-neutral-400">Cetak ulang struk & total shift</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenMenuManageModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-blue-50 hover:text-[#2563eb] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Kelola Menu & Harga</div>
                  <div className="text-xs text-neutral-400">Tambah menu atau ubah harga</div>
                </div>
              </button>

              <div className="pt-4 border-t border-neutral-100 mt-4">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 py-2">
                  Pengaturan
                </div>

                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700">
                  <span className="flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-[#2563eb]" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
                    Efek Suara Kasir
                  </span>
                  <button
                    onClick={handleToggleSound}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      soundEnabled ? 'bg-[#2563eb]' : 'bg-neutral-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        soundEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50 text-xs text-neutral-500">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-neutral-700">Dapur Hasymi</span>
                <span className="text-emerald-600 font-semibold">Aktif</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                POS Kasir Tablet & Desktop Web App
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
