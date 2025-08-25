import AsyncStorage from '@react-native-async-storage/async-storage';

class UserDataService {
  // Clés pour AsyncStorage
  static KEYS = {
    PROFILE_IMAGE: 'profileImage_',
    USER_SETTINGS: 'userSettings_',
    USER_STATS: 'userStats_'
  };

  // Sauvegarder la photo de profil
  static async saveProfileImage(userId, imageUri) {
    try {
      if (!userId || !imageUri) return false;
      
      await AsyncStorage.setItem(
        `${this.KEYS.PROFILE_IMAGE}${userId}`, 
        imageUri
      );
      console.log('✅ Photo de profil sauvegardée pour:', userId);
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde photo de profil:', error);
      return false;
    }
  }

  // Charger la photo de profil
  static async loadProfileImage(userId) {
    try {
      if (!userId) return null;
      
      const imageUri = await AsyncStorage.getItem(
        `${this.KEYS.PROFILE_IMAGE}${userId}`
      );
      
      if (imageUri) {
        console.log('✅ Photo de profil chargée pour:', userId);
      }
      
      return imageUri;
    } catch (error) {
      console.error('❌ Erreur chargement photo de profil:', error);
      return null;
    }
  }

  // Supprimer la photo de profil
  static async removeProfileImage(userId) {
    try {
      if (!userId) return false;
      
      await AsyncStorage.removeItem(
        `${this.KEYS.PROFILE_IMAGE}${userId}`
      );
      console.log('🗑️ Photo de profil supprimée pour:', userId);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression photo de profil:', error);
      return false;
    }
  }

  // Sauvegarder les paramètres utilisateur
  static async saveUserSettings(userId, settings) {
    try {
      if (!userId || !settings) return false;
      
      await AsyncStorage.setItem(
        `${this.KEYS.USER_SETTINGS}${userId}`, 
        JSON.stringify(settings)
      );
      console.log('⚙️ Paramètres sauvegardés pour:', userId);
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde paramètres:', error);
      return false;
    }
  }

  // Charger les paramètres utilisateur
  static async loadUserSettings(userId) {
    try {
      if (!userId) return null;
      
      const settings = await AsyncStorage.getItem(
        `${this.KEYS.USER_SETTINGS}${userId}`
      );
      
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('❌ Erreur chargement paramètres:', error);
      return null;
    }
  }

  // Nettoyer toutes les données d'un utilisateur
  static async clearUserData(userId) {
    try {
      if (!userId) return false;
      
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => key.includes(userId));
      
      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
        console.log(`🧹 ${userKeys.length} données supprimées pour:`, userId);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur nettoyage données utilisateur:', error);
      return false;
    }
  }

  // Migrer les données vers un nouvel utilisateur (si nécessaire)
  static async migrateUserData(oldUserId, newUserId) {
    try {
      if (!oldUserId || !newUserId) return false;
      
      // Charger toutes les données de l'ancien utilisateur
      const profileImage = await this.loadProfileImage(oldUserId);
      const settings = await this.loadUserSettings(oldUserId);
      
      // Sauvegarder pour le nouvel utilisateur
      if (profileImage) {
        await this.saveProfileImage(newUserId, profileImage);
      }
      
      if (settings) {
        await this.saveUserSettings(newUserId, settings);
      }
      
      // Supprimer les anciennes données
      await this.clearUserData(oldUserId);
      
      console.log('🔄 Migration réussie de', oldUserId, 'vers', newUserId);
      return true;
    } catch (error) {
      console.error('❌ Erreur migration données:', error);
      return false;
    }
  }
}

export default UserDataService;
