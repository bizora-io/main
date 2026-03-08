export const PERMISSIONS = {
    SAAS: {
        subFeatures: {
            DASHBOARD: { key: 'saas.dashboard' },
            MANAGE_BUSINESSES: { key: 'saas.businesses' },
            MANAGE_USERS: { key: 'saas.users' },
            SUBSCRIPTIONS: { key: 'saas.subscriptions' },
            SUPPORT: { key: 'saas.support' },
            SETTINGS: { key: 'saas.settings' }
        }
    },
    POS: {
        subFeatures: {
            SELL: { key: 'pos.sell' },
            QUICK_SALE: { key: 'pos.quick_sale' },
            RETURNS: { key: 'pos.returns' }
        }
    },
    INVENTORY: {
        subFeatures: {
            PURCHASE: { key: 'inventory.purchase' },
            VIEW_STOCK: { key: 'inventory.stock' },
            PRODUCTION: { key: 'inventory.production' },
            TRANSFER: { key: 'inventory.transfer' }
        }
    },
    FINANCE: {
        subFeatures: {
            VIEW_CASHBOX: { key: 'finance.cashbox' },
            VIEW_LEDGERS: { key: 'finance.ledgers' }
        }
    },
    CRM: {
        subFeatures: {
            VIEW_CUSTOMERS: { key: 'crm.customers' },
            COMMUNICATION: { key: 'crm.communication' },
            MARKETING: { key: 'crm.marketing' },
            SUPPORT: { key: 'crm.support' }
        }
    },
    ADMIN: {
        subFeatures: {
            MANAGE_STORES: { key: 'admin.stores' },
            ACCESS_CONTROL: { key: 'admin.access' },
            SUBSCRIPTION: { key: 'admin.subscription' },
            RECYCLE_BIN: { key: 'admin.recycle_bin' },
            SETTINGS: { key: 'admin.settings' }
        }
    },
    HR: {
        subFeatures: {
            MANAGE_STAFF: { key: 'hr.staff' }
        }
    },
    REPORTS: {
        subFeatures: {
            VIEW_REPORTS: { key: 'reports.view' }
        }
    },
    ONLINE_SHOP: {
        subFeatures: {
            MANAGE_SHOP: { key: 'shop.manage' }
        }
    }
};

export const hasPermission = (userPermissions: string[] | undefined, permission: string): boolean => {
    if (!userPermissions) return false;
    if (userPermissions.includes('all')) return true;
    return userPermissions.includes(permission);
};

export const getAllPermissions = (): string[] => {
    return ['all'];
};
