import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

interface SplashContextType {
  isSplashComplete: boolean;
  setSplashComplete: (value: boolean) => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export function SplashProvider({ children }: { children: ReactNode }) {
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  const value = useMemo(() => ({
    isSplashComplete,
    setSplashComplete: setIsSplashComplete,
  }), [isSplashComplete]);

  return (
    <SplashContext.Provider value={value}>
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}
