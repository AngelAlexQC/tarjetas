import { STORAGE_KEYS } from '@/constants/app';
import { loggers } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const log = loggers.tour;

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
  setAppReady: () => void;
  stopTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  isTourActive: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [seenKeys, setSeenKeys] = useState<Set<string>>(new Set());
  const [registeredItems, setRegisteredItems] = useState<TourItem[]>([]);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAppReady, setAppReadyState] = useState(false);
  const [isTourStopped, setIsTourStopped] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Cargar keys vistas al inicio
  useEffect(() => {
    loadSeenKeys();
  }, []);

  const loadSeenKeys = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TOUR_SEEN_TOOLTIPS);
      if (stored) {
        setSeenKeys(new Set(JSON.parse(stored)));
      }
      const pausedState = await AsyncStorage.getItem(STORAGE_KEYS.TOUR_PAUSED);
      if (pausedState === 'true') {
        setIsPaused(true);
      }
    } catch (e) {
      log.error('Error loading tour state', e);
    } finally {
      setIsReady(true);
    }
  };

  const saveSeenKey = useCallback(async (key: string) => {
    try {
      setSeenKeys(prev => {
        const newSet = new Set(prev);
        newSet.add(key);
        AsyncStorage.setItem(STORAGE_KEYS.TOUR_SEEN_TOOLTIPS, JSON.stringify(Array.from(newSet)));
        return newSet;
      });
    } catch (e) {
      log.error('Error saving tour state', e);
    }
  }, []);

  // Gestionar la cola de tooltips
  useEffect(() => {
    if (!isReady || !isAppReady || currentKey || isTourStopped || isPaused) return;

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
  }, [isReady, isAppReady, currentKey, registeredItems, seenKeys, isTourStopped, isPaused]);

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
  }, [currentKey, saveSeenKey]);

  const stopTour = useCallback(() => {
    setIsTourStopped(true);
    setCurrentKey(null);
  }, []);

  const pauseTour = useCallback(async () => {
    setIsPaused(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOUR_PAUSED, 'true');
    } catch (e) {
      log.error('Error saving tour paused state', e);
    }
  }, []);

  const resumeTour = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTour = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOUR_SEEN_TOOLTIPS);
      await AsyncStorage.removeItem(STORAGE_KEYS.TOUR_PAUSED);
      setSeenKeys(new Set());
      setCurrentKey(null);
      setIsTourStopped(false);
      setIsPaused(false);
    } catch (e) {
      log.error('Error resetting tour', e);
    }
  }, []);

  const setAppReady = useCallback(() => {
    setAppReadyState(true);
  }, []);

  const isTourActive = currentKey !== null;

  const contextValue = useMemo(() => ({
    register,
    unregister,
    onTooltipClosed,
    resetTour,
    setAppReady,
    stopTour,
    pauseTour,
    resumeTour,
    isTourActive,
  }), [register, unregister, onTooltipClosed, resetTour, setAppReady, stopTour, pauseTour, resumeTour, isTourActive]);

  return (
    <TourContext.Provider value={contextValue}>
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
