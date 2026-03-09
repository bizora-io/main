
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useStores } from './StoreContext';
import { Staff, AppLog } from '../types';
import * as syncService from '../services/syncService';
import { useInventory } from '../hooks/data/useInventory';
import { useCRM } from '../hooks/data/useCRM';
import { useFinance } from '../hooks/data/useFinance';
import { useSettings } from '../hooks/data/useSettings';
import { useSystemData } from '../hooks/data/useSystemData';

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
  payments?: { method: string, amount: number, accountId?: string }[];
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

const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_STAFF: Staff[] = [];

const INITIAL_LOGS: AppLog[] = [];

const INITIAL_ACCOUNTS: FinancialAccount[] = [];

const INITIAL_ONLINE_ORDERS: OnlineOrder[] = [];

const INITIAL_CATEGORIES: Category[] = [];

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
    const [pendingTransactions, setPendingTransactions] = useState<LedgerEntry[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('pending_transactions');
        if (stored) setPendingTransactions(JSON.parse(stored));
    }, []);

    useEffect(() => {
        const handleOnline = async () => {
            console.log('Back online, syncing pending transactions...');
            if (pendingTransactions.length > 0) {
                const success = await syncService.syncData(pendingTransactions);
                if (success) {
                    setPendingTransactions([]);
                    localStorage.removeItem('pending_transactions');
                }
            }
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [pendingTransactions]);
  const { activeStore } = useStores();
  
  const { products, setProducts, rawMaterials, setRawMaterials, boms, setBoms, productionBatches, setProductionBatches } = useInventory();
  const { customers, setCustomers, suppliers, setSuppliers, customerGroups, setCustomerGroups, supportTickets, setSupportTickets, feedbacks, setFeedbacks, marketingCampaigns, setMarketingCampaigns } = useCRM();
  const { transactions, setTransactions, financialAccounts, setFinancialAccounts, expenseCategories, setExpenseCategories } = useFinance();
  const { courierSettings, setCourierSettings, domainSettings, setDomainSettings, promoCodes, setPromoCodes, shopPolicies, setShopPolicies, categories, setCategories } = useSettings();
  const { onlineOrders, setOnlineOrders, appLogs, setAppLogs, staff, setStaff } = useSystemData();

  const currentStoreId = activeStore === 'HEAD_OFFICE' ? 'ALL' : activeStore.id;



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
    console.log('Adding transaction:', entry);
    console.log('Current storeId:', currentStoreId);
    console.log('Financial accounts:', financialAccounts);
    
    const user = localStorage.getItem('nexus_user');
    const userName = user ? JSON.parse(user).businessName : 'Staff';
    const targetStore = currentStoreId === 'ALL' ? '1' : currentStoreId;
    
    // Auto-assign account ID if not provided and not 'Due'
    let entryWithAccount = { ...entry };
    const defaultAccount = financialAccounts.find(a => a.isDefault) || financialAccounts[0];
    console.log('Default account:', defaultAccount);

    if (entry.payments) {
        entryWithAccount.payments = entry.payments.map(p => ({
            ...p,
            accountId: p.accountId || (p.method !== 'Due' ? defaultAccount?.id : undefined)
        }));
    } else if (!entry.accountId && entry.paymentMethod !== 'Due') {
        if (defaultAccount) entryWithAccount.accountId = defaultAccount.id;
    }

    const finalEntry = { ...entryWithAccount, storeId: targetStore, isDeleted: false, createdBy: userName };
    console.log('Final entry to add:', finalEntry);
    setTransactions(prev => [finalEntry, ...prev]);

    if (navigator.onLine) {
        syncService.syncData([finalEntry]);
    } else {
        const newPending = [...pendingTransactions, finalEntry];
        setPendingTransactions(newPending);
        localStorage.setItem('pending_transactions', JSON.stringify(newPending));
    }

    // Update Account Balance Logic
    const updateBalance = (accountId: string, amount: number, type: string) => {
        let balanceChange = 0;
        // Income/Sales increase balance, Expenses/Purchases decrease balance
        if (['Sale', 'Income', 'Purchase Return'].includes(type)) {
            balanceChange = amount;
        } else if (['Purchase', 'Expense', 'Sales Return', 'Salary'].includes(type)) {
            balanceChange = -amount;
        }

        console.log(`Updating balance for account ${accountId}: type=${type}, amount=${amount}, change=${balanceChange}`);

        if (balanceChange !== 0) {
            setFinancialAccounts(prev => {
                const accountExists = prev.some(a => a.id === accountId);
                if (!accountExists) {
                    console.warn(`Account ${accountId} not found in financialAccounts! Current accounts:`, prev);
                }
                
                return prev.map(acc => {
                    if (acc.id === accountId) {
                        console.log(`Account ${acc.id} old balance: ${acc.balance}, new balance: ${acc.balance + balanceChange}`);
                        return { ...acc, balance: acc.balance + balanceChange };
                    }
                    return acc;
                });
            });
        }
    };

    if (finalEntry.payments) {
        console.log('Processing payments array:', finalEntry.payments);
        finalEntry.payments.forEach(p => {
            if (p.accountId && p.method !== 'Due') {
                console.log('Calling updateBalance for payment:', p);
                updateBalance(p.accountId, p.amount, finalEntry.type);
            } else {
                console.log('Skipping updateBalance for payment (no account or Due):', p);
            }
        });
    } else if (finalEntry.accountId && finalEntry.paymentMethod !== 'Due') {
        console.log('Calling updateBalance for single account:', finalEntry.accountId, finalEntry.amount, finalEntry.type);
        updateBalance(finalEntry.accountId, finalEntry.amount, finalEntry.type);
    } else {
        console.log('Skipping updateBalance (no account or Due):', finalEntry);
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
      setStaff(prev => [...prev, { ...newStaff, storeId: targetStore }]);
      logAction('Staff', 'Add Staff', `Added ${newStaff.name}`);
  };

  const updateStaff = (id: string, data: Partial<Staff>) => {
      setStaff(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      logAction('Staff', 'Update Staff', `Updated staff ID: ${id}`);
  };

  const deleteStaff = (id: string) => {
      setStaff(prev => prev.filter(s => s.id !== id));
      logAction('Staff', 'Delete Staff', `Removed staff ID: ${id}`);
  };

  const markAttendance = (staffId: string, date: string, status: 'Present' | 'Absent' | 'Leave' | 'Half Day', time?: string) => {
      setStaff(prev => prev.map(s => {
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
      setStaff(prev => prev.map(s => {
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
      setStaff(prev => prev.map(s => {
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
          if(data.staff) setStaff(data.staff);
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
      products, 
      customers, 
      suppliers, 
      transactions, 
      financialAccounts,
      onlineOrders,
      staff,
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
