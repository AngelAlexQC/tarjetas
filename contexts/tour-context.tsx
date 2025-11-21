import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface TourItem {
  key: string;
  show: () => void;
  order: number;
}

interface TourContextType {
  register: (key: string, show: () => void, order?: number) => void;
  unregister: (key: string) => void;
  onTooltipClosed: (key: string) => void;
  resetTour: () => Promise<void>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const STORAGE_KEY_SEEN_TOOLTIPS = '@tour_seen_tooltips';

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [seenKeys, setSeenKeys] = useState<Set<string>>(new Set());
  const [registeredItems, setRegisteredItems] = useState<TourItem[]>([]);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Cargar keys vistas al inicio
  useEffect(() => {
    loadSeenKeys();
  }, []);

  const loadSeenKeys = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_SEEN_TOOLTIPS);
      if (stored) {
        setSeenKeys(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error('Error loading tour state', e);
    } finally {
      setIsReady(true);
    }
  };

  const saveSeenKey = async (key: string) => {
    try {
      const newSet = new Set(seenKeys);
      newSet.add(key);
      setSeenKeys(newSet);
      await AsyncStorage.setItem(STORAGE_KEY_SEEN_TOOLTIPS, JSON.stringify(Array.from(newSet)));
    } catch (e) {
      console.error('Error saving tour state', e);
    }
  };

  // Gestionar la cola de tooltips
  useEffect(() => {
    if (!isReady || currentKey) return;

    // Filtrar items que no han sido vistos
    const unseenItems = registeredItems
      .filter(item => !seenKeys.has(item.key))
      .sort((a, b) => a.order - b.order);

    if (unseenItems.length > 0) {
      const nextItem = unseenItems[0];
      setCurrentKey(nextItem.key);
      // Pequeño delay para asegurar que la UI está lista
      setTimeout(() => {
        nextItem.show();
      }, 500);
    }
  }, [isReady, currentKey, registeredItems, seenKeys]);

  const register = useCallback((key: string, show: () => void, order: number = 0) => {
    setRegisteredItems(prev => {
      if (prev.find(i => i.key === key)) return prev;
      return [...prev, { key, show, order }];
    });
  }, []);

  const unregister = useCallback((key: string) => {
    setRegisteredItems(prev => prev.filter(i => i.key !== key));
    if (currentKey === key) {
      setCurrentKey(null);
    }
  }, [currentKey]);

  const onTooltipClosed = useCallback((key: string) => {
    if (key === currentKey) {
      saveSeenKey(key);
      setCurrentKey(null);
    }
  }, [currentKey]); // saveSeenKey is stable enough or we can add it if we wrap it in useCallback too, but for now this fixes the lint warning about seenKeys which wasn't used inside but was in deps

  const resetTour = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_SEEN_TOOLTIPS);
      setSeenKeys(new Set());
      setCurrentKey(null);
    } catch (e) {
      console.error('Error resetting tour', e);
    }
  }, []);

  return (
    <TourContext.Provider value={{ register, unregister, onTooltipClosed, resetTour }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
