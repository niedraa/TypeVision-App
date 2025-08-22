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
  Keyboard
} from 'react-native';
import { AnimatedButton } from '../components/AnimatedButton';
import { createGuestUser, createRegisteredUser } from '../utils/userUtils';

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    setIsLoading(true);
    
    // Simulation d'une connexion (remplace par ta vraie logique d'auth)
    setTimeout(() => {
      setIsLoading(false);
      
      // Créer un utilisateur connecté
      const user = createRegisteredUser(email, email.split('@')[0]);
      onLogin(user); // Passer l'utilisateur à l'app principale
    }, 1500);
  };

  const handleGuestLogin = () => {
    // Créer un utilisateur invité avec pseudo aléatoire
    const guestUser = createGuestUser();
    Alert.alert(
      'Connexion en tant qu\'invité',
      `Bienvenue ${guestUser.username} !`,
      [
        {
          text: 'Continuer',
          onPress: () => onLogin(guestUser)
        }
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo et titre */}
            <View style={styles.header}>
              <View style={styles.logo}>
                <View style={styles.logoLine1} />
                <View style={styles.logoLine2} />
                <View style={styles.logoLine3} />
              </View>
              <Text style={styles.title}>TypeVision</Text>
              <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
            </View>

            {/* Formulaire de connexion */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  placeholderTextColor="#666666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#666666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Bouton de connexion */}
              <AnimatedButton
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Text>
              </AnimatedButton>

              {/* Liens */}
              <View style={styles.linksContainer}>
                <AnimatedButton onPress={() => Alert.alert('Info', 'Fonctionnalité bientôt disponible')}>
                  <Text style={styles.linkText}>Mot de passe oublié ?</Text>
                </AnimatedButton>
              </View>

              {/* Séparateur */}
              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>ou</Text>
                <View style={styles.separatorLine} />
              </View>

              {/* Bouton invité */}
              <AnimatedButton
                style={styles.guestButton}
                onPress={handleGuestLogin}
              >
                <Text style={styles.guestButtonText}>Continuer en tant qu'invité</Text>
              </AnimatedButton>

              {/* Inscription */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Pas encore de compte ? </Text>
                <AnimatedButton onPress={() => Alert.alert('Info', 'Fonctionnalité bientôt disponible')}>
                  <Text style={styles.signupLink}>S'inscrire</Text>
                </AnimatedButton>
              </View>
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
    backgroundColor: '#1a1a1a',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoLine1: {
    width: 40,
    height: 6,
    backgroundColor: '#4299E1',
    marginBottom: 3,
    borderRadius: 3,
  },
  logoLine2: {
    width: 32,
    height: 6,
    backgroundColor: '#48BB78',
    marginBottom: 3,
    borderRadius: 3,
  },
  logoLine3: {
    width: 24,
    height: 6,
    backgroundColor: '#ED8936',
    borderRadius: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  loginButton: {
    height: 50,
    backgroundColor: '#4299E1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#666666',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  linksContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  linkText: {
    fontSize: 14,
    color: '#4299E1',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3a3a3a',
  },
  separatorText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginHorizontal: 15,
  },
  guestButton: {
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    marginBottom: 30,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CCCCCC',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  signupLink: {
    fontSize: 14,
    color: '#4299E1',
    fontWeight: '500',
  },
});

export default LoginScreen;
