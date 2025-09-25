
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DisplayUnit = 'btc' | 'sats' | 'usd';
type Currency = 'usd' | 'eur' | 'jpy' | 'bif';

interface Settings {
  displayUnit: DisplayUnit;
  currency: Currency;
}

interface SettingsContextType {
  settings: Settings;
  setDisplayUnit: (unit: DisplayUnit) => void;
  setCurrency: (currency: Currency) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialSettings = (): Settings => {
    if (typeof window === 'undefined') {
        return { displayUnit: 'btc', currency: 'usd' };
    }
    const savedSettings = localStorage.getItem('walletSettings');
    if (savedSettings) {
        try {
            const parsed = JSON.parse(savedSettings);
            return {
                displayUnit: parsed.displayUnit || 'btc',
                currency: parsed.currency || 'usd',
            }
        } catch (e) {
            return { displayUnit: 'btc', currency: 'usd' };
        }
    }
    return { displayUnit: 'btc', currency: 'usd' };
};


export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(getInitialSettings);

  useEffect(() => {
    // This effect runs on the client after initial render to sync with localStorage
    setSettings(getInitialSettings());
  }, []);


  useEffect(() => {
    // This effect saves settings to localStorage whenever they change
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('walletSettings', JSON.stringify(settings));
        } catch (e) {
            console.error("Could not save settings to localStorage", e);
        }
    }
  }, [settings]);

  const setDisplayUnit = (displayUnit: DisplayUnit) => {
    setSettings(s => ({ ...s, displayUnit }));
  };

  const setCurrency = (currency: Currency) => {
    setSettings(s => ({ ...s, currency }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setDisplayUnit, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
