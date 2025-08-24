import React, { useState } from 'react';
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
} from 'react-native';
import { AnimatedButton } from '../components/AnimatedButton';
import { SlideTransition } from '../components/Transitions';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SettingsScreen({ onBack }) {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    notificationsEnabled: true,
    autoSaveEnabled: true,
    darkModeEnabled: false,
    highContrastEnabled: false,
    showTipsEnabled: true,
    analyticsEnabled: true,
  });

  const toggleSetting = (settingKey) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));
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
          onPress: () => {
            Alert.alert("Progrès réinitialisés", "Tous vos progrès ont été supprimés.");
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
          onPress: () => {
            Alert.alert("Compte supprimé", "Votre compte a été supprimé avec succès.");
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, hasSwitch, switchValue, onToggle, onPress, textColor, showArrow = false }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
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
          <Ionicons name="chevron-forward" size={20} color="#999" />
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
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres</Text>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Section Audio & Visuel */}
          <SectionHeader title="Audio & Visuel" />
          <View style={styles.section}>
            <SettingItem
              icon={<Ionicons name="volume-high" size={24} color="#333" />}
              title="Sons"
              subtitle="Activer les effets sonores"
              hasSwitch
              switchValue={settings.soundEnabled}
              onToggle={() => toggleSetting('soundEnabled')}
            />
            <SettingItem
              icon={<MaterialIcons name="vibration" size={24} color="#333" />}
              title="Vibrations"
              subtitle="Retour haptique"
              hasSwitch
              switchValue={settings.vibrationEnabled}
              onToggle={() => toggleSetting('vibrationEnabled')}
            />
            <SettingItem
              icon={<Ionicons name="moon" size={24} color="#333" />}
              title="Mode sombre"
              subtitle="Interface en mode sombre"
              hasSwitch
              switchValue={settings.darkModeEnabled}
              onToggle={() => toggleSetting('darkModeEnabled')}
            />
            <SettingItem
              icon={<MaterialIcons name="contrast" size={24} color="#333" />}
              title="Contraste élevé"
              subtitle="Améliore la lisibilité"
              hasSwitch
              switchValue={settings.highContrastEnabled}
              onToggle={() => toggleSetting('highContrastEnabled')}
            />
          </View>

          {/* Section Notifications */}
          <SectionHeader title="Notifications" />
          <View style={styles.section}>
            <SettingItem
              icon={<Ionicons name="notifications" size={24} color="#333" />}
              title="Notifications push"
              subtitle="Recevoir des notifications"
              hasSwitch
              switchValue={settings.notificationsEnabled}
              onToggle={() => toggleSetting('notificationsEnabled')}
            />
            <SettingItem
              icon={<MaterialIcons name="tips-and-updates" size={24} color="#333" />}
              title="Conseils et astuces"
              subtitle="Afficher des conseils utiles"
              hasSwitch
              switchValue={settings.showTipsEnabled}
              onToggle={() => toggleSetting('showTipsEnabled')}
            />
          </View>

          {/* Section Jeu */}
          <SectionHeader title="Jeu" />
          <View style={styles.section}>
            <SettingItem
              icon={<Ionicons name="save" size={24} color="#333" />}
              title="Sauvegarde automatique"
              subtitle="Sauvegarder automatiquement les progrès"
              hasSwitch
              switchValue={settings.autoSaveEnabled}
              onToggle={() => toggleSetting('autoSaveEnabled')}
            />
            <SettingItem
              icon={<MaterialIcons name="trending-up" size={24} color="#333" />}
              title="Statistiques de difficulté"
              subtitle="Ajuster automatiquement la difficulté"
              onPress={() => Alert.alert('Fonctionnalité', 'Bientôt disponible')}
              showArrow
            />
          </View>

          {/* Section Confidentialité */}
          <SectionHeader title="Confidentialité & Données" />
          <View style={styles.section}>
            <SettingItem
              icon={<MaterialIcons name="analytics" size={24} color="#333" />}
              title="Données d'usage"
              subtitle="Partager les statistiques anonymes"
              hasSwitch
              switchValue={settings.analyticsEnabled}
              onToggle={() => toggleSetting('analyticsEnabled')}
            />
            <SettingItem
              icon={<MaterialIcons name="privacy-tip" size={24} color="#333" />}
              title="Politique de confidentialité"
              subtitle="Consulter notre politique"
              onPress={() => Alert.alert('Politique', 'Ouverture de la politique de confidentialité')}
              showArrow
            />
            <SettingItem
              icon={<MaterialIcons name="description" size={24} color="#333" />}
              title="Conditions d'utilisation"
              subtitle="Consulter les conditions"
              onPress={() => Alert.alert('Conditions', 'Ouverture des conditions d\'utilisation')}
              showArrow
            />
          </View>

          {/* Section Support */}
          <SectionHeader title="Support" />
          <View style={styles.section}>
            <SettingItem
              icon={<MaterialIcons name="help" size={24} color="#333" />}
              title="Centre d'aide"
              subtitle="FAQ et guide d'utilisation"
              onPress={() => Alert.alert('Aide', 'Ouverture du centre d\'aide')}
              showArrow
            />
            <SettingItem
              icon={<MaterialIcons name="feedback" size={24} color="#333" />}
              title="Signaler un problème"
              subtitle="Nous faire part d'un bug"
              onPress={() => Alert.alert('Feedback', 'Ouverture du formulaire de signalement')}
              showArrow
            />
            <SettingItem
              icon={<MaterialIcons name="star-rate" size={24} color="#333" />}
              title="Noter l'application"
              subtitle="Donnez votre avis sur l'App Store"
              onPress={() => Alert.alert('Note', 'Redirection vers l\'App Store')}
              showArrow
            />
          </View>

          {/* Section Compte */}
          <SectionHeader title="Compte" />
          <View style={styles.section}>
            <SettingItem
              icon={<MaterialIcons name="backup" size={24} color="#333" />}
              title="Sauvegarder les données"
              subtitle="Exporter vos progrès"
              onPress={() => Alert.alert('Sauvegarde', 'Sauvegarde des données en cours...')}
              showArrow
            />
            <SettingItem
              icon={<MaterialIcons name="restore" size={24} color="#333" />}
              title="Restaurer les données"
              subtitle="Importer une sauvegarde"
              onPress={() => Alert.alert('Restauration', 'Sélectionner un fichier de sauvegarde')}
              showArrow
            />
          </View>

          {/* Section Actions dangereuses */}
          <SectionHeader title="Actions" />
          <View style={styles.section}>
            <SettingItem
              icon={<MaterialIcons name="refresh" size={24} color="#FF9800" />}
              title="Réinitialiser les progrès"
              subtitle="Supprimer tous les progrès"
              textColor="#FF9800"
              onPress={handleResetProgress}
              showArrow
            />
            <SettingItem
              icon={<MaterialIcons name="delete-forever" size={24} color="#F44336" />}
              title="Supprimer le compte"
              subtitle="Suppression définitive"
              textColor="#F44336"
              onPress={handleDeleteAccount}
              showArrow
            />
          </View>

          {/* Informations sur l'application */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>TypeVision v1.0.0</Text>
            <Text style={styles.appInfoSubtext}>Développé avec ❤️ par Matthieu</Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </SlideTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
    marginLeft: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 30,
    marginBottom: 15,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
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
    borderBottomColor: '#f5f5f5',
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
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#666',
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
    color: '#333',
    marginBottom: 5,
  },
  appInfoSubtext: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpacer: {
    height: 40,
  },
});
