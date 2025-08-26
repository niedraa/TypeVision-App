import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { AnimatedButton } from '../components/AnimatedButton';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import AuthService from '../services/AuthService';
import { SlideTransition } from '../components/Transitions';

const EmailVerificationScreen = ({ user, onVerified, onBack }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const styles = createStyles(theme);

  // Vérifier automatiquement la vérification toutes les 3 secondes
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      try {
        setChecking(true);
        const result = await AuthService.checkEmailVerification();
        if (result.verified) {
          clearInterval(checkInterval);
          onVerified();
        }
      } catch (error) {
        console.log('Erreur vérification auto:', error);
      } finally {
        setChecking(false);
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [onVerified]);

  // Cooldown pour le renvoi d'email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleDiagnostic = async () => {
    console.log('🔧 Diagnostic email configuration...');
    setLoading(true);
    
    try {
      const diagnostic = await AuthService.checkEmailConfiguration();
      setDiagnosticInfo(diagnostic);
      
      if (diagnostic.configured) {
        Alert.alert(
          '✅ Configuration OK',
          'La configuration email Firebase semble correcte. Le problème peut être temporaire ou lié à votre fournisseur email.'
        );
      } else {
        let message = diagnostic.error || 'Configuration manquante';
        if (diagnostic.instructions) {
          message += '\n\nInstructions:\n' + diagnostic.instructions.join('\n');
        }
        
        Alert.alert(
          '⚠️ Problème de configuration',
          message
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Erreur diagnostic',
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      const result = await AuthService.resendEmailVerification();
      
      if (result.alreadyVerified) {
        Alert.alert(
          t('emailAlreadyVerified') || 'Email déjà vérifié',
          t('emailAlreadyVerifiedMessage') || 'Votre email a été vérifié avec succès !'
        );
        onVerified();
      } else {
        Alert.alert(
          t('emailSent') || 'Email envoyé',
          t('emailSentMessage') || 'Un nouvel email de vérification a été envoyé. Vérifiez votre boîte de réception et votre dossier spam.'
        );
        setResendCooldown(120); // 2 minutes de cooldown pour éviter les rate limits
      }
    } catch (error) {
      console.error('Erreur resend email:', error);
      
      let errorMessage = error.message;
      let cooldownTime = 60;
      
      if (error.message.includes('too-many-requests') || error.message.includes('Trop de tentatives')) {
        errorMessage = 'Trop de tentatives d\'envoi. Attendez 5 minutes avant de réessayer.';
        cooldownTime = 300; // 5 minutes
      } else if (error.message.includes('network-request-failed') || error.message.includes('connexion')) {
        errorMessage = 'Problème de connexion. Vérifiez votre internet et réessayez dans quelques minutes.';
        cooldownTime = 120; // 2 minutes
      }
      
      Alert.alert(
        t('error') || 'Erreur',
        errorMessage
      );
      
      setResendCooldown(cooldownTime);
    }
    setLoading(false);
  };

  const handleCheckManually = async () => {
    setChecking(true);
    try {
      const result = await AuthService.checkEmailVerification();
      if (result.verified) {
        onVerified();
      } else {
        Alert.alert(
          t('emailNotVerified') || 'Email non vérifié',
          t('emailNotVerifiedMessage') || 'Votre email n\'est pas encore vérifié. Vérifiez votre boîte mail et cliquez sur le lien de vérification.'
        );
      }
    } catch (error) {
      Alert.alert(
        t('error') || 'Erreur',
        t('verificationCheckError') || 'Erreur lors de la vérification'
      );
    }
    setChecking(false);
  };

  return (
    <SlideTransition>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={theme.name === 'dark' ? 'light-content' : 'dark-content'} />
        
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>📧</Text>
            <Text style={styles.title}>
              {t('verifyEmail') || 'Vérifiez votre email'}
            </Text>
            <Text style={styles.subtitle}>
              {t('verifyEmailMessage') || 'Un email de vérification a été envoyé à'}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>
              {t('whatToDo') || 'Que faire maintenant ?'}
            </Text>
            
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                {t('checkInbox') || 'Vérifiez votre boîte de réception'}
              </Text>
            </View>
            
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                {t('clickVerificationLink') || 'Cliquez sur le lien de vérification'}
              </Text>
            </View>
            
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                {t('returnToApp') || 'Revenez dans l\'application'}
              </Text>
            </View>
          </View>

          {/* Status indicator */}
          {checking && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.statusText}>
                {t('checkingVerification') || 'Vérification en cours...'}
              </Text>
            </View>
          )}

          {/* Spam folder warning */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              {t('checkSpamFolder') || '💡 N\'oubliez pas de vérifier votre dossier spam/courrier indésirable'}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <AnimatedButton
              style={styles.primaryButton}
              onPress={handleCheckManually}
              disabled={checking}
            >
              <Text style={styles.primaryButtonText}>
                {checking 
                  ? (t('checking') || 'Vérification...') 
                  : (t('checkVerification') || 'Vérifier maintenant')
                }
              </Text>
            </AnimatedButton>

            <AnimatedButton
              style={[
                styles.secondaryButton,
                (loading || resendCooldown > 0) && styles.disabledButton
              ]}
              onPress={handleResendEmail}
              disabled={loading || resendCooldown > 0}
            >
              <Text style={[
                styles.secondaryButtonText,
                (loading || resendCooldown > 0) && styles.disabledButtonText
              ]}>
                {loading 
                  ? (t('sending') || 'Envoi...') 
                  : resendCooldown > 0 
                    ? `${t('resendIn') || 'Renvoyer dans'} ${resendCooldown}s`
                    : (t('resendEmail') || 'Renvoyer l\'email')
                }
              </Text>
            </AnimatedButton>

            <AnimatedButton
              style={[styles.diagnosticButton, { opacity: loading ? 0.5 : 1 }]}
              onPress={handleDiagnostic}
              disabled={loading}
            >
              <Text style={styles.diagnosticButtonText}>
                {loading ? 'Diagnostic...' : '🔧 Diagnostic email'}
              </Text>
            </AnimatedButton>

            <AnimatedButton
              style={styles.backButton}
              onPress={onBack}
            >
              <Text style={styles.backButtonText}>
                {t('back') || 'Retour'}
              </Text>
            </AnimatedButton>
          </View>
        </View>
      </SafeAreaView>
    </SlideTransition>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: theme.colors.primary,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 25,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  warningContainer: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 15,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    borderColor: theme.colors.textSecondary,
  },
  disabledButtonText: {
    color: theme.colors.textSecondary,
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
});

export default EmailVerificationScreen;
