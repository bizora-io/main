import fs from 'fs';

let content = fs.readFileSync('src/contexts/DataContext.tsx', 'utf-8');

const statesToPersist = [
    { name: 'products', defaultVal: 'INITIAL_PRODUCTS' },
    { name: 'customers', defaultVal: `[
      { id: 'c1', name: 'Rahim Uddin', mobile: '01711223344', address: 'Dhaka, Bangladesh', type: 'Customer', loyaltyPoints: 120 }
  ]` },
    { name: 'suppliers', defaultVal: `[
      { id: 's1', name: 'ACI Pharma', mobile: '01911223344', address: 'Tejgaon Ind. Area', type: 'Supplier' }
  ]` },
    { name: 'transactions', defaultVal: `[
      { id: 't1', storeId: '1', date: '2024-03-10', entityName: 'Rahim Uddin', entityMobile: '01711223344', type: 'Sale', amount: 500, paymentMethod: 'Cash', accountId: 'cash-1', createdBy: 'Admin', details: { subtotal: 500, tax: 0, discount: 0, delivery: 0 } },
      { id: 't2', storeId: '1', date: '2024-03-11', entityName: 'ACI Pharma', type: 'Purchase', amount: 2000, paymentMethod: 'Due', createdBy: 'Manager' }
  ]` },
    { name: 'financialAccounts', defaultVal: 'INITIAL_ACCOUNTS' },
    { name: 'onlineOrders', defaultVal: 'INITIAL_ONLINE_ORDERS' },
    { name: 'appLogs', defaultVal: 'INITIAL_LOGS' },
    { name: 'courierSettings', defaultVal: `[
      { provider: 'Pathao', apiKey: '', apiSecret: '', enabled: false },
      { provider: 'Steadfast', apiKey: '', apiSecret: '', enabled: false },
      { provider: 'Paperfly', apiKey: '', apiSecret: '', enabled: false },
      { provider: 'RedX', apiKey: '', apiSecret: '', enabled: false },
  ]` },
    { name: 'domainSettings', defaultVal: `{
      subdomain: 'ishas-fashion.bizora.com',
      customDomain: '',
      status: 'Not Connected'
  }` },
    { name: 'promoCodes', defaultVal: `[
      { id: '1', code: 'WELCOME10', discount: 10, type: 'percentage', status: 'active' }
  ]` },
    { name: 'shopPolicies', defaultVal: `{
      terms: 'All sales are final unless item is defective.',
      refund: 'Refunds processed within 7 days of return receipt.',
      shipping: 'Standard delivery takes 3-5 business days.'
  }` },
    { name: 'categories', defaultVal: 'INITIAL_CATEGORIES' },
    { name: 'expenseCategories', defaultVal: 'INITIAL_EXPENSE_CATEGORIES' },
    { name: 'customerGroups', defaultVal: `[
      { id: 'vip', name: 'VIP', color: '#8b5cf6', description: 'High value customers' },
      { id: 'new', name: 'New', color: '#10b981', description: 'Joined in last 30 days' }
  ]` },
    { name: 'supportTickets', defaultVal: `[]` },
    { name: 'feedbacks', defaultVal: `[]` },
    { name: 'marketingCampaigns', defaultVal: `[]` },
    { name: 'rawMaterials', defaultVal: `[
      { id: 'm1', name: 'Cotton Fabric', stock: 500, unit: 'Meters', cost: 50, minLevel: 100 },
      { id: 'm2', name: 'Thread Spool', stock: 200, unit: 'Pcs', cost: 10, minLevel: 50 },
      { id: 'm3', name: 'Buttons', stock: 1000, unit: 'Pcs', cost: 1, minLevel: 200 },
  ]` },
    { name: 'boms', defaultVal: `[]` },
    { name: 'productionBatches', defaultVal: `[]` }
];

// We will just replace the whole block from `const [products` to `const [productionBatches`
const startMarker = 'const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);';
const endMarker = 'const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker) + endMarker.length;

if (startIndex !== -1 && endIndex !== -1) {
    let replacement = '';
    
    statesToPersist.forEach(state => {
        const typeMatch = content.match(new RegExp(`const \\[${state.name}, set${state.name.charAt(0).toUpperCase() + state.name.slice(1)}\\] = useState<([^>]+)>`));
        let type = 'any';
        if (typeMatch) {
            type = typeMatch[1];
        } else if (state.name === 'products') type = 'Product[]';
        else if (state.name === 'customers') type = 'Entity[]';
        else if (state.name === 'suppliers') type = 'Entity[]';
        else if (state.name === 'transactions') type = 'LedgerEntry[]';
        else if (state.name === 'financialAccounts') type = 'FinancialAccount[]';
        else if (state.name === 'onlineOrders') type = 'OnlineOrder[]';
        else if (state.name === 'appLogs') type = 'AppLog[]';
        else if (state.name === 'courierSettings') type = 'CourierConfig[]';
        else if (state.name === 'domainSettings') type = 'DomainConfig';
        else if (state.name === 'promoCodes') type = 'PromoCode[]';
        else if (state.name === 'shopPolicies') type = 'ShopPolicies';
        else if (state.name === 'categories') type = 'Category[]';
        else if (state.name === 'expenseCategories') type = 'ExpenseCategory[]';
        else if (state.name === 'customerGroups') type = 'CustomerGroup[]';
        else if (state.name === 'supportTickets') type = 'SupportTicket[]';
        else if (state.name === 'feedbacks') type = 'CustomerFeedback[]';
        else if (state.name === 'marketingCampaigns') type = 'MarketingCampaign[]';
        else if (state.name === 'rawMaterials') type = 'RawMaterial[]';
        else if (state.name === 'boms') type = 'BillOfMaterial[]';
        else if (state.name === 'productionBatches') type = 'ProductionBatch[]';

        const setterName = `set${state.name.charAt(0).toUpperCase() + state.name.slice(1)}`;
        
        replacement += `  const [${state.name}, ${setterName}] = useState<${type}>(() => {\n`;
        replacement += `      const saved = localStorage.getItem('nexus_${state.name}');\n`;
        replacement += `      return saved ? JSON.parse(saved) : ${state.defaultVal};\n`;
        replacement += `  });\n`;
        replacement += `  useEffect(() => {\n`;
        replacement += `      localStorage.setItem('nexus_${state.name}', JSON.stringify(${state.name}));\n`;
        replacement += `  }, [${state.name}]);\n\n`;
    });

    // Don't forget staff
    replacement += `  const [staff, setStaffState] = useState<Staff[]>(() => {\n`;
    replacement += `      const saved = localStorage.getItem('nexus_staff');\n`;
    replacement += `      return saved ? JSON.parse(saved) : INITIAL_STAFF;\n`;
    replacement += `  });\n`;
    replacement += `  useEffect(() => {\n`;
    replacement += `      localStorage.setItem('nexus_staff', JSON.stringify(staff));\n`;
    replacement += `  }, [staff]);\n\n`;

    content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync('src/contexts/DataContext.tsx', content);
    console.log("Successfully updated DataContext.tsx");
} else {
    console.log("Could not find markers");
}
