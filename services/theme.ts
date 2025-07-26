import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSize = 'small' | 'medium' | 'large';
export type ContrastMode = 'normal' | 'high';

export interface ThemeSettings {
  mode: ThemeMode;
  fontSize: FontSize;
  contrast: ContrastMode;
}

export interface Theme {
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    accent: string;
  };
  fonts: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

const THEME_SETTINGS_KEY = 'theme_settings';

export const lightTheme: Theme = {
  colors: {
    background: '#ffffff',
    surface: '#f8fafc',
    primary: '#111827',
    secondary: '#6b7280',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    accent: '#6366f1',
  },
  fonts: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const darkTheme: Theme = {
  colors: {
    background: '#0f172a',
    surface: '#1e293b',
    primary: '#f8fafc',
    secondary: '#94a3b8',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    accent: '#8b5cf6',
  },
  fonts: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const highContrastLightTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#ffffff',
    surface: '#ffffff',
    primary: '#000000',
    secondary: '#000000',
    text: '#000000',
    textSecondary: '#000000',
    border: '#000000',
  },
};

export const highContrastDarkTheme: Theme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: '#000000',
    surface: '#000000',
    primary: '#ffffff',
    secondary: '#ffffff',
    text: '#ffffff',
    textSecondary: '#ffffff',
    border: '#ffffff',
  },
};

export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const settings = await AsyncStorage.getItem(THEME_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
    return {
      mode: 'light',
      fontSize: 'medium',
      contrast: 'normal',
    };
  } catch (error) {
    console.error('Error getting theme settings:', error);
    return {
      mode: 'light',
      fontSize: 'medium',
      contrast: 'normal',
    };
  }
}

export async function saveThemeSettings(settings: ThemeSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving theme settings:', error);
  }
}

export function getTheme(settings: ThemeSettings): Theme {
  let baseTheme: Theme;
  
  if (settings.mode === 'dark') {
    baseTheme = settings.contrast === 'high' ? highContrastDarkTheme : darkTheme;
  } else {
    baseTheme = settings.contrast === 'high' ? highContrastLightTheme : lightTheme;
  }
  
  // Apply font size scaling
  const fontScale = settings.fontSize === 'small' ? 0.875 : settings.fontSize === 'large' ? 1.25 : 1;
  
  return {
    ...baseTheme,
    fonts: {
      small: baseTheme.fonts.small * fontScale,
      medium: baseTheme.fonts.medium * fontScale,
      large: baseTheme.fonts.large * fontScale,
      xlarge: baseTheme.fonts.xlarge * fontScale,
    },
  };
}