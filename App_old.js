import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, StatusBar, TouchableOpacity, Platform } from 'react-native';
import ShopScreen from './ShopScreen';
import StoryScreen from './screens/StoryScreen';
import MultiplayerScreen from './screens/MultiplayerScreen';
import SettingsScreen from './screens/SettingsScreen';
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
  const [currentUser] = useState({ username: 'Joueur', id: 'user123' }); // Utilisateur par défaut

  useEffect(() => {
    // Simuler un temps de chargement initial
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 secondes de chargement

    return () => clearTimeout(loadingTimer);
  }, []);

  // Écran de chargement
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (currentScreen === 'profile') {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileScreen 
          onBack={() => setCurrentScreen('home')}
          user={currentUser}
          onUpdateUser={(user) => {}} // Fonction vide
          onLogout={() => setCurrentScreen('home')} // Retour à l'accueil au lieu de logout
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
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>⚡</Text>
            </View>
          </View>
          
          <Text style={styles.title}>TypeVision</Text>
          <Text style={styles.subtitle}>Tapez à la vitesse de l'éclair</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>WPM Max</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>99%</Text>
              <Text style={styles.statLabel}>Précision</Text>
            </View>
          </View>
        </View>

        {/* Main Action */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => setCurrentScreen('multiplayer')}
            activeOpacity={0.8}
          >
            <Text style={styles.playButtonText}>🚀 Prêt à jouer</Text>
            <Text style={styles.playButtonSubtext}>Rejoindre une partie rapide</Text>
          </TouchableOpacity>
          
          <Text style={styles.orText}>ou</Text>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setCurrentScreen('story')}
            >
              <Text style={styles.secondaryButtonText}>📖 Mode Histoire</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setCurrentScreen('settings')}
            >
              <Text style={styles.secondaryButtonText}>⚙️ Paramètres</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Testez vos compétences contre des joueurs du monde entier
          </Text>
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
  menuButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
});
