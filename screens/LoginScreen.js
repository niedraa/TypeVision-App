import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createGuestUser, createRegisteredUser } from '../utils/userUtils';
import AuthService from '../services/AuthService';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('guest'); // 'guest', 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // true pour créer un compte, false pour se connecter
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const cardSlideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Animations d'entrée
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const guestUser = createGuestUser();
      setIsLoading(false);
      onLogin(guestUser);
    }, 1500);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      let emailUser;
      if (isSignUp) {
        // Créer un nouveau compte
        emailUser = await AuthService.createEmailAccount(email, password);
        console.log('✅ Compte créé avec succès:', emailUser);
        Alert.alert('Compte créé', 'Votre compte a été créé avec succès !');
      } else {
        // Se connecter avec un compte existant
        emailUser = await AuthService.signInWithEmail(email, password);
        console.log('✅ Connexion réussie:', emailUser);
      }
      onLogin(emailUser);
    } catch (error) {
      console.log('❌ Erreur authentification email:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Logo Header */}
          <Animated.View 
            style={[
              styles.logoSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: logoScaleAnim }]
              }
            ]}
          >
            <View style={styles.logoIcon}>
              <View style={styles.logo}>
                <View style={styles.logoLine1} />
                <View style={styles.logoLine2} />
                <View style={styles.logoLine3} />
              </View>
            </View>
            <Text style={styles.logoText}>TypeVision</Text>
            <Text style={styles.logoSubtext}>
              Bienvenue dans l'univers de la frappe rapide
            </Text>
          </Animated.View>

          {/* Carte de connexion */}
          <Animated.View 
            style={[
              styles.loginCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: cardSlideAnim }]
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Commencer à jouer</Text>
              <Text style={styles.cardSubtitle}>
                Découvrez TypeVision et améliorez votre vitesse de frappe
              </Text>
            </View>

            {/* Mode Invité */}
            {authMode === 'guest' && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleGuestLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={styles.loadingSpinner} />
                      <Text style={styles.buttonText}>Connexion...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="play-circle-outline" size={24} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Jouer maintenant</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Mode Email */}
            {authMode === 'email' && (
              <View style={styles.formContainer}>
                <View style={styles.authToggle}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !isSignUp && styles.toggleButtonActive]}
                    onPress={() => setIsSignUp(false)}
                  >
                    <Text style={[styles.toggleButtonText, !isSignUp && styles.toggleButtonTextActive]}>
                      Se connecter
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, isSignUp && styles.toggleButtonActive]}
                    onPress={() => setIsSignUp(true)}
                  >
                    <Text style={[styles.toggleButtonText, isSignUp && styles.toggleButtonTextActive]}>
                      Créer un compte
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="Adresse email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder={isSignUp ? "Mot de passe (min. 6 caractères)" : "Mot de passe"}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleEmailAuth}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={styles.loadingSpinner} />
                      <Text style={styles.buttonText}>
                        {isSignUp ? 'Création...' : 'Connexion...'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons 
                        name={isSignUp ? "person-add-outline" : "mail-outline"} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.buttonText}>
                        {isSignUp ? 'Créer le compte' : 'Se connecter'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Sélecteur de mode d'authentification */}
            <View style={styles.authModeSelector}>
              <TouchableOpacity 
                style={[styles.modeButton, authMode === 'guest' && styles.modeButtonActive]}
                onPress={() => setAuthMode('guest')}
              >
                <Ionicons name="person-outline" size={20} color={authMode === 'guest' ? '#FFFFFF' : '#2C3E50'} />
                <Text style={[styles.modeButtonText, authMode === 'guest' && styles.modeButtonTextActive]}>Invité</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modeButton, authMode === 'email' && styles.modeButtonActive]}
                onPress={() => setAuthMode('email')}
              >
                <Ionicons name="mail-outline" size={20} color={authMode === 'email' ? '#FFFFFF' : '#2C3E50'} />
                <Text style={[styles.modeButtonText, authMode === 'email' && styles.modeButtonTextActive]}>Compte</Text>
              </TouchableOpacity>
            </View>

            {/* Informations supplémentaires */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                {authMode === 'guest' && '• Accès complet aux modes de jeu\n• Sauvegarde locale des scores\n• Aucune inscription requise'}
                {authMode === 'email' && isSignUp && '• Synchronisation cloud des scores\n• Profil personnalisé\n• Accès depuis tous vos appareils'}
                {authMode === 'email' && !isSignUp && '• Récupération de votre profil\n• Synchronisation de vos scores\n• Historique des parties'}
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLine1: {
    width: 45,
    height: 9,
    backgroundColor: '#2C3E50',
    borderRadius: 4.5,
    marginBottom: 4,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  logoLine2: {
    width: 35,
    height: 9,
    backgroundColor: '#2C3E50',
    borderRadius: 4.5,
    marginBottom: 4,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  logoLine3: {
    width: 25,
    height: 9,
    backgroundColor: '#2C3E50',
    borderRadius: 4.5,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  verificationText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2C3E50',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '600',
  },
  authModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#2C3E50',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 6,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 2,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#2C3E50',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default LoginScreen;
