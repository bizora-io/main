
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Store {
  id: string;
  name: string;
  location: string;
  phone?: string;
  isHeadOffice?: boolean;
}

interface StoreContextType {
  stores: Store[];
  activeStore: Store | 'HEAD_OFFICE';
  switchStore: (storeId: string) => void;
  addStore: (store: Omit<Store, 'id'>) => void;
  updateStore: (id: string, store: Partial<Omit<Store, 'id'>>) => void;
  deleteStore: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_STORES: Store[] = [
    { id: '1', name: 'Main Branch', location: 'Main Location', isHeadOffice: true }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>('HEAD_OFFICE');

  useEffect(() => {
    // Load stores from local storage on mount, or use defaults
    const savedStores = localStorage.getItem('app_stores');
    if (savedStores) {
      try {
        setStores(JSON.parse(savedStores));
      } catch (e) {
        console.error('Failed to parse stores', e);
        setStores(DEFAULT_STORES);
      }
    } else {
      setStores(DEFAULT_STORES);
    }

    const savedActive = localStorage.getItem('app_active_store');
    if (savedActive) {
        setActiveStoreId(savedActive);
    }
  }, []);

  useEffect(() => {
    if (stores.length > 0) {
        localStorage.setItem('app_stores', JSON.stringify(stores));
    }
  }, [stores]);

  const switchStore = (storeId: string) => {
      setActiveStoreId(storeId);
      localStorage.setItem('app_active_store', storeId);
      // Optional: Force reload if context filtering needs a hard reset, though React state usually handles it
  };

  const addStore = (storeData: Omit<Store, 'id'>) => {
    const newStore: Store = {
      ...storeData,
      id: Math.random().toString(36).substring(2, 9),
    };
    setStores(prev => [...prev, newStore]);
  };

  const updateStore = (id: string, storeData: Partial<Omit<Store, 'id'>>) => {
    setStores(prev => prev.map(store => store.id === id ? { ...store, ...storeData } : store));
  };

  const deleteStore = (id: string) => {
    setStores(prev => prev.filter(store => store.id !== id));
    if (activeStoreId === id) {
        switchStore('HEAD_OFFICE');
    }
  };

  const activeStore = activeStoreId === 'HEAD_OFFICE' 
    ? 'HEAD_OFFICE' 
    : stores.find(s => s.id === activeStoreId) || 'HEAD_OFFICE';

  return (
    <StoreContext.Provider value={{ stores, activeStore, switchStore, addStore, updateStore, deleteStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStores = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return context;
};
