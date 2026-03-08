import fs from 'fs';

let content = fs.readFileSync('src/contexts/DataContext.tsx', 'utf-8');

// Replace INITIAL_PRODUCTS
content = content.replace(/const INITIAL_PRODUCTS: Product\[\] = \[[\s\S]*?\];/, 'const INITIAL_PRODUCTS: Product[] = [];');

// Replace INITIAL_STAFF
content = content.replace(/const INITIAL_STAFF: Staff\[\] = \[[\s\S]*?\];/, 'const INITIAL_STAFF: Staff[] = [];');

// Replace INITIAL_LOGS
content = content.replace(/const INITIAL_LOGS: AppLog\[\] = \[[\s\S]*?\];/, 'const INITIAL_LOGS: AppLog[] = [];');

// Replace INITIAL_ACCOUNTS
content = content.replace(/const INITIAL_ACCOUNTS: FinancialAccount\[\] = \[[\s\S]*?\];/, `const INITIAL_ACCOUNTS: FinancialAccount[] = [
    { id: 'cash-1', storeId: '1', name: 'Main Cash', type: 'Cash', balance: 0, isDefault: true }
];`);

// Replace INITIAL_ONLINE_ORDERS
content = content.replace(/const INITIAL_ONLINE_ORDERS: OnlineOrder\[\] = \[[\s\S]*?\];/, 'const INITIAL_ONLINE_ORDERS: OnlineOrder[] = [];');

// Replace INITIAL_CATEGORIES
content = content.replace(/const INITIAL_CATEGORIES: Category\[\] = \[[\s\S]*?\];/, 'const INITIAL_CATEGORIES: Category[] = [];');

// Replace inline customers
content = content.replace(/return saved \? JSON\.parse\(saved\) : \[\s*\{\s*id:\s*'c1'[\s\S]*?\];/g, 'return saved ? JSON.parse(saved) : [];');

// Replace inline suppliers
content = content.replace(/return saved \? JSON\.parse\(saved\) : \[\s*\{\s*id:\s*'s1'[\s\S]*?\];/g, 'return saved ? JSON.parse(saved) : [];');

// Replace inline transactions
content = content.replace(/return saved \? JSON\.parse\(saved\) : \[\s*\{\s*id:\s*'t1'[\s\S]*?\];/g, 'return saved ? JSON.parse(saved) : [];');

// Replace inline promoCodes
content = content.replace(/return saved \? JSON\.parse\(saved\) : \[\s*\{\s*id:\s*'1'[\s\S]*?\];/g, 'return saved ? JSON.parse(saved) : [];');

// Replace inline customerGroups
content = content.replace(/return saved \? JSON\.parse\(saved\) : \[\s*\{\s*id:\s*'vip'[\s\S]*?\];/g, 'return saved ? JSON.parse(saved) : [];');

// Replace inline rawMaterials
content = content.replace(/return saved \? JSON\.parse\(saved\) : \[\s*\{\s*id:\s*'m1'[\s\S]*?\];/g, 'return saved ? JSON.parse(saved) : [];');

fs.writeFileSync('src/contexts/DataContext.tsx', content);
console.log("Successfully removed mock data from DataContext.tsx");
