import React, { useState, useEffect, useMemo } from 'react';
import { 
  MenuItem, 
  OrderItem, 
  CategoryId, 
  TableInfo, 
  CompletedTransaction,
  PaymentMethodType 
} from './types/pos';
import { 
  CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  INITIAL_ORDER_ITEMS, 
  INITIAL_TABLES 
} from './data/mockMenu';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { ProductGrid } from './components/ProductGrid';
import { OrderSidebar } from './components/OrderSidebar';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { TableSelectModal } from './components/TableSelectModal';
import { QuickActionModal } from './components/QuickActionModal';
import { TransactionsHistoryModal } from './components/TransactionsHistoryModal';
import { MenuManageModal } from './components/MenuManageModal';
import { formatRupiah, generateOrderNumber, formatDateTime } from './utils/format';
import { posAudio } from './utils/audio';
import { ShoppingBag, ChevronRight, Check } from 'lucide-react';

export default function App() {
  // Cashier Identity matching Dapur Hasymi
  const [cashierName] = useState('Hasymi');
  const [cashierRole] = useState('Admin');

  // Menu items state
  const [products, setProducts] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('pos_products_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_MENU_ITEMS;
  });

  // Current selected table matching screenshot ("12")
  const [selectedTable, setSelectedTable] = useState<string | number>('12');

  // Tables list state
  const [tables, setTables] = useState<TableInfo[]>(() => {
    try {
      const saved = localStorage.getItem('pos_tables_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TABLES;
  });

  // Orders per table mapping (held orders)
  const [tableOrders, setTableOrders] = useState<Record<string, OrderItem[]>>(() => {
    try {
      const saved = localStorage.getItem('pos_table_orders_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Preload table 12 with items from screenshot
    return {
      '12': INITIAL_ORDER_ITEMS,
    };
  });

  // Current active order items
  const currentOrderItems = tableOrders[String(selectedTable)] || [];

  // Navigation & Search
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Fees & Discounts
  const [isTaxEnabled, setIsTaxEnabled] = useState(false);
  const [isServiceEnabled, setIsServiceEnabled] = useState(false);
  const taxRate = 0.10;
  const serviceRate = 0.05;
  const [discountNominal, setDiscountNominal] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Modals state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMenuManageOpen, setIsMenuManageOpen] = useState(false);
  const [isMobileOrderOpen, setIsMobileOrderOpen] = useState(false);

  // Completed transactions list
  const [transactions, setTransactions] = useState<CompletedTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('pos_transactions_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [activeTransactionForReceipt, setActiveTransactionForReceipt] =
    useState<CompletedTransaction | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('pos_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_tables_v2', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('pos_table_orders_v2', JSON.stringify(tableOrders));
  }, [tableOrders]);

  useEffect(() => {
    localStorage.setItem('pos_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory =
        activeCategory === 'all' || prod.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.description &&
          prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {} as Record<CategoryId, number>;
    counts['all'] = products.length;
    for (const cat of CATEGORIES) {
      if (cat.id !== 'all') {
        counts[cat.id] = products.filter((p) => p.category === cat.id).length;
      }
    }
    return counts;
  }, [products]);

  // Calculation helpers
  const subtotal = useMemo(() => {
    return currentOrderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }, [currentOrderItems]);

  const discountAmount = useMemo(() => {
    return (
      discountNominal +
      (discountPercentage > 0 ? (subtotal * discountPercentage) / 100 : 0)
    );
  }, [discountNominal, discountPercentage, subtotal]);

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = isTaxEnabled ? discountedSubtotal * taxRate : 0;
  const service = isServiceEnabled ? discountedSubtotal * serviceRate : 0;
  const grandTotal = Math.round(discountedSubtotal + tax + service);

  // Synchronize table status and totals
  const updateTableData = (tableNum: string | number, items: OrderItem[]) => {
    setTables((prevTables) =>
      prevTables.map((t) => {
        if (String(t.number) === String(tableNum)) {
          const count = items.reduce((sum, it) => sum + it.quantity, 0);
          const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
          return {
            ...t,
            status: items.length > 0 ? 'occupied' : 'empty',
            activeItemsCount: count,
            activeTotal: total,
          };
        }
        return t;
      })
    );
  };

  // Order Operations
  const handleAddToCart = (product: MenuItem) => {
    posAudio.playBeep(620, 0.04);
    const tableKey = String(selectedTable);
    const currentList = tableOrders[tableKey] || [];

    const existingIndex = currentList.findIndex(
      (item) => item.productId === product.id
    );

    let nextList: OrderItem[];
    if (existingIndex > -1) {
      nextList = currentList.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      const newItem: OrderItem = {
        id: `ord-line-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      };
      nextList = [...currentList, newItem];
    }

    setTableOrders((prev) => ({
      ...prev,
      [tableKey]: nextList,
    }));
    updateTableData(selectedTable, nextList);
  };

  const handleUpdateQuantity = (lineId: string, delta: number) => {
    posAudio.playBeep(540, 0.03);
    const tableKey = String(selectedTable);
    const currentList = tableOrders[tableKey] || [];

    const nextList = currentList
      .map((item) => {
        if (item.id === lineId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as OrderItem[];

    setTableOrders((prev) => ({
      ...prev,
      [tableKey]: nextList,
    }));
    updateTableData(selectedTable, nextList);
  };

  const handleRemoveItem = (lineId: string) => {
    const tableKey = String(selectedTable);
    const currentList = tableOrders[tableKey] || [];
    const nextList = currentList.filter((item) => item.id !== lineId);

    setTableOrders((prev) => ({
      ...prev,
      [tableKey]: nextList,
    }));
    updateTableData(selectedTable, nextList);
  };

  const handleClearOrder = () => {
    const tableKey = String(selectedTable);
    setTableOrders((prev) => ({
      ...prev,
      [tableKey]: [],
    }));
    updateTableData(selectedTable, []);
    showToast(`Pesanan Meja ${selectedTable} telah dibersihkan.`);
  };

  const handleUpdateNote = (lineId: string, note: string) => {
    posAudio.playBeep(520, 0.03);
    const tableKey = String(selectedTable);
    const currentList = tableOrders[tableKey] || [];

    const nextList = currentList.map((item) =>
      item.id === lineId ? { ...item, note } : item
    );

    setTableOrders((prev) => ({
      ...prev,
      [tableKey]: nextList,
    }));
    showToast('Catatan pesanan diperbarui');
  };

  // Save / Hold order for current table
  const handleSaveOrder = () => {
    const tableKey = String(selectedTable);
    const currentList = tableOrders[tableKey] || [];
    if (currentList.length === 0) return;

    updateTableData(selectedTable, currentList);
    posAudio.playSuccess();
    showToast(`✓ Pesanan Meja ${selectedTable} (${formatRupiah(grandTotal)}) berhasil disimpan.`);
  };

  // Table selection
  const handleSelectTable = (tableNumber: string | number) => {
    setSelectedTable(tableNumber);
    showToast(`Beralih ke Meja ${tableNumber}`);
  };

  // Payment process
  const handlePaymentSuccess = (paymentData: {
    method: PaymentMethodType;
    amountPaid: number;
    change: number;
    customerName: string;
  }) => {
    const orderNumber = generateOrderNumber();
    const timestamp = formatDateTime(new Date());

    const newTx: CompletedTransaction = {
      id: `tx-${Date.now()}`,
      orderNumber,
      tableNumber: selectedTable,
      cashierName,
      customerName: paymentData.customerName,
      items: [...currentOrderItems],
      subtotal,
      tax,
      service,
      discount: discountAmount,
      total: grandTotal,
      paymentMethod: paymentData.method,
      amountPaid: paymentData.amountPaid,
      change: paymentData.change,
      timestamp,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Clear active table order
    const tableKey = String(selectedTable);
    setTableOrders((prev) => ({
      ...prev,
      [tableKey]: [],
    }));
    updateTableData(selectedTable, []);

    // Close payment modal and open receipt modal
    setIsPaymentModalOpen(false);
    setIsMobileOrderOpen(false);
    setActiveTransactionForReceipt(newTx);
    setIsReceiptModalOpen(true);
  };

  // Menu management handlers
  const handleAddProduct = (newProd: MenuItem) => {
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Menu "${newProd.name}" berhasil ditambahkan.`);
  };

  const handleToggleAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p
      )
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-neutral-800">
      {/* Top coral-red header bar matching screenshot */}
      <Header
        cashierName={cashierName}
        cashierRole={cashierRole}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTable={selectedTable}
        onOpenTableModal={() => setIsTableModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenMenuManageModal={() => setIsMenuManageOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={() =>
          setViewMode((m) => (m === 'grid' ? 'compact' : 'grid'))
        }
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Category Navigation Bar matching screenshot */}
      <CategoryBar
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        categoryCounts={categoryCounts}
      />

      {/* Main Layout Area: Catalog on Left, Order Sidebar on Right */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Area: Product Grid */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ProductGrid
            products={filteredProducts}
            orderItems={currentOrderItems}
            onAddToCart={handleAddToCart}
            viewMode={viewMode}
            searchQuery={searchQuery}
          />
        </main>

        {/* Right Area: Order Summary Panel matching screenshot */}
        <OrderSidebar
          orderItems={currentOrderItems}
          tableNumber={selectedTable}
          taxRate={taxRate}
          serviceRate={serviceRate}
          discountNominal={discountNominal}
          discountPercentage={discountPercentage}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearOrder={handleClearOrder}
          onUpdateNote={handleUpdateNote}
          onToggleTax={() => setIsTaxEnabled(!isTaxEnabled)}
          onToggleService={() => setIsServiceEnabled(!isServiceEnabled)}
          isTaxEnabled={isTaxEnabled}
          isServiceEnabled={isServiceEnabled}
          onSaveOrder={handleSaveOrder}
          onCheckout={() => setIsPaymentModalOpen(true)}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          isMobileOpen={isMobileOrderOpen}
          onCloseMobile={() => setIsMobileOrderOpen(false)}
        />
      </div>

      {/* Mobile Floating Bottom Bar (visible only on small mobile viewports) */}
      <div className="lg:hidden bg-white border-t border-neutral-200 p-2.5 px-4 flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsMobileOrderOpen(true)}
              className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            {currentOrderItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-neutral-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {currentOrderItems.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </div>
          <div>
            <div className="text-xs text-neutral-500 font-medium">
              Meja {selectedTable}
            </div>
            <div className="text-base font-extrabold text-[#2563eb] font-mono">
              {formatRupiah(grandTotal)}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (currentOrderItems.length > 0) {
              setIsPaymentModalOpen(true);
            } else {
              setIsMobileOrderOpen(true);
            }
          }}
          disabled={currentOrderItems.length === 0}
          className="px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm flex items-center gap-1 shadow-md disabled:opacity-50 cursor-pointer"
        >
          <span>Bayar ({formatRupiah(grandTotal)})</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 backdrop-blur-xs text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={grandTotal}
        subtotal={subtotal}
        tax={tax}
        service={service}
        discount={discountAmount}
        orderItems={currentOrderItems}
        tableNumber={selectedTable}
        cashierName={cashierName}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={activeTransactionForReceipt}
        onNewTransaction={() => {
          setIsReceiptModalOpen(false);
          setActiveTransactionForReceipt(null);
        }}
      />

      <TableSelectModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        tables={tables}
        selectedTable={selectedTable}
        onSelectTable={handleSelectTable}
      />

      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        total={grandTotal}
        discountPercentage={discountPercentage}
        discountNominal={discountNominal}
        onApplyDiscount={(perc, nom) => {
          setDiscountPercentage(perc);
          setDiscountNominal(nom);
          showToast(
            perc > 0
              ? `Diskon ${perc}% diterapkan`
              : nom > 0
              ? `Diskon ${formatRupiah(nom)} diterapkan`
              : 'Diskon dibersihkan'
          );
        }}
      />

      <TransactionsHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transactions={transactions}
        onSelectTransactionToReprint={(tx) => {
          setActiveTransactionForReceipt(tx);
          setIsReceiptModalOpen(true);
        }}
      />

      <MenuManageModal
        isOpen={isMenuManageOpen}
        onClose={() => setIsMenuManageOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onToggleAvailability={handleToggleAvailability}
      />
    </div>
  );
}
