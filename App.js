import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, StatusBar, TouchableOpacity, Platform } from 'react-native';
import ShopScreen from './ShopScreen';
import StoryScreen from './screens/StoryScreen';
import MultiplayerScreen from './screens/MultiplayerScreen';
import ProfileScreen from './screens/ProfileScreen';
import SuccessScreen from './SuccessScreen';
import CancelScreen from './CancelScreen';
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import { FadeTransition, ScaleTransition } from './components/Transitions';
import { AnimatedButton } from './components/AnimatedButton';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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

  if (currentScreen === 'story') {
    return (
      <SafeAreaView style={styles.container}>
        <StoryScreen onBack={() => setCurrentScreen('home')} />
      </SafeAreaView>
    );
  }

  if (currentScreen === 'multiplayer') {
    return (
      <SafeAreaView style={styles.container}>
        <MultiplayerScreen onBack={() => setCurrentScreen('home')} />
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
          {currentUser && (
            <Text style={styles.welcomeText}>
              Bienvenue, {currentUser.username}
            </Text>
          )}
        </View>

        {/* Menu principal */}
        <View style={styles.menuContainer}>
          <AnimatedButton
            style={styles.menuButton}
            onPress={() => setCurrentScreen('story')}
          >
            <Text style={styles.menuButtonText}>Story Mode</Text>
          </AnimatedButton>

          <AnimatedButton 
            style={styles.menuButton}
            onPress={() => setCurrentScreen('multiplayer')}
          >
            <Text style={styles.menuButtonText}>Multiplayer</Text>
          </AnimatedButton>

          <AnimatedButton
            style={styles.menuButton}
            onPress={() => setCurrentScreen('shop')}
          >
            <Text style={styles.menuButtonText}>Shop</Text>
          </AnimatedButton>

          <AnimatedButton style={styles.menuButton}>
            <Text style={styles.menuButtonText}>Settings</Text>
          </AnimatedButton>

          <AnimatedButton 
            style={[styles.menuButton, styles.profileButton]}
            onPress={() => setCurrentScreen('profile')}
          >
            <Text style={styles.menuButtonText}>Profile</Text>
          </AnimatedButton>

          <AnimatedButton 
            style={[styles.menuButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </AnimatedButton>
        </View>
      </SafeAreaView>
    </FadeTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    minHeight: '100vh', // Safari fix
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    WebkitBoxAlign: 'center', // Safari fix
  },
  logoContainer: {
    marginBottom: 20,
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
    backgroundColor: '#2C3E50',
    borderRadius: 4,
    marginBottom: 4,
    WebkitBorderRadius: 4, // Safari fix
  },
  logoLine2: {
    width: 30,
    height: 8,
    backgroundColor: '#2C3E50',
    borderRadius: 4,
    marginBottom: 4,
    WebkitBorderRadius: 4, // Safari fix
  },
  logoLine3: {
    width: 20,
    height: 8,
    backgroundColor: '#2C3E50',
    borderRadius: 4,
    WebkitBorderRadius: 4, // Safari fix
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#2C3E50',
    letterSpacing: -1,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 20,
    justifyContent: 'center',
    WebkitBoxPack: 'center', // Safari fix
  },
  menuButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    WebkitBorderRadius: 25, // Safari fix
    WebkitBoxAlign: 'center', // Safari fix
    // Simplified shadow for Safari
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    WebkitBoxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
  },
  profileButton: {
    marginTop: 30,
  },
  logoutButton: {
    backgroundColor: '#E53E3E',
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  menuButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
});
