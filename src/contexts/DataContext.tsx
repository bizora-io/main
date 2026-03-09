
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useStores } from './StoreContext';
import { Staff, AppLog } from '../types';

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Red / XL"
  sku?: string;
  barcode?: string;
  price?: number; // Override base price if needed
  stock: number;
  attributes: { name: string; value: string }[]; // e.g., [{name: 'Color', value: 'Red'}, {name: 'Size', value: 'XL'}]
}

export interface DiscountRule {
  id: string;
  type: 'percentage' | 'fixed';
  value: number;
  minQty?: number;
  startDate?: string;
  endDate?: string;
}

export interface Product {
  id: string;
  storeId?: string; // Multi-store support
  name: string;
  stock: number;
  purchasePrice: number;
  salePrice: number;
  category: string;
  subCategory?: string;
  brand?: string; // New field
  sku?: string; // New field
  barcode?: string; // New field
  qrCode?: string; // New field
  description?: string;
  unit?: string;
  expiryDate?: string; // YYYY-MM-DD
  batchNumber?: string; // New Batch Number field
  image?: string; // Base64 string (Main image)
  images?: string[]; // New field for gallery
  isDeleted?: boolean;
  isArchived?: boolean; // New field
  warranty?: boolean; // Existing flag
  warrantyPeriod?: string; // e.g., "1 Year"
  sellOnline?: boolean; // New flag for e-commerce sync
  isFeatured?: boolean; // New flag for Featured Products
  bomId?: string; // Link to Bill of Materials
  minStockLevel?: number; // Alert threshold
  variants?: ProductVariant[]; // New field
  supplierId?: string; // New field
  discountRules?: DiscountRule[]; // New field
  tags?: string[]; // New field
  isBundle?: boolean; // New field
  bundleItems?: { productId: string; qty: number }[]; // New field
  isDigital?: boolean; // New field
  downloadUrl?: string; // New field for digital products
  notes?: string; // New field
  returnEligible?: boolean; // New field
  weight?: number; // New field
  dimensions?: { length: number; width: number; height: number }; // New field
  customFields?: Record<string, string>; // New field
}

export interface Entity {
  id: string;
  name: string;
  mobile?: string;
  email?: string;
  company?: string;
  address?: string;
  type: 'Customer' | 'Supplier';
  loyaltyPoints?: number;
  reminderDate?: string; // ISO DateTime
  isDeleted?: boolean;
  // Extended Customer Fields
  groups?: string[];
  tags?: string[];
  notes?: string;
  walletBalance?: number;
  birthday?: string; // YYYY-MM-DD
  customFields?: Record<string, string>;
  isBlacklisted?: boolean;
  referralCode?: string;
  referredBy?: string;
  engagementScore?: number;
  lifetimeValue?: number;
  socialLinks?: { facebook?: string; twitter?: string; linkedin?: string; instagram?: string };
  preferences?: { smsMarketing: boolean; emailMarketing: boolean };
  assignedStaffId?: string;
  status?: 'Active' | 'Inactive' | 'Lead' | 'Prospect';
  source?: string; // e.g., 'Walk-in', 'Online', 'Referral'
  lastPurchaseDate?: string;
  totalOrders?: number;
  averageOrderValue?: number;
}

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  criteria?: Record<string, any>; // For auto-segmentation
}

export interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: { sender: string; message: string; timestamp: string }[];
}

export interface CustomerFeedback {
  id: string;
  customerId: string;
  rating: number;
  comment?: string;
  date: string;
  source?: string; // e.g., 'Email', 'SMS', 'In-Store'
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'SMS' | 'Email';
  status: 'Draft' | 'Scheduled' | 'Sent' | 'Cancelled';
  targetAudience: { type: 'All' | 'Group' | 'Segment'; value?: string };
  content: string;
  scheduledDate?: string;
  sentDate?: string;
  stats?: { sent: number; delivered: number; opened: number; clicked: number };
}

export interface InvoiceItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  total: number;
  serialNumbers?: string[]; // Array of SNs
  warranty?: string; // Specific warranty text for this item
  batchNumber?: string;
  expiryDate?: string;
}

export interface TimelineEvent {
  status: string;
  date: string;
  note?: string;
  user?: string;
}

export interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  paidDate?: string;
}

export interface LedgerEntry {
  id: string;
  storeId?: string; // Multi-store support
  date: string;
  entityId?: string; // Link to Entity ID
  entityName: string;
  entityMobile?: string; // Snapshot of mobile
  entityAddress?: string; // Snapshot of address
  type: 'Purchase' | 'Sale' | 'Expense' | 'Income' | 'Due' | 'Sales Return' | 'Purchase Return' | 'Stock Adjustment' | 'Salary' | 'Transfer';
  amount: number;
  paymentMethod: 'Cash' | 'Due' | 'Card' | 'Bank' | 'Adjustment' | 'Mobile' | 'Transfer' | 'Gift Card' | 'Partial' | 'Installment';
  amountPaid?: number; // For partial payments
  dueAmount?: number; // For partial payments
  previousDue?: number; // Snapshot of previous due at time of sale
  accountId?: string; // Linked Financial Account ID
  reference?: string; 
  items?: InvoiceItem[]; 
  details?: {
      subtotal: number;
      tax: number;
      discount: number;
      delivery: number;
  };
  timeline?: TimelineEvent[];
  installments?: Installment[]; // New field for installment tracking
  createdBy?: string; // Admin/User ID
  salesperson?: string; // Salesperson tracking
  tags?: string[]; // Order tagging
  notes?: string; // Order notes
  deliveryInstructions?: string; // Delivery instructions
  isDeleted?: boolean;
  
  // Expense Specifics
  category?: string;
  isRecurring?: boolean;
  recurringInterval?: 'Monthly' | 'Weekly' | 'Yearly';
  splitDetails?: { category: string; amount: number }[];
}

export interface FinancialAccount {
    id: string;
    storeId?: string;
    name: string;
    type: 'Cash' | 'Bank' | 'Mobile Wallet';
    balance: number;
    accountNumber?: string;
    bankName?: string;
    isDefault?: boolean;
}

export interface OnlineOrder {
  id: string;
  storeId?: string;
  customerName: string;
  address: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  courier?: string;
  trackingNumber?: string;
  platform: 'WooCommerce' | 'Shopify' | 'Custom';
}

export interface CourierConfig {
    provider: 'Pathao' | 'Steadfast' | 'Paperfly' | 'RedX';
    apiKey: string;
    apiSecret: string;
    enabled: boolean;
}

export interface DomainConfig {
    subdomain: string;
    customDomain: string;
    status: 'Not Connected' | 'Pending' | 'Active';
}

export interface PromoCode {
    id: string;
    code: string;
    discount: number;
    type: 'fixed' | 'percentage';
    status: 'active' | 'expired';
}

export interface ShopPolicies {
    terms: string;
    refund: string;
    shipping: string;
}

export interface Category {
    id: string;
    name: string;
    subCategories: string[];
}

export interface ExpenseCategory {
    id: string;
    name: string;
    isDefault?: boolean;
}

// --- Production Interfaces ---
export interface RawMaterial {
    id: string;
    name: string;
    stock: number;
    unit: string;
    cost: number; // Cost per unit
    minLevel: number;
}

export interface BillOfMaterial {
    id: string;
    productId: string; // ID of the finished product from 'products'
    productName: string;
    materials: { materialId: string; name: string; qty: number }[]; // Material required per 1 unit of product
    yield: number; // usually 1
}

export interface ProductionBatch {
    id: string;
    bomId: string;
    productName: string;
    productId: string; // Added productId
    quantity: number;
    status: 'Planned' | 'In Progress' | 'Completed';
    startDate: string;
    endDate?: string;
}

interface DataContextType {
  products: Product[];
  customers: Entity[];
  suppliers: Entity[];
  transactions: LedgerEntry[];
  financialAccounts: FinancialAccount[];
  onlineOrders: OnlineOrder[];
  staff: Staff[];
  appLogs: AppLog[];
  courierSettings: CourierConfig[];
  domainSettings: DomainConfig;
  promoCodes: PromoCode[];
  shopPolicies: ShopPolicies;
  categories: Category[];
  expenseCategories: ExpenseCategory[];
  // Customer CRM State
  customerGroups: CustomerGroup[];
  supportTickets: SupportTicket[];
  feedbacks: CustomerFeedback[];
  marketingCampaigns: MarketingCampaign[];
  
  // Production State
  rawMaterials: RawMaterial[];
  boms: BillOfMaterial[];
  productionBatches: ProductionBatch[];
  
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  updateProductStock: (id: string, qty: number, type: 'increase' | 'decrease') => void;
  processPurchase: (productId: string, newQty: number, newUnitPrice: number) => void; // Added for APP calculation
  addEntity: (entity: Entity) => void;
  updateEntity: (id: string, data: Partial<Entity>) => void;
  addTransaction: (entry: LedgerEntry) => void;
  updateTransaction: (id: string, data: Partial<LedgerEntry>) => void;
  deleteItem: (type: 'product' | 'entity' | 'transaction', id: string) => void;
  restoreItem: (type: 'product' | 'entity' | 'transaction', id: string) => void;
  updateLoyaltyPoints: (customerId: string, amountSpent: number) => void;
  
  // Account Methods
  addFinancialAccount: (account: FinancialAccount) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, note?: string) => void;

  // Online Order Methods
  addOnlineOrder: (order: OnlineOrder) => void;
  updateOnlineOrder: (id: string, data: Partial<OnlineOrder>) => void;
  // Staff Methods
  addStaff: (staff: Staff) => void;
  updateStaff: (id: string, data: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  markAttendance: (staffId: string, date: string, status: 'Present' | 'Absent' | 'Leave' | 'Half Day', time?: string) => void;
  updatePerformance: (staffId: string, rating: number, comment: string) => void;
  updateLocation: (staffId: string, location: { lat: number, lng: number, address: string }) => void;
  logAction: (module: string, action: string, details?: string) => void;
  // Settings
  updateCourierSettings: (provider: string, data: Partial<CourierConfig>) => void;
  updateDomainSettings: (data: Partial<DomainConfig>) => void;
  // Promo & Policy
  addPromoCode: (code: PromoCode) => void;
  deletePromoCode: (id: string) => void;
  updateShopPolicy: (data: Partial<ShopPolicies>) => void;
  toggleFeaturedProduct: (productId: string) => void;
  // Category Management
  addCategory: (name: string) => void;
  addSubCategory: (categoryId: string, subCategoryName: string) => void;
  deleteCategory: (id: string) => void;
  deleteSubCategory: (categoryId: string, subCategoryName: string) => void;
  // Expense Category Management
  addExpenseCategory: (name: string) => void;
  deleteExpenseCategory: (id: string) => void;
  
  // Customer CRM Methods
  addCustomerGroup: (group: CustomerGroup) => void;
  updateCustomerGroup: (id: string, data: Partial<CustomerGroup>) => void;
  deleteCustomerGroup: (id: string) => void;
  addSupportTicket: (ticket: SupportTicket) => void;
  updateSupportTicket: (id: string, data: Partial<SupportTicket>) => void;
  addFeedback: (feedback: CustomerFeedback) => void;
  addMarketingCampaign: (campaign: MarketingCampaign) => void;
  updateMarketingCampaign: (id: string, data: Partial<MarketingCampaign>) => void;

  // Production Methods
  addRawMaterial: (mat: RawMaterial) => void;
  updateRawMaterial: (id: string, data: Partial<RawMaterial>) => void;
  restockMaterial: (id: string, qty: number, cost: number) => void; // Adds stock and creates expense tx
  addBOM: (bom: BillOfMaterial) => void;
  deleteBOM: (id: string) => void;
  addBatch: (batch: ProductionBatch) => void;
  updateBatchStatus: (id: string, status: ProductionBatch['status']) => void;
  completeProductionBatch: (batchId: string) => void;
  // Scalability Methods
  archiveTransactions: (beforeDate: string) => Promise<number>;
  importData: (jsonData: string) => void;
  getAllData: () => any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper for initial data with store ID
const withStore = (data: any[], storeId = '1') => data.map(item => ({ ...item, storeId }));

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', storeId: '1', name: 'Ointment CRISADERM 10 ML', stock: 10, purchasePrice: 50, salePrice: 70, category: 'Pharma', subCategory: 'Ointment', expiryDate: '2024-12-31', batchNumber: 'B101', unit: 'Pcs', sellOnline: true, isFeatured: true, minStockLevel: 5 },
  { id: '2', storeId: '1', name: 'Ointment TREGO 3 GM', stock: 25, purchasePrice: 30, salePrice: 45, category: 'Pharma', subCategory: 'Ointment', expiryDate: '2023-11-20', batchNumber: 'B102', unit: 'Pcs', minStockLevel: 5 }, 
  { id: '3', storeId: '1', name: 'Ointment NEBAZIN 20GM', stock: 0, purchasePrice: 80, salePrice: 110, category: 'Pharma', subCategory: 'Ointment', expiryDate: '2025-06-15', batchNumber: 'B103', unit: 'Pcs', sellOnline: true, minStockLevel: 10 },
  { id: '4', storeId: '2', name: 'Ointment TIOZOL (Branch 2)', stock: 5, purchasePrice: 40, salePrice: 60, category: 'Pharma', subCategory: 'Ointment', expiryDate: '2024-05-20', batchNumber: 'B104', unit: 'Pcs', minStockLevel: 5 }, 
  { id: '5', storeId: '1', name: 'Ointment BETAMESAL 15 GM', stock: 100, purchasePrice: 90, salePrice: 120, category: 'Pharma', subCategory: 'Ointment', unit: 'Pcs', sellOnline: true, isFeatured: true, minStockLevel: 20 },
  { id: '6', storeId: '1', name: 'Wireless Mouse M305', stock: 50, purchasePrice: 15, salePrice: 25, category: 'Electronics', subCategory: 'Accessories', warranty: true, warrantyPeriod: '6 Months', unit: 'Pcs', sellOnline: true, minStockLevel: 5 },
];

const INITIAL_STAFF: Staff[] = [
  { 
      id: 's1', storeId: '1', name: 'Manager John', role: 'Manager', pin: '1234', status: 'Active', permissions: ['all'], lastLogin: '2024-03-15 09:30 AM',
      basicSalary: 30000, joiningDate: '2023-01-01', performance: { rating: 4.5, reviews: [] },
      attendance: { '2024-03-20': { status: 'Present', checkIn: '09:00 AM' } },
      lastLocation: { lat: 40.7128, lng: -74.0060, address: 'Main Store', timestamp: '10 min ago' }
  },
  { 
      id: 's2', storeId: '1', name: 'Sales Alice', role: 'Salesperson', pin: '1111', status: 'Active', permissions: ['pos.sell', 'pos.view_sales', 'inventory.view'], lastLogin: '2024-03-15 10:00 AM',
      basicSalary: 15000, joiningDate: '2023-06-15', performance: { rating: 4.8, reviews: [] },
      attendance: { '2024-03-20': { status: 'Present', checkIn: '09:15 AM' } },
      lastLocation: { lat: 40.7328, lng: -74.0160, address: 'Delivery Route 5', timestamp: '5 min ago' }
  }
];

const INITIAL_LOGS: AppLog[] = [
  { id: 'l1', staffName: 'Manager John', module: 'Inventory', action: 'Stock Update', timestamp: '2024-03-15 09:35 AM', details: 'Added 50 units to Wireless Mouse' },
  { id: 'l2', staffName: 'Sales Alice', module: 'Sales', action: 'New Invoice', timestamp: '2024-03-15 10:15 AM', details: 'Invoice #INV-001 created' }
];

const INITIAL_ACCOUNTS: FinancialAccount[] = [
    { id: 'cash-1', storeId: '1', name: 'Main Cash', type: 'Cash', balance: 50000, isDefault: true },
    { id: 'bank-1', storeId: '1', name: 'City Bank', type: 'Bank', balance: 250000, accountNumber: '123-456-789', bankName: 'City Bank Ltd' },
    { id: 'mobile-1', storeId: '1', name: 'bKash Merchant', type: 'Mobile Wallet', balance: 15000, accountNumber: '01700000000' }
];

const INITIAL_ONLINE_ORDERS: OnlineOrder[] = [
    {
        id: 'WEB-1001',
        storeId: '1',
        customerName: 'Online Guest',
        address: '123 Virtual Lane, Web City',
        items: [{ productId: '6', name: 'Wireless Mouse M305', qty: 1, price: 25 }],
        total: 25,
        status: 'Pending',
        date: '2024-03-20',
        platform: 'WooCommerce'
    }
];

const INITIAL_CATEGORIES: Category[] = [
    { id: 'c1', name: 'Electronics', subCategories: ['Mobile', 'Laptop', 'Accessories'] },
    { id: 'c2', name: 'Clothing', subCategories: ['Men', 'Women', 'Kids'] },
    { id: 'c3', name: 'Pharma', subCategories: ['Medicine', 'Healthcare', 'Ointment'] },
];

const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
    { id: 'ec1', name: 'Rent', isDefault: true },
    { id: 'ec2', name: 'Salary', isDefault: true },
    { id: 'ec3', name: 'Utilities', isDefault: true },
    { id: 'ec4', name: 'Transport', isDefault: true },
    { id: 'ec5', name: 'Purchase (Indirect)', isDefault: true },
    { id: 'ec6', name: 'Marketing', isDefault: true },
    { id: 'ec7', name: 'Repair & Maintenance', isDefault: true },
    { id: 'ec8', name: 'Office Expense', isDefault: true },
    { id: 'ec9', name: 'Tax & VAT', isDefault: true },
    { id: 'ec10', name: 'Other', isDefault: true },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeStore } = useStores();
  
  // RAW Data States (Contain all stores data)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Entity[]>([
      { id: 'c1', name: 'Rahim Uddin', mobile: '01711223344', address: 'Dhaka, Bangladesh', type: 'Customer', loyaltyPoints: 120 }
  ]);
  const [suppliers, setSuppliers] = useState<Entity[]>([
      { id: 's1', name: 'ACI Pharma', mobile: '01911223344', address: 'Tejgaon Ind. Area', type: 'Supplier' }
  ]);
  const [transactions, setTransactions] = useState<LedgerEntry[]>([
      { id: 't1', storeId: '1', date: '2024-03-10', entityName: 'Rahim Uddin', entityMobile: '01711223344', type: 'Sale', amount: 500, paymentMethod: 'Cash', accountId: 'cash-1', createdBy: 'Admin', details: { subtotal: 500, tax: 0, discount: 0, delivery: 0 } },
      { id: 't2', storeId: '1', date: '2024-03-11', entityName: 'ACI Pharma', type: 'Purchase', amount: 2000, paymentMethod: 'Due', createdBy: 'Manager' }
  ]);
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>(INITIAL_ACCOUNTS);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(INITIAL_ONLINE_ORDERS);
  const [staff, setStaffState] = useState<Staff[]>(() => {
      const saved = localStorage.getItem('nexus_staff');
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  useEffect(() => {
      localStorage.setItem('nexus_staff', JSON.stringify(staff));
  }, [staff]);
  const [appLogs, setAppLogs] = useState<AppLog[]>(INITIAL_LOGS);
  
  // Settings
  const [courierSettings, setCourierSettings] = useState<CourierConfig[]>([
      { provider: 'Pathao', apiKey: '', apiSecret: '', enabled: false },
      { provider: 'Steadfast', apiKey: '', apiSecret: '', enabled: false },
      { provider: 'Paperfly', apiKey: '', apiSecret: '', enabled: false },
      { provider: 'RedX', apiKey: '', apiSecret: '', enabled: false },
  ]);
  const [domainSettings, setDomainSettings] = useState<DomainConfig>({
      subdomain: 'ishas-fashion.bizora.com',
      customDomain: '',
      status: 'Not Connected'
  });
  
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
      { id: '1', code: 'WELCOME10', discount: 10, type: 'percentage', status: 'active' }
  ]);
  
  const [shopPolicies, setShopPolicies] = useState<ShopPolicies>({
      terms: 'All sales are final unless item is defective.',
      refund: 'Refunds processed within 7 days of return receipt.',
      shipping: 'Standard delivery takes 3-5 business days.'
  });

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(INITIAL_EXPENSE_CATEGORIES);

  // CRM States
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([
      { id: 'vip', name: 'VIP', color: '#8b5cf6', description: 'High value customers' },
      { id: 'new', name: 'New', color: '#10b981', description: 'Joined in last 30 days' }
  ]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>([]);

  // Production State
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
      { id: 'm1', name: 'Cotton Fabric', stock: 500, unit: 'Meters', cost: 50, minLevel: 100 },
      { id: 'm2', name: 'Thread Spool', stock: 200, unit: 'Pcs', cost: 10, minLevel: 50 },
      { id: 'm3', name: 'Buttons', stock: 1000, unit: 'Pcs', cost: 1, minLevel: 200 },
  ]);
  const [boms, setBoms] = useState<BillOfMaterial[]>([]);
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);

  // --- FILTERED DATA (Based on Active Store) ---
  const currentStoreId = activeStore === 'HEAD_OFFICE' ? 'ALL' : activeStore.id;

  const visibleProducts = useMemo(() => 
    currentStoreId === 'ALL' ? products : products.filter(p => p.storeId === currentStoreId || !p.storeId), 
  [products, currentStoreId]);

  const visibleTransactions = useMemo(() => 
    currentStoreId === 'ALL' ? transactions : transactions.filter(t => t.storeId === currentStoreId || !t.storeId), 
  [transactions, currentStoreId]);

  const visibleAccounts = useMemo(() => 
    currentStoreId === 'ALL' ? financialAccounts : financialAccounts.filter(a => a.storeId === currentStoreId || !a.storeId), 
  [financialAccounts, currentStoreId]);

  const visibleOrders = useMemo(() => 
    currentStoreId === 'ALL' ? onlineOrders : onlineOrders.filter(o => o.storeId === currentStoreId || !o.storeId), 
  [onlineOrders, currentStoreId]);

  const visibleStaff = useMemo(() => 
    currentStoreId === 'ALL' ? staff : staff.filter(s => s.storeId === currentStoreId || !s.storeId), 
  [staff, currentStoreId]);

  // --- ACTIONS (Inject Store ID) ---

  const addProduct = (product: Product) => {
    // Inject active store ID. If Head Office, default to '1' or prompt (simplified to '1' for now)
    const targetStore = currentStoreId === 'ALL' ? '1' : currentStoreId;
    setProducts(prev => [...prev, { ...product, storeId: targetStore, isDeleted: false }]);
    logAction('Inventory', 'Add Product', `Added ${product.name}`);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    logAction('Inventory', 'Update Product', `Updated details for product ID: ${id}`);
  };

  const updateProductStock = (id: string, qty: number, type: 'increase' | 'decrease') => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          stock: type === 'increase' ? p.stock + qty : Math.max(0, p.stock - qty)
        };
      }
      return p;
    }));
  };

  // NEW: Calculate Weighted Average Purchase Price
  const processPurchase = (productId: string, newQty: number, newUnitPrice: number) => {
    setProducts(prev => prev.map(p => {
        if (p.id === productId) {
            const prevTotalCost = p.stock * p.purchasePrice;
            const newTotalCost = prevTotalCost + (newQty * newUnitPrice);
            const totalQty = p.stock + newQty;
            const avgPrice = totalQty > 0 ? newTotalCost / totalQty : newUnitPrice;
            
            return {
                ...p,
                stock: totalQty,
                purchasePrice: parseFloat(avgPrice.toFixed(2)) // Round to 2 decimals
            };
        }
        return p;
    }));
  };

  const addEntity = (entity: Entity) => {
    const newEntity = { ...entity, isDeleted: false, loyaltyPoints: 0 };
    // Entities are typically Global in Multi-store (Customers exist across branches)
    if (entity.type === 'Customer') {
      if (!customers.some(c => c.name.toLowerCase() === entity.name.toLowerCase())) {
        setCustomers(prev => [...prev, newEntity]);
        logAction('CRM', 'Add Customer', `Added ${entity.name}`);
      }
    } else {
      if (!suppliers.some(s => s.name.toLowerCase() === entity.name.toLowerCase())) {
        setSuppliers(prev => [...prev, newEntity]);
        logAction('CRM', 'Add Supplier', `Added ${entity.name}`);
      }
    }
  };

  const updateEntity = (id: string, data: Partial<Entity>) => {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const addTransaction = (entry: LedgerEntry) => {
    const user = localStorage.getItem('nexus_user');
    const userName = user ? JSON.parse(user).businessName : 'Staff';
    const targetStore = currentStoreId === 'ALL' ? '1' : currentStoreId;
    
    // Auto-assign account ID if not provided and not 'Due'
    let entryWithAccount = { ...entry };
    if (!entry.accountId && entry.paymentMethod !== 'Due') {
        // Find default account for THIS store
        const defaultAccount = visibleAccounts.find(a => a.isDefault);
        if (defaultAccount) entryWithAccount.accountId = defaultAccount.id;
    }

    const finalEntry = { ...entryWithAccount, storeId: targetStore, isDeleted: false, createdBy: userName };
    setTransactions(prev => [finalEntry, ...prev]);

    // Update Account Balance Logic
    if (entryWithAccount.accountId && entryWithAccount.paymentMethod !== 'Due') {
        const amount = entry.amount;
        let balanceChange = 0;

        // Income logic
        if (['Sale', 'Income', 'Purchase Return'].includes(entry.type)) {
            balanceChange = amount;
        } 
        // Expense logic
        else if (['Purchase', 'Expense', 'Sales Return', 'Salary'].includes(entry.type)) {
            balanceChange = -amount;
        }

        if (balanceChange !== 0) {
            setFinancialAccounts(prev => prev.map(acc => 
                acc.id === entryWithAccount.accountId 
                ? { ...acc, balance: acc.balance + balanceChange }
                : acc
            ));
        }
    }

    // Update Loyalty if Sale
    if (entry.type === 'Sale') {
        const customer = customers.find(c => c.name === entry.entityName);
        if (customer) {
            updateLoyaltyPoints(customer.id, entry.amount);
        }
    }
    logAction('Transaction', `New ${entry.type}`, `Amount: ${entry.amount}`);
  };

  const updateTransaction = (id: string, data: Partial<LedgerEntry>) => {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
      logAction('Transaction', 'Update Transaction', `Updated transaction ID: ${id}`);
  };

  const addFinancialAccount = (account: FinancialAccount) => {
      const targetStore = currentStoreId === 'ALL' ? '1' : currentStoreId;
      setFinancialAccounts(prev => [...prev, { ...account, storeId: targetStore }]);
      logAction('Accounts', 'Add Account', `Created ${account.name}`);
  };

  const transferFunds = (fromAccountId: string, toAccountId: string, amount: number, note?: string) => {
      const targetStore = currentStoreId === 'ALL' ? '1' : currentStoreId;
      // 1. Deduct from Source
      setFinancialAccounts(prev => prev.map(acc => {
          if (acc.id === fromAccountId) return { ...acc, balance: acc.balance - amount };
          if (acc.id === toAccountId) return { ...acc, balance: acc.balance + amount };
          return acc;
      }));

      // 2. Create Transaction Records (Contra)
      const fromAcc = financialAccounts.find(a => a.id === fromAccountId);
      const toAcc = financialAccounts.find(a => a.id === toAccountId);

      // Debit/Credit Log
      const transactionId = Date.now().toString();
      const date = new Date().toISOString().split('T')[0];

      addTransaction({
          id: transactionId,
          storeId: targetStore,
          date,
          entityName: toAcc?.name || 'Internal Transfer',
          type: 'Transfer',
          amount,
          paymentMethod: 'Transfer',
          accountId: fromAccountId,
          reference: `Transfer Out to ${toAcc?.name}`,
          details: { subtotal: amount, tax: 0, discount: 0, delivery: 0 }
      });

      addTransaction({
          id: transactionId + '_in',
          storeId: targetStore,
          date,
          entityName: fromAcc?.name || 'Internal Transfer',
          type: 'Transfer',
          amount, 
          paymentMethod: 'Transfer',
          accountId: toAccountId,
          reference: `Transfer In from ${fromAcc?.name}`,
          details: { subtotal: amount, tax: 0, discount: 0, delivery: 0 }
      });

      logAction('Accounts', 'Fund Transfer', `Transferred ${amount} from ${fromAcc?.name} to ${toAcc?.name}`);
  };

  const updateLoyaltyPoints = (customerId: string, amountSpent: number) => {
      // Logic: 1 Point for every 100 currency units
      const points = Math.floor(amountSpent / 100);
      if (points > 0) {
          setCustomers(prev => prev.map(c => 
              c.id === customerId ? { ...c, loyaltyPoints: (c.loyaltyPoints || 0) + points } : c
          ));
      }
  };

  // Online Orders
  const addOnlineOrder = (order: OnlineOrder) => {
      const targetStore = currentStoreId === 'ALL' ? '1' : currentStoreId;
      setOnlineOrders(prev => [{...order, storeId: targetStore}, ...prev]);
      logAction('E-commerce', 'New Order', `Order ${order.id} received`);
  };

  const updateOnlineOrder = (id: string, data: Partial<OnlineOrder>) => {
      setOnlineOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
      logAction('E-commerce', 'Update Order', `Updated status for ${id}`);
  };

  const deleteItem = (type: 'product' | 'entity' | 'transaction', id: string) => {
      if (type === 'product') setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: true } : p));
      if (type === 'entity') {
          setCustomers(prev => prev.map(c => c.id === id ? { ...c, isDeleted: true } : c));
          setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isDeleted: true } : s));
      }
      if (type === 'transaction') setTransactions(prev => prev.map(t => t.id === id ? { ...t, isDeleted: true } : t));
      logAction('System', 'Delete Item', `Deleted ${type} ID: ${id}`);
  };

  const restoreItem = (type: 'product' | 'entity' | 'transaction', id: string) => {
      if (type === 'product') setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: false } : p));
      if (type === 'entity') {
          setCustomers(prev => prev.map(c => c.id === id ? { ...c, isDeleted: false } : c));
          setSuppliers(prev => prev.map(s => s.id === id ? { ...s, isDeleted: false } : s));
      }
      if (type === 'transaction') setTransactions(prev => prev.map(t => t.id === id ? { ...t, isDeleted: false } : t));
      logAction('System', 'Restore Item', `Restored ${type} ID: ${id}`);
  };

  // Staff Management
  const addStaff = (newStaff: Staff) => {
      const targetStore = currentStoreId === 'ALL' ? '1' : currentStoreId;
      setStaffState(prev => [...prev, { ...newStaff, storeId: targetStore }]);
      logAction('Staff', 'Add Staff', `Added ${newStaff.name}`);
  };

  const updateStaff = (id: string, data: Partial<Staff>) => {
      setStaffState(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      logAction('Staff', 'Update Staff', `Updated staff ID: ${id}`);
  };

  const deleteStaff = (id: string) => {
      setStaffState(prev => prev.filter(s => s.id !== id));
      logAction('Staff', 'Delete Staff', `Removed staff ID: ${id}`);
  };

  const markAttendance = (staffId: string, date: string, status: 'Present' | 'Absent' | 'Leave' | 'Half Day', time?: string) => {
      setStaffState(prev => prev.map(s => {
          if (s.id === staffId) {
              const currentRecord = s.attendance?.[date];
              
              let update: any = { status };
              if (status === 'Present') {
                  if (!currentRecord?.checkIn) {
                      update.checkIn = time || new Date().toLocaleTimeString();
                  } else if (!currentRecord?.checkOut) {
                      update.checkIn = currentRecord.checkIn;
                      update.checkOut = time || new Date().toLocaleTimeString();
                  } else {
                      update.checkIn = currentRecord.checkIn;
                      update.checkOut = currentRecord.checkOut;
                  }
              }
              
              return {
                  ...s,
                  attendance: {
                      ...s.attendance,
                      [date]: { ...currentRecord, ...update }
                  }
              };
          }
          return s;
      }));
  };

  const updatePerformance = (staffId: string, rating: number, comment: string) => {
      setStaffState(prev => prev.map(s => {
          if (s.id === staffId) {
              const currentReviews = s.performance?.reviews || [];
              const newReviews = [{ date: new Date().toLocaleDateString(), rating, comment }, ...currentReviews];
              // Calculate new average rating
              const avgRating = newReviews.reduce((acc, r) => acc + r.rating, 0) / newReviews.length;
              
              return {
                  ...s,
                  performance: {
                      rating: parseFloat(avgRating.toFixed(1)),
                      reviews: newReviews
                  }
              };
          }
          return s;
      }));
      logAction('Staff', 'Update Performance', `Added review for staff ID: ${staffId}`);
  };

  const updateLocation = (staffId: string, location: { lat: number, lng: number, address: string }) => {
      setStaffState(prev => prev.map(s => {
          if (s.id === staffId) {
              const timestamp = new Date().toLocaleString();
              const newLoc = { ...location, timestamp };
              const history = s.locationHistory || [];
              return {
                  ...s,
                  lastLocation: newLoc,
                  locationHistory: [newLoc, ...history].slice(0, 50) // Keep last 50 locations
              };
          }
          return s;
      }));
  };

  // --- Production Logic ---
  const addRawMaterial = (mat: RawMaterial) => {
      setRawMaterials(prev => [...prev, mat]);
      logAction('Production', 'Add Material', `Added ${mat.name}`);
  };

  const updateRawMaterial = (id: string, data: Partial<RawMaterial>) => {
      setRawMaterials(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const restockMaterial = (id: string, qty: number, cost: number) => {
      setRawMaterials(prev => prev.map(m => m.id === id ? { ...m, stock: m.stock + qty } : m));
      const targetStore = currentStoreId === 'ALL' ? '1' : currentStoreId;
      // Log Expense
      const mat = rawMaterials.find(m => m.id === id);
      addTransaction({
          id: Date.now().toString(),
          storeId: targetStore,
          date: new Date().toISOString().split('T')[0],
          entityName: 'Raw Material Supplier',
          type: 'Expense',
          amount: cost,
          paymentMethod: 'Cash',
          details: { subtotal: cost, tax: 0, discount: 0, delivery: 0 },
          reference: `MAT-${mat?.name}`
      });
      logAction('Production', 'Restock Material', `Added ${qty} ${mat?.unit} to ${mat?.name}`);
  };

  const addBOM = (bom: BillOfMaterial) => {
      setBoms(prev => [...prev, bom]);
      logAction('Production', 'Create BOM', `Recipe for ${bom.productName}`);
  };

  const deleteBOM = (id: string) => {
      setBoms(prev => prev.filter(b => b.id !== id));
  };

  const addBatch = (batch: ProductionBatch) => {
      setProductionBatches(prev => [batch, ...prev]);
      logAction('Production', 'Start Batch', `Started batch for ${batch.productName}`);
  };

  const updateBatchStatus = (id: string, status: ProductionBatch['status']) => {
      setProductionBatches(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const completeProductionBatch = (batchId: string) => {
      const batch = productionBatches.find(b => b.id === batchId);
      if (!batch || batch.status === 'Completed') return;

      const bom = boms.find(b => b.id === batch.bomId);
      if (!bom) return;

      // 1. Deduct Materials
      let totalCost = 0;
      setRawMaterials(prev => prev.map(m => {
          const req = bom.materials.find(rm => rm.materialId === m.id);
          if (req) {
              const consumed = req.qty * batch.quantity;
              totalCost += (m.cost * consumed);
              return { ...m, stock: Math.max(0, m.stock - consumed) };
          }
          return m;
      }));

      // 2. Add Finished Product
      updateProductStock(batch.productId, batch.quantity, 'increase');

      // 3. Add Transaction for Stock Report History
      const targetStore = currentStoreId === 'ALL' ? '1' : currentStoreId;
      const transaction: LedgerEntry = {
          id: Date.now().toString(),
          storeId: targetStore,
          date: new Date().toISOString().split('T')[0],
          entityName: 'Production Line',
          type: 'Stock Adjustment', // Maps to stock report
          amount: 0, // Internal transfer
          paymentMethod: 'Adjustment',
          reference: `Production Batch ${batch.id.slice(-4)}`,
          items: [{
              productId: batch.productId,
              name: batch.productName,
              qty: batch.quantity,
              price: totalCost / batch.quantity, // Estimated Unit Cost
              total: totalCost
          }],
          details: { subtotal: 0, tax: 0, discount: 0, delivery: 0 }
      };
      addTransaction(transaction);

      // 4. Update Batch Status
      updateBatchStatus(batchId, 'Completed');
      
      logAction('Production', 'Complete Batch', `Produced ${batch.quantity} units of ${batch.productName}`);
  };

  // --- Category Management ---
  const addCategory = (name: string) => {
      if (!categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
          setCategories(prev => [...prev, { id: Date.now().toString(), name, subCategories: [] }]);
          logAction('System', 'Add Category', `Created category: ${name}`);
      }
  };

  const addSubCategory = (categoryId: string, subCategoryName: string) => {
      setCategories(prev => prev.map(c => {
          if (c.id === categoryId && !c.subCategories.includes(subCategoryName)) {
              return { ...c, subCategories: [...c.subCategories, subCategoryName] };
          }
          return c;
      }));
      logAction('System', 'Add SubCategory', `Added ${subCategoryName} to category`);
  };

  const deleteCategory = (id: string) => {
      setCategories(prev => prev.filter(c => c.id !== id));
      logAction('System', 'Delete Category', `Deleted category ID: ${id}`);
  };

  const deleteSubCategory = (categoryId: string, subCategoryName: string) => {
      setCategories(prev => prev.map(c => {
          if (c.id === categoryId) {
              return { ...c, subCategories: c.subCategories.filter(s => s !== subCategoryName) };
          }
          return c;
      }));
      logAction('System', 'Delete SubCategory', `Deleted sub-category ${subCategoryName}`);
  };

  // --- Expense Category Management ---
  const addExpenseCategory = (name: string) => {
      if (!expenseCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
          setExpenseCategories(prev => [...prev, { id: Date.now().toString(), name }]);
          logAction('System', 'Add Expense Category', `Added ${name}`);
      }
  };

  const deleteExpenseCategory = (id: string) => {
      setExpenseCategories(prev => prev.filter(c => c.id !== id));
      logAction('System', 'Delete Expense Category', `Removed category ID: ${id}`);
  };

  // CRM Methods
  const addCustomerGroup = (group: CustomerGroup) => setCustomerGroups(prev => [...prev, group]);
  const updateCustomerGroup = (id: string, data: Partial<CustomerGroup>) => setCustomerGroups(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  const deleteCustomerGroup = (id: string) => setCustomerGroups(prev => prev.filter(g => g.id !== id));

  const addSupportTicket = (ticket: SupportTicket) => setSupportTickets(prev => [...prev, ticket]);
  const updateSupportTicket = (id: string, data: Partial<SupportTicket>) => setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));

  const addFeedback = (feedback: CustomerFeedback) => setFeedbacks(prev => [...prev, feedback]);

  const addMarketingCampaign = (campaign: MarketingCampaign) => setMarketingCampaigns(prev => [...prev, campaign]);
  const updateMarketingCampaign = (id: string, data: Partial<MarketingCampaign>) => setMarketingCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));

  // --- Scalability & Import/Export ---
  const archiveTransactions = async (beforeDate: string) => {
      const limitDate = new Date(beforeDate);
      if (isNaN(limitDate.getTime())) {
          console.error("Invalid archive date provided");
          return 0;
      }
      const limit = limitDate.getTime();
      
      const toArchive = transactions.filter(t => {
          if (!t.date) return false;
          const tDate = new Date(t.date);
          return !isNaN(tDate.getTime()) && tDate.getTime() < limit;
      });
      
      if (toArchive.length === 0) return 0;

      // Export to file
      const dataStr = JSON.stringify(toArchive, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nexus_archive_${beforeDate}_${toArchive.length}tx.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Remove from state
      setTransactions(prev => prev.filter(t => new Date(t.date).getTime() >= limit));
      
      logAction('System', 'Data Archive', `Archived ${toArchive.length} transactions older than ${beforeDate}`);
      return toArchive.length;
  };

  const getAllData = () => {
      return {
          products, customers, suppliers, transactions, financialAccounts, onlineOrders, 
          staff, appLogs, courierSettings, domainSettings, promoCodes, 
          shopPolicies, rawMaterials, boms, productionBatches, categories, expenseCategories
      };
  };

  const importData = (jsonData: string) => {
      try {
          const data = JSON.parse(jsonData);
          if(data.products) setProducts(data.products);
          if(data.customers) setCustomers(data.customers);
          if(data.suppliers) setSuppliers(data.suppliers);
          if(data.transactions) setTransactions(data.transactions);
          if(data.financialAccounts) setFinancialAccounts(data.financialAccounts);
          if(data.onlineOrders) setOnlineOrders(data.onlineOrders);
          if(data.staff) setStaffState(data.staff);
          if(data.courierSettings) setCourierSettings(data.courierSettings);
          if(data.categories) setCategories(data.categories);
          if(data.expenseCategories) setExpenseCategories(data.expenseCategories);
          // ... update other states as needed
          logAction('System', 'Data Import', 'Full system data restore performed');
          alert('Data restored successfully! The page will refresh.');
          window.location.reload();
      } catch (e) {
          console.error("Import failed", e);
          alert("Invalid data file format.");
      }
  };

  const logAction = (module: string, action: string, details?: string) => {
      const user = localStorage.getItem('nexus_user');
      const staffName = user ? JSON.parse(user).businessName : 'System';
      
      const newLog: AppLog = {
          id: Date.now().toString(),
          staffName,
          module,
          action,
          details,
          timestamp: new Date().toLocaleString()
      };
      setAppLogs(prev => [newLog, ...prev]);
  };

  // Settings Updates
  const updateCourierSettings = (provider: string, data: Partial<CourierConfig>) => {
      setCourierSettings(prev => prev.map(c => c.provider === provider ? { ...c, ...data } : c));
  };

  const updateDomainSettings = (data: Partial<DomainConfig>) => {
      setDomainSettings(prev => ({ ...prev, ...data }));
  };

  // Promo & Policy
  const addPromoCode = (code: PromoCode) => {
      setPromoCodes(prev => [...prev, code]);
  };

  const deletePromoCode = (id: string) => {
      setPromoCodes(prev => prev.filter(c => c.id !== id));
  };

  const updateShopPolicy = (data: Partial<ShopPolicies>) => {
      setShopPolicies(prev => ({ ...prev, ...data }));
  };

  const toggleFeaturedProduct = (productId: string) => {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p));
  };

  return (
    <DataContext.Provider value={{ 
      products: visibleProducts, 
      customers, 
      suppliers, 
      transactions: visibleTransactions, 
      financialAccounts: visibleAccounts,
      onlineOrders: visibleOrders,
      staff: visibleStaff,
      appLogs,
      courierSettings,
      domainSettings,
      promoCodes,
      shopPolicies,
      categories,
      expenseCategories,
      // Customer CRM
      customerGroups,
      supportTickets,
      feedbacks,
      marketingCampaigns,
      // Production
      rawMaterials,
      boms,
      productionBatches,
      addProduct, 
      updateProduct,
      updateProductStock, 
      processPurchase, // Exposed here
      addEntity, 
      updateEntity,
      addTransaction,
      updateTransaction,
      deleteItem, 
      restoreItem,
      updateLoyaltyPoints,
      addFinancialAccount,
      transferFunds,
      addOnlineOrder,
      updateOnlineOrder,
      addStaff,
      updateStaff,
      deleteStaff,
      markAttendance,
      updatePerformance,
      updateLocation,
      logAction,
      updateCourierSettings,
      updateDomainSettings,
      addPromoCode,
      deletePromoCode,
      updateShopPolicy,
      toggleFeaturedProduct,
      addCategory,
      addSubCategory,
      deleteCategory,
      deleteSubCategory,
      addExpenseCategory,
      deleteExpenseCategory,
      // Customer CRM
      addCustomerGroup,
      updateCustomerGroup,
      deleteCustomerGroup,
      addSupportTicket,
      updateSupportTicket,
      addFeedback,
      addMarketingCampaign,
      updateMarketingCampaign,
      // Production Methods
      addRawMaterial,
      updateRawMaterial,
      restockMaterial,
      addBOM,
      deleteBOM,
      addBatch,
      updateBatchStatus,
      completeProductionBatch,
      // Scalability
      archiveTransactions,
      getAllData,
      importData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
