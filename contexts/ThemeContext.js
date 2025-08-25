import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';

// Définition des thèmes
export const lightTheme = {
  mode: 'light',
  colors: {
    // Couleurs principales
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#60A5FA',
    
    // Arrière-plans
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceCard: '#FFFFFF',
    surfaceSecondary: '#F8F9FA',
    
    // Textes
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    textTertiary: '#BDC3C7',
    textOnPrimary: '#FFFFFF',
    
    // États
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Bordures et séparateurs
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    separator: '#F0F0F0',
    
    // Ombres
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',
    
    // Couleurs spécifiques au jeu
    typing: {
      correct: '#10B981',
      incorrect: '#EF4444',
      cursor: '#3B82F6',
      completed: '#6B7280',
      background: '#F9FAFB',
    },
    
    // Mode multijoueur
    multiplayer: {
      player1: '#3B82F6',
      player2: '#10B981',
      player3: '#F59E0B',
      player4: '#EF4444',
      player5: '#8B5CF6',
      player6: '#EC4899',
      player7: '#06B6D4',
      player8: '#84CC16',
      player9: '#F97316',
      player10: '#6366F1',
    }
  },
  statusBar: 'dark-content'
};

export const darkTheme = {
  mode: 'dark',
  colors: {
    // Couleurs principales
    primary: '#60A5FA',
    primaryDark: '#3B82F6',
    primaryLight: '#93C5FD',
    
    // Arrière-plans
    background: '#111827',
    surface: '#1F2937',
    surfaceCard: '#374151',
    surfaceSecondary: '#1F2937',
    
    // Textes
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    textOnPrimary: '#1F2937',
    
    // États
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    
    // Bordures et séparateurs
    border: '#374151',
    borderLight: '#4B5563',
    separator: '#374151',
    
    // Ombres
    shadow: 'rgba(0, 0, 0, 0.4)',
    shadowDark: 'rgba(0, 0, 0, 0.6)',
    
    // Couleurs spécifiques au jeu
    typing: {
      correct: '#34D399',
      incorrect: '#F87171',
      cursor: '#60A5FA',
      completed: '#9CA3AF',
      background: '#1F2937',
    },
    
    // Mode multijoueur
    multiplayer: {
      player1: '#60A5FA',
      player2: '#34D399',
      player3: '#FBBF24',
      player4: '#F87171',
      player5: '#A78BFA',
      player6: '#F472B6',
      player7: '#22D3EE',
      player8: '#A3E635',
      player9: '#FB923C',
      player10: '#818CF8',
    }
  },
  statusBar: 'light-content'
};

// Contexte du thème
const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

// Hook pour utiliser le thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Provider du thème
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    loadTheme();
  }, []);

  // Mettre à jour la StatusBar quand le thème change
  useEffect(() => {
    StatusBar.setBarStyle(theme.statusBar, true);
  }, [theme]);

  const loadTheme = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const darkMode = settings.darkModeEnabled || false;
        setIsDark(darkMode);
        setTheme(darkMode ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.log('Erreur lors du chargement du thème:', error);
    }
  };

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    const newTheme = newIsDark ? darkTheme : lightTheme;
    
    setIsDark(newIsDark);
    setTheme(newTheme);
    
    // Sauvegarder le nouveau thème
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.darkModeEnabled = newIsDark;
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const setThemeMode = async (darkMode) => {
    const newTheme = darkMode ? darkTheme : lightTheme;
    
    setIsDark(darkMode);
    setTheme(newTheme);
    
    // Sauvegarder le nouveau thème
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.darkModeEnabled = darkMode;
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const value = {
    theme,
    isDark,
    toggleTheme,
    setTheme: setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
