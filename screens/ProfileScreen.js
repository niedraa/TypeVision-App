import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { SlideTransition } from '../components/Transitions';
import { AnimatedButton } from '../components/AnimatedButton';

const ProfileScreen = ({ onBack, user, onUpdateUser, onLogout }) => {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleEditProfile = () => {
    Alert.alert('Profil', 'Fonctionnalité d\'édition bientôt disponible');
  };

  const handleChangePassword = () => {
    Alert.alert('Mot de passe', 'Fonctionnalité de changement de mot de passe bientôt disponible');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès');
            onLogout();
          }
        }
      ]
    );
  };

  const statsData = [
    { label: 'Parties jouées', value: '42' },
    { label: 'Victoires', value: '28' },
    { label: 'Temps de jeu', value: '12h 34m' },
    { label: 'Score max', value: '9,850' },
  ];

  const achievementsData = [
    { name: 'Premier pas', description: 'Première partie terminée', unlocked: true, icon: '🎮' },
    { name: 'Survivant', description: '10 parties gagnées', unlocked: true, icon: '🏆' },
    { name: 'Expert', description: 'Score de plus de 5000', unlocked: true, icon: '⭐' },
    { name: 'Maître', description: '50 parties gagnées', unlocked: false, icon: '👑' },
    { name: 'Légende', description: 'Score de plus de 10000', unlocked: false, icon: '🔥' },
  ];

  return (
    <SlideTransition direction="right">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        
        {/* Bouton retour */}
        <AnimatedButton 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backArrow}>{'<'}</Text>
        </AnimatedButton>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Profile */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={styles.statusIndicator} />
            </View>
            <Text style={styles.username}>{user?.username || 'Utilisateur'}</Text>
            <Text style={styles.userType}>
              {user?.isGuest ? 'Compte Invité' : 'Compte Connecté'}
            </Text>
          </View>

          {/* Statistiques */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              {statsData.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Succès */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Succès</Text>
            <View style={styles.achievementsList}>
              {achievementsData.map((achievement, index) => (
                <View key={index} style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementLocked
                ]}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={[
                      styles.achievementName,
                      !achievement.unlocked && styles.achievementTextLocked
                    ]}>
                      {achievement.name}
                    </Text>
                    <Text style={[
                      styles.achievementDescription,
                      !achievement.unlocked && styles.achievementTextLocked
                    ]}>
                      {achievement.description}
                    </Text>
                  </View>
                  {achievement.unlocked && <Text style={styles.achievementBadge}>✓</Text>}
                </View>
              ))}
            </View>
          </View>

          {/* Paramètres */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paramètres</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#DDDDDD', true: '#4299E1' }}
                thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Sons</Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#DDDDDD', true: '#4299E1' }}
                thumbColor={soundEnabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Vibrations</Text>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: '#DDDDDD', true: '#4299E1' }}
                thumbColor={vibrationEnabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Actions du compte */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compte</Text>
            
            <AnimatedButton style={styles.actionButton} onPress={handleEditProfile}>
              <Text style={styles.actionButtonText}>Modifier le profil</Text>
            </AnimatedButton>

            {!user?.isGuest && (
              <AnimatedButton style={styles.actionButton} onPress={handleChangePassword}>
                <Text style={styles.actionButtonText}>Changer le mot de passe</Text>
              </AnimatedButton>
            )}

            <AnimatedButton style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </AnimatedButton>

            <AnimatedButton style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteButtonText}>Supprimer le compte</Text>
            </AnimatedButton>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>TypeVision v1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SlideTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 120,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4299E1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#48BB78',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 5,
  },
  userType: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4299E1',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  achievementsList: {
    gap: 10,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementLocked: {
    backgroundColor: '#F8F9FA',
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  achievementTextLocked: {
    color: '#BDC3C7',
  },
  achievementBadge: {
    fontSize: 20,
    color: '#48BB78',
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E53E3E',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#BDC3C7',
  },
});

export default ProfileScreen;
