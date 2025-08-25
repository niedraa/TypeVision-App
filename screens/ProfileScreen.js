import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  Alert,
  Switch,
  Image,
  TouchableOpacity,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { SlideTransition } from '../components/Transitions';
import { AnimatedButton } from '../components/AnimatedButton';
import { useTheme } from '../contexts/ThemeContext';
import UserDataService from '../services/UserDataService';
import UserStatsService from '../services/UserStatsService';

const ProfileScreen = ({ onBack, user, onUpdateUser, onLogout }) => {
  const { theme } = useTheme();
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  
  // États pour les vraies données
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Styles dynamiques basés sur le thème
  const styles = createStyles(theme);

  // Charger toutes les données utilisateur au démarrage
  useEffect(() => {
    console.log('🔄 useEffect ProfileScreen - User ID:', user?.id);
    if (user?.id) {
      loadAllUserData();
    }
  }, [user?.id]);

  const loadAllUserData = async () => {
    try {
      setLoading(true);
      console.log('📊 Chargement données complètes pour:', user?.id);

      // Charger en parallèle
      const [profileImg, stats, achievementsData, userSettings] = await Promise.all([
        UserDataService.loadProfileImage(user.id),
        UserStatsService.loadUserStats(user.id),
        UserStatsService.loadAchievements(user.id),
        UserStatsService.loadSettings(user.id)
      ]);

      // Mettre à jour les états
      if (profileImg) {
        setProfileImage(profileImg);
        if (onUpdateUser) {
          onUpdateUser({ ...user, profileImage: profileImg });
        }
      }

      setUserStats(stats);
      setSettings(userSettings);

      // Convertir les achievements en format pour l'affichage
      const achievementsList = convertAchievementsToList(achievementsData);
      setAchievements(achievementsList);

      console.log('✅ Données chargées:', { stats, achievementsList, userSettings });
    } catch (error) {
      console.error('❌ Erreur chargement données utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertAchievementsToList = (achievementsData) => {
    const achievementDefinitions = [
      { key: 'firstGame', name: 'Premier pas', description: 'Première partie terminée', icon: '🎮' },
      { key: 'tenGames', name: 'Débutant', description: '10 parties jouées', icon: '🎯' },
      { key: 'hundredGames', name: 'Vétéran', description: '100 parties jouées', icon: '🎖️' },
      { key: 'firstWin', name: 'Première victoire', description: 'Première partie gagnée', icon: '🏆' },
      { key: 'tenWins', name: 'Survivant', description: '10 parties gagnées', icon: '⭐' },
      { key: 'fiftyWins', name: 'Champion', description: '50 parties gagnées', icon: '👑' },
      { key: 'speedDemon', name: 'Vitesse démon', description: '60+ mots par minute', icon: '⚡' },
      { key: 'master', name: 'Maître', description: '80+ mots par minute', icon: '🔥' },
      { key: 'legend', name: 'Légende', description: '100+ mots par minute', icon: '💫' },
      { key: 'highScore5k', name: 'Expert', description: 'Score de plus de 5000', icon: '💎' },
      { key: 'highScore10k', name: 'Virtuose', description: 'Score de plus de 10000', icon: '🌟' },
      { key: 'multiplayerChamp', name: 'Champion multijoueur', description: '25 victoires en ligne', icon: '🏅' }
    ];

    return achievementDefinitions.map(def => ({
      ...def,
      unlocked: achievementsData[def.key]?.unlocked || false,
      unlockedAt: achievementsData[def.key]?.unlockedAt
    }));
  };

  const loadProfileImage = async () => {
    if (!user?.id) {
      console.log('⚠️ Pas d\'ID utilisateur pour charger la photo');
      return;
    }
    
    try {
      console.log('📷 Chargement photo pour utilisateur:', user.id);
      const savedImage = await UserDataService.loadProfileImage(user.id);
      console.log('📷 Photo trouvée:', savedImage ? 'Oui' : 'Non');
      
      if (savedImage) {
        setProfileImage(savedImage);
        // Mettre à jour l'utilisateur avec l'image sauvegardée
        if (onUpdateUser) {
          onUpdateUser({ ...user, profileImage: savedImage });
          console.log('👤 Utilisateur mis à jour avec photo chargée');
        }
      }
    } catch (error) {
      console.log('❌ Erreur lors du chargement de la photo de profil:', error);
    }
  };

  const updateUserSettings = async (newSettings) => {
    try {
      const updated = await UserStatsService.saveSettings(user?.id, newSettings);
      if (updated) {
        setSettings(newSettings);
        console.log('⚙️ Paramètres mis à jour:', newSettings);
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour paramètres:', error);
    }
  };

  const handleEditProfile = () => {
    Alert.alert('Profil', 'Fonctionnalité d\'édition bientôt disponible');
  };

  const handleChangePassword = () => {
    Alert.alert('Mot de passe', 'Fonctionnalité de changement de mot de passe bientôt disponible');
  };

  const pickImage = async () => {
    console.log('📷 Début sélection image...');
    console.log('📷 User actuel:', user?.id, user?.username);
    
    try {
      // Demander les permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📷 Permission statut:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Nous avons besoin de l\'accès à votre galerie pour changer votre photo de profil.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Options pour le picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('📷 Résultat picker:', {
        canceled: result.canceled,
        assetsCount: result.assets?.length,
        firstAsset: result.assets?.[0]?.uri
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('📷 Image sélectionnée:', imageUri);
        
        // Mettre à jour l'état local immédiatement
        setProfileImage(imageUri);
        console.log('📷 État local mis à jour');
        
        // Sauvegarder localement avec le service
        if (user?.id) {
          const saved = await UserDataService.saveProfileImage(user.id, imageUri);
          console.log('💾 Sauvegarde réussie:', saved);
          
          if (!saved) {
            console.warn('⚠️ Échec de la sauvegarde, tentative directe AsyncStorage...');
            // Fallback direct
            try {
              await AsyncStorage.setItem(`profileImage_${user.id}`, imageUri);
              console.log('💾 Sauvegarde directe réussie');
            } catch (error) {
              console.error('❌ Échec sauvegarde directe:', error);
            }
          }
        } else {
          console.warn('⚠️ Pas d\'ID utilisateur pour sauvegarder');
        }
        
        // Mettre à jour le profil utilisateur
        if (onUpdateUser) {
          const updatedUser = { ...user, profileImage: imageUri };
          onUpdateUser(updatedUser);
          console.log('👤 Utilisateur mis à jour:', updatedUser);
        } else {
          console.warn('⚠️ onUpdateUser non disponible');
        }
        
        Alert.alert('Succès', 'Photo de profil mise à jour et sauvegardée !');
      } else {
        console.log('📷 Sélection annulée ou pas d\'assets');
      }
    } catch (error) {
      console.error('❌ Erreur dans pickImage:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image : ' + error.message);
    }
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

  // Fonction pour formater les nombres
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Données dynamiques basées sur les vraies stats
  const getStatsData = () => {
    if (!userStats) return [];
    
    return [
      { label: 'Parties jouées', value: formatNumber(userStats.gamesPlayed) },
      { label: 'Victoires', value: formatNumber(userStats.gamesWon) },
      { label: 'Temps de jeu', value: UserStatsService.formatPlayTime(userStats.totalPlayTime) },
      { label: 'Score max', value: formatNumber(userStats.highScore) },
      { label: 'WPM moyen', value: userStats.averageWPM },
      { label: 'Niveau', value: UserStatsService.getLevelInfo(userStats.experience).level },
    ];
  };

  if (loading) {
    return (
      <SlideTransition direction="right">
        <SafeAreaView style={styles.container}>
          <StatusBar 
            barStyle={theme.dark ? "light-content" : "dark-content"} 
            backgroundColor={theme.colors.background} 
          />
          
          {/* Bouton retour */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement du profil...</Text>
          </View>
        </SafeAreaView>
      </SlideTransition>
    );
  }

  const statsData = getStatsData();

  return (
    <SlideTransition direction="right">
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle={theme.dark ? "light-content" : "dark-content"} 
          backgroundColor={theme.colors.background} 
        />
        
        {/* Bouton retour */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Profile */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.statusIndicator} />
              <View style={styles.editPhotoButton}>
                <Text style={styles.editPhotoIcon}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.username}>{user?.username || 'Utilisateur'}</Text>
            <Text style={styles.userType}>
              {user?.isGuest ? 'Compte Invité' : 'Compte Connecté'}
            </Text>
            <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
              <Text style={styles.changePhotoText}>Changer la photo</Text>
            </TouchableOpacity>
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
              {achievements.map((achievement, index) => (
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
                    {achievement.unlocked && achievement.unlockedAt && (
                      <Text style={styles.achievementDate}>
                        Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </Text>
                    )}
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
                value={settings?.notifications ?? true}
                onValueChange={(value) => updateUserSettings({ ...settings, notifications: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings?.notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Sons</Text>
              <Switch
                value={settings?.soundEnabled ?? true}
                onValueChange={(value) => updateUserSettings({ ...settings, soundEnabled: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings?.soundEnabled ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Vibrations</Text>
              <Switch
                value={settings?.vibrationEnabled ?? true}
                onValueChange={(value) => updateUserSettings({ ...settings, vibrationEnabled: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings?.vibrationEnabled ? '#FFFFFF' : '#FFFFFF'}
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

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  backArrow: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
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
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: theme.colors.shadow,
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
    borderColor: theme.colors.background,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  editPhotoIcon: {
    fontSize: 14,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 5,
  },
  userType: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 10,
  },
  changePhotoButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  changePhotoText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  achievementsList: {
    gap: 10,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 15,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementLocked: {
    backgroundColor: theme.colors.surfaceDisabled || theme.colors.surface,
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
    color: theme.colors.text,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  achievementDate: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  achievementTextLocked: {
    color: theme.colors.textDisabled || theme.colors.textSecondary,
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
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    color: theme.colors.text,
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
    color: theme.colors.textSecondary,
  },
});

export default ProfileScreen;
