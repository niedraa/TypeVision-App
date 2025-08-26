import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, StatusBar, TouchableOpacity, Platform } from 'react-native';
import ShopScreen from './ShopScreen';
import MultiplayerScreen from './screens/MultiplayerScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SuccessScreen from './SuccessScreen';
import CancelScreen from './CancelScreen';
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import { FadeTransition, ScaleTransition } from './components/Transitions';
import { AnimatedButton } from './components/AnimatedButton';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Styles dynamiques basés sur le thème
  const styles = createStyles(theme);

  useEffect(() => {
    // Simuler un temps de chargement initial
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 secondes de chargement

    return () => clearTimeout(loadingTimer);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('home');
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Écran de chargement
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Écran de connexion si pas authentifié
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'profile') {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileScreen 
          onBack={() => setCurrentScreen('home')}
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
        />
      </SafeAreaView>
    );
  }

  if (currentScreen === 'multiplayer') {
    return (
      <SafeAreaView style={styles.container}>
        <MultiplayerScreen 
          onBack={() => setCurrentScreen('home')} 
          currentUser={currentUser}
        />
      </SafeAreaView>
    );
  }

  if (currentScreen === 'settings') {
    return (
      <SafeAreaView style={styles.container}>
        <SettingsScreen onBack={() => setCurrentScreen('home')} />
      </SafeAreaView>
    );
  }

  if (currentScreen === 'shop') {
    return (
      <FadeTransition>
        <SafeAreaView style={styles.container}>
          <ShopScreen onBack={() => setCurrentScreen('home')} />
        </SafeAreaView>
      </FadeTransition>
    );
  }

  if (currentScreen === 'success') {
    return (
      <ScaleTransition>
        <SafeAreaView style={styles.container}>
          <SuccessScreen onBack={() => setCurrentScreen('shop')} />
        </SafeAreaView>
      </ScaleTransition>
    );
  }

  if (currentScreen === 'cancel') {
    return (
      <FadeTransition>
        <SafeAreaView style={styles.container}>
          <CancelScreen onBack={() => setCurrentScreen('shop')} />
        </SafeAreaView>
      </FadeTransition>
    );
  }

  return (
    <FadeTransition>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        
        {/* Header avec logo et titre */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <View style={styles.logoLine1} />
              <View style={styles.logoLine2} />
              <View style={styles.logoLine3} />
            </View>
          </View>
          <Text style={styles.title}>TypeVision</Text>
          
          {/* Sélecteur de langue */}
          <View style={styles.languageSelector}>
            <TouchableOpacity 
              style={[styles.flagButton, currentLanguage === 'fr' && styles.activeFlagButton]}
              onPress={() => changeLanguage('fr')}
            >
              <Text style={styles.flag}>🇫🇷</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.flagButton, currentLanguage === 'en' && styles.activeFlagButton]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={styles.flag}>🇬🇧</Text>
            </TouchableOpacity>
          </View>
          
          {currentUser && (
            <Text style={styles.welcomeText}>
              {t('welcome')}, {currentUser.username}
            </Text>
          )}
        </View>

        {/* Menu principal */}
        <View style={styles.menuContainer}>
          <AnimatedButton 
            style={styles.menuButton}
            onPress={() => setCurrentScreen('multiplayer')}
          >
            <Text style={styles.menuButtonText}>{t('multiplayer')}</Text>
          </AnimatedButton>

          <AnimatedButton
            style={styles.menuButton}
            onPress={() => setCurrentScreen('shop')}
          >
            <Text style={styles.menuButtonText}>{t('shop')}</Text>
          </AnimatedButton>

          <AnimatedButton 
            style={styles.menuButton}
            onPress={() => setCurrentScreen('settings')}
          >
            <Text style={styles.menuButtonText}>{t('settings')}</Text>
          </AnimatedButton>

          <AnimatedButton 
            style={[styles.menuButton, styles.profileButton]}
            onPress={() => setCurrentScreen('profile')}
          >
            <Text style={styles.menuButtonText}>{t('profile')}</Text>
          </AnimatedButton>
        </View>
      </SafeAreaView>
    </FadeTransition>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    minHeight: '100vh', // Safari fix
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
    WebkitBoxAlign: 'center', // Safari fix
  },
  logoContainer: {
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    WebkitBoxAlign: 'center', // Safari fix
    WebkitBoxPack: 'center', // Safari fix
  },
  logoLine1: {
    width: 40,
    height: 8,
    backgroundColor: theme.colors.text,
    borderRadius: 4,
    marginBottom: 4,
    WebkitBorderRadius: 4, // Safari fix
  },
  logoLine2: {
    width: 30,
    height: 8,
    backgroundColor: theme.colors.text,
    borderRadius: 4,
    marginBottom: 4,
    WebkitBorderRadius: 4, // Safari fix
  },
  logoLine3: {
    width: 20,
    height: 8,
    backgroundColor: theme.colors.text,
    borderRadius: 4,
    WebkitBorderRadius: 4, // Safari fix
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -1,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  languageSelector: {
    flexDirection: 'row',
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 10,
  },
  flagButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  activeFlagButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  flag: {
    fontSize: 24,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 60,
    justifyContent: 'center',
    WebkitBoxPack: 'center', // Safari fix
  },
  menuButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    WebkitBorderRadius: 25, // Safari fix
    WebkitBoxAlign: 'center', // Safari fix
    // Simplified shadow for Safari
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
    WebkitBoxShadow: `0 2px 8px ${theme.colors.shadow}`,
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileButton: {
    marginTop: 30,
  },
  menuButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
});
