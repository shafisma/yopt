import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeSettings, getTheme, getThemeSettings, saveThemeSettings } from '../services/theme';

interface ThemeContextType {
  theme: Theme;
  settings: ThemeSettings;
  updateTheme: (settings: Partial<ThemeSettings>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>({
    mode: 'light',
    fontSize: 'medium',
    contrast: 'normal',
  });
  const [theme, setTheme] = useState<Theme>(getTheme(settings));

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const savedSettings = await getThemeSettings();
      setSettings(savedSettings);
      setTheme(getTheme(savedSettings));
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
  };

  const updateTheme = async (newSettings: Partial<ThemeSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      setTheme(getTheme(updatedSettings));
      await saveThemeSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, settings, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}