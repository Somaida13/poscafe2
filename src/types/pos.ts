export type CategoryId = 'all' | 'makanan' | 'minuman' | 'sayuran' | 'hotplate' | 'nasi' | 'paket';

export interface Category {
  id: CategoryId;
  label: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  image: string;
  description?: string;
  isAvailable: boolean;
  isPopular?: boolean;
}

export interface OrderItem {
  id: string; // unique item line id
  productId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface AdditionalFee {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10%
  enabled: boolean;
}

export interface TableInfo {
  id: string;
  number: number | string;
  name: string;
  status: 'empty' | 'occupied' | 'reserved';
  activeItemsCount?: number;
  activeTotal?: number;
}

export type PaymentMethodType = 'tunai' | 'qris' | 'debit' | 'kredit' | 'transfer';

export interface CompletedTransaction {
  id: string;
  orderNumber: string;
  tableNumber: string | number;
  cashierName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  service: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethodType;
  amountPaid: number;
  change: number;
  timestamp: string;
  customerName?: string;
}
