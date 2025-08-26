import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Vibration,
  Linking,
} from 'react-native';
import { AnimatedButton } from '../components/AnimatedButton';
import { SlideTransition } from '../components/Transitions';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import musicService from '../services/MusicService';
import { withClickSound } from '../utils/useClickSound';

export default function SettingsScreen({ onBack }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true,
    darkModeEnabled: isDark,
    highContrastEnabled: false,
    notificationsEnabled: true,
  });

  // Styles dynamiques basés sur le thème
  const styles = createStyles(theme);

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, []);

  // Synchroniser avec le contexte de thème
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkModeEnabled: isDark
    }));
  }, [isDark]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Erreur lors du chargement des paramètres:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.log('Erreur lors de la sauvegarde des paramètres:', error);
    }
  };

  const toggleSetting = (settingKey) => {
    const newSettings = {
      ...settings,
      [settingKey]: !settings[settingKey]
    };
    
    setSettings(newSettings);
    saveSettings(newSettings);

    // Actions spécifiques selon le paramètre
    if (settingKey === 'vibrationEnabled' && newSettings.vibrationEnabled) {
      // Test de vibration quand on active
      Vibration.vibrate(100);
    }

    if (settingKey === 'soundEnabled') {
      // Ici on pourrait jouer un son de test
      Alert.alert('Sons', newSettings.soundEnabled ? 'Sons activés' : 'Sons désactivés');
    }

    if (settingKey === 'musicEnabled') {
      // Contrôler la musique de fond
      if (newSettings.musicEnabled) {
        musicService.playMusic();
        Alert.alert('🎵 Musique', 'Musique de fond activée');
      } else {
        musicService.pauseMusic();
        Alert.alert('🎵 Musique', 'Musique de fond désactivée');
      }
    }

    if (settingKey === 'darkModeEnabled') {
      // Basculer le thème immédiatement
      toggleTheme();
      Alert.alert('Mode sombre', newSettings.darkModeEnabled ? 'Mode sombre activé' : 'Mode clair activé');
    }

    if (settingKey === 'notificationsEnabled') {
      Alert.alert('Notifications', newSettings.notificationsEnabled ? 'Notifications activées' : 'Notifications désactivées');
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Réinitialiser les progrès",
      "Êtes-vous sûr de vouloir réinitialiser tous vos progrès ? Cette action est irréversible.",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Réinitialiser",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userProgress');
              await AsyncStorage.removeItem('gameStats');
              Alert.alert("Succès", "Tous vos progrès ont été réinitialisés.");
            } catch (error) {
              Alert.alert("Erreur", "Impossible de réinitialiser les progrès.");
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer le compte",
      "Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Compte supprimé", "Votre compte et toutes vos données ont été supprimés.");
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer le compte.");
            }
          }
        }
      ]
    );
  };

  const openHelp = () => {
    Alert.alert(
      "Centre d'aide",
      "Besoin d'aide ? Voici les options disponibles :",
      [
        {
          text: "FAQ",
          onPress: () => Alert.alert("FAQ", "Questions fréquemment posées :\n\n• Comment jouer en multijoueur ?\n• Comment améliorer ma vitesse ?\n• Comment changer mes paramètres ?")
        },
        {
          text: "Contact",
          onPress: () => Alert.alert("Contact", "Contactez-nous à : support@typevision.app")
        },
        {
          text: "Fermer",
          style: "cancel"
        }
      ]
    );
  };

  const reportProblem = () => {
    Alert.alert(
      "Signaler un problème",
      "Décrivez le problème rencontré :",
      [
        {
          text: "Bug technique",
          onPress: () => Alert.alert("Merci", "Votre signalement de bug a été envoyé à l'équipe technique.")
        },
        {
          text: "Problème de connexion",
          onPress: () => Alert.alert("Merci", "Votre signalement de problème de connexion a été envoyé.")
        },
        {
          text: "Autre",
          onPress: () => Alert.alert("Contact", "Envoyez-nous un email à : bugs@typevision.app")
        },
        {
          text: "Annuler",
          style: "cancel"
        }
      ]
    );
  };

  const rateApp = () => {
    Alert.alert(
      "Noter l'application",
      "Merci de noter TypeVision !",
      [
        {
          text: "⭐⭐⭐⭐⭐ 5 étoiles",
          onPress: () => Alert.alert("Merci !", "Merci pour votre excellente note !")
        },
        {
          text: "⭐⭐⭐⭐ 4 étoiles",
          onPress: () => Alert.alert("Merci !", "Merci pour votre note ! Comment pouvons-nous améliorer ?")
        },
        {
          text: "Plus tard",
          style: "cancel"
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, hasSwitch, switchValue, onToggle, onPress, textColor, showArrow = false }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress ? withClickSound(onPress) : undefined}
      disabled={hasSwitch}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, textColor && { color: textColor }]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onToggle}
            trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
            thumbColor={switchValue ? '#ffffff' : '#ffffff'}
          />
        ) : showArrow ? (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SlideTransition>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={theme.statusBar} backgroundColor={theme.colors.background} />
        
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={withClickSound(onBack)}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings')}</Text>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Section Audio & Visuel */}
          <SectionHeader title={t('audio_visual')} />
          <View style={styles.section}>
            <SettingItem
              icon={<Ionicons name="volume-high" size={24} color={theme.colors.text} />}
              title={t('sounds')}
              subtitle={t('sound_effects')}
              hasSwitch
              switchValue={settings.soundEnabled}
              onToggle={() => toggleSetting('soundEnabled')}
            />
            <SettingItem
              icon={<Ionicons name="musical-notes" size={24} color={theme.colors.text} />}
              title="Musique de fond"
              subtitle="Musique d'ambiance du jeu"
              hasSwitch
              switchValue={settings.musicEnabled}
              onToggle={() => toggleSetting('musicEnabled')}
            />
            <SettingItem
              icon={<MaterialIcons name="vibration" size={24} color={theme.colors.text} />}
              title={t('vibrations')}
              subtitle={t('haptic_feedback')}
              hasSwitch
              switchValue={settings.vibrationEnabled}
              onToggle={() => toggleSetting('vibrationEnabled')}
            />
            <SettingItem
              icon={<Ionicons name="moon" size={24} color={theme.colors.text} />}
              title={t('dark_mode')}
              subtitle={t('dark_interface')}
              hasSwitch
              switchValue={settings.darkModeEnabled}
              onToggle={() => toggleSetting('darkModeEnabled')}
            />
            <SettingItem
              icon={<MaterialIcons name="contrast" size={24} color={theme.colors.text} />}
              title={t('high_contrast')}
              subtitle={t('improve_readability')}
              hasSwitch
              switchValue={settings.highContrastEnabled}
              onToggle={() => toggleSetting('highContrastEnabled')}
            />
          </View>

          {/* Section Notifications */}
          <SectionHeader title={t('notifications')} />
          <View style={styles.section}>
            <SettingItem
              icon={<Ionicons name="notifications" size={24} color={theme.colors.text} />}
              title={t('push_notifications')}
              subtitle={t('receive_notifications')}
              hasSwitch
              switchValue={settings.notificationsEnabled}
              onToggle={() => toggleSetting('notificationsEnabled')}
            />
          </View>

          {/* Section Support */}
          <SectionHeader title={t('support')} />
          <View style={styles.section}>
            <SettingItem
              icon={<MaterialIcons name="help" size={24} color={theme.colors.text} />}
              title={t('help')}
              subtitle={t('help_desc')}
              onPress={openHelp}
              showArrow
            />
            <SettingItem
              icon={<MaterialIcons name="feedback" size={24} color={theme.colors.text} />}
              title={t('report_bug')}
              subtitle={t('report_bug_desc')}
              onPress={reportProblem}
              showArrow
            />
            <SettingItem
              icon={<MaterialIcons name="star-rate" size={24} color={theme.colors.text} />}
              title={t('rate_app')}
              subtitle={t('rate_app_desc')}
              onPress={rateApp}
              showArrow
            />
          </View>

          {/* Section Actions */}
          <SectionHeader title={t('account_section')} />
          <View style={styles.section}>
            <SettingItem
              icon={<MaterialIcons name="refresh" size={24} color={theme.colors.warning} />}
              title={t('reset_progress')}
              subtitle={t('reset_progress_desc')}
              textColor={theme.colors.warning}
              onPress={handleResetProgress}
              showArrow
            />
            <SettingItem
              icon={<MaterialIcons name="delete-forever" size={24} color="#F44336" />}
              title={t('delete_account')}
              subtitle={t('delete_account_desc')}
              textColor="#F44336"
              onPress={handleDeleteAccount}
              showArrow
            />
          </View>

          {/* Informations sur l'application */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>TypeVision v1.0.0</Text>
            <Text style={styles.appInfoSubtext}>Développé avec ❤️</Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </SlideTransition>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 30,
    marginBottom: 15,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  settingRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
  },
  appInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 5,
  },
  appInfoSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  bottomSpacer: {
    height: 40,
  },
});
