import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from './firebase';
import { ref, set, get, update, onValue, off } from 'firebase/database';

class UserStatsService {
  // Clés pour AsyncStorage
  static KEYS = {
    USER_STATS: 'userStats_',
    ACHIEVEMENTS: 'achievements_',
    SETTINGS: 'settings_'
  };

  // Structure par défaut des statistiques
  static DEFAULT_STATS = {
    gamesPlayed: 0,
    gamesWon: 0,
    totalPlayTime: 0, // en secondes
    highScore: 0,
    averageWPM: 0,
    totalWordsTyped: 0,
    longestStreak: 0,
    multiplayerWins: 0,
    multiplayerGames: 0,
    lastPlayed: null,
    level: 1,
    experience: 0
  };

  // Succès par défaut
  static DEFAULT_ACHIEVEMENTS = {
    firstGame: { unlocked: false, unlockedAt: null },
    tenGames: { unlocked: false, unlockedAt: null },
    hundredGames: { unlocked: false, unlockedAt: null },
    firstWin: { unlocked: false, unlockedAt: null },
    tenWins: { unlocked: false, unlockedAt: null },
    fiftyWins: { unlocked: false, unlockedAt: null },
    speedDemon: { unlocked: false, unlockedAt: null }, // 60+ WPM
    master: { unlocked: false, unlockedAt: null }, // 80+ WPM
    legend: { unlocked: false, unlockedAt: null }, // 100+ WPM
    highScore5k: { unlocked: false, unlockedAt: null },
    highScore10k: { unlocked: false, unlockedAt: null },
    multiplayerChamp: { unlocked: false, unlockedAt: null }
  };

  // Paramètres par défaut
  static DEFAULT_SETTINGS = {
    notifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    theme: 'auto', // 'light', 'dark', 'auto'
    difficulty: 'medium',
    language: 'fr'
  };

  // Charger les statistiques utilisateur
  static async loadUserStats(userId) {
    try {
      console.log('📊 Chargement stats pour:', userId);
      
      if (!userId) {
        console.log('⚠️ Pas d\'ID utilisateur');
        return this.DEFAULT_STATS;
      }

      // Essayer Firebase d'abord (si utilisateur connecté)
      if (!userId.startsWith('guest_')) {
        try {
          const statsRef = ref(database, `userStats/${userId}`);
          const snapshot = await get(statsRef);
          
          if (snapshot.exists()) {
            const firebaseStats = snapshot.val();
            console.log('✅ Stats Firebase chargées:', firebaseStats);
            
            // Sauvegarder en local pour cache
            await this.saveStatsLocally(userId, firebaseStats);
            return { ...this.DEFAULT_STATS, ...firebaseStats };
          }
        } catch (error) {
          console.log('⚠️ Erreur Firebase, fallback local:', error.message);
        }
      }

      // Fallback local
      const localStats = await AsyncStorage.getItem(`${this.KEYS.USER_STATS}${userId}`);
      if (localStats) {
        const parsedStats = JSON.parse(localStats);
        console.log('✅ Stats locales chargées:', parsedStats);
        return { ...this.DEFAULT_STATS, ...parsedStats };
      }

      console.log('📊 Nouvelles stats par défaut créées');
      return this.DEFAULT_STATS;
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
      return this.DEFAULT_STATS;
    }
  }

  // Sauvegarder les statistiques
  static async saveUserStats(userId, stats) {
    try {
      if (!userId) return false;

      console.log('💾 Sauvegarde stats pour:', userId, stats);

      // Sauvegarder localement
      await this.saveStatsLocally(userId, stats);

      // Sauvegarder sur Firebase (si pas invité)
      if (!userId.startsWith('guest_')) {
        try {
          const statsRef = ref(database, `userStats/${userId}`);
          await set(statsRef, {
            ...stats,
            lastUpdated: Date.now()
          });
          console.log('✅ Stats Firebase sauvegardées');
        } catch (error) {
          console.log('⚠️ Erreur sauvegarde Firebase:', error.message);
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde stats:', error);
      return false;
    }
  }

  // Sauvegarder localement
  static async saveStatsLocally(userId, stats) {
    try {
      await AsyncStorage.setItem(
        `${this.KEYS.USER_STATS}${userId}`,
        JSON.stringify(stats)
      );
      console.log('💾 Stats locales sauvegardées');
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale:', error);
      return false;
    }
  }

  // Mettre à jour après une partie
  static async updateGameStats(userId, gameResult) {
    try {
      const currentStats = await this.loadUserStats(userId);
      
      const updatedStats = {
        ...currentStats,
        gamesPlayed: currentStats.gamesPlayed + 1,
        gamesWon: gameResult.won ? currentStats.gamesWon + 1 : currentStats.gamesWon,
        totalPlayTime: currentStats.totalPlayTime + (gameResult.playTime || 0),
        highScore: Math.max(currentStats.highScore, gameResult.score || 0),
        totalWordsTyped: currentStats.totalWordsTyped + (gameResult.wordsTyped || 0),
        lastPlayed: Date.now()
      };

      // Calculer WPM moyen
      if (updatedStats.totalPlayTime > 0) {
        updatedStats.averageWPM = Math.round(
          (updatedStats.totalWordsTyped / (updatedStats.totalPlayTime / 60))
        );
      }

      // Mettre à jour experience et niveau
      updatedStats.experience = currentStats.experience + (gameResult.experience || 0);
      updatedStats.level = Math.floor(updatedStats.experience / 1000) + 1;

      // Multijoueur
      if (gameResult.isMultiplayer) {
        updatedStats.multiplayerGames = currentStats.multiplayerGames + 1;
        if (gameResult.won) {
          updatedStats.multiplayerWins = currentStats.multiplayerWins + 1;
        }
      }

      await this.saveUserStats(userId, updatedStats);
      
      // Vérifier les succès
      await this.checkAchievements(userId, updatedStats, gameResult);
      
      return updatedStats;
    } catch (error) {
      console.error('❌ Erreur mise à jour stats jeu:', error);
      return null;
    }
  }

  // Charger les succès
  static async loadAchievements(userId) {
    try {
      if (!userId) return this.DEFAULT_ACHIEVEMENTS;

      // Essayer Firebase d'abord
      if (!userId.startsWith('guest_')) {
        try {
          const achievementsRef = ref(database, `achievements/${userId}`);
          const snapshot = await get(achievementsRef);
          
          if (snapshot.exists()) {
            return { ...this.DEFAULT_ACHIEVEMENTS, ...snapshot.val() };
          }
        } catch (error) {
          console.log('⚠️ Erreur Firebase achievements, fallback local');
        }
      }

      // Fallback local
      const local = await AsyncStorage.getItem(`${this.KEYS.ACHIEVEMENTS}${userId}`);
      if (local) {
        return { ...this.DEFAULT_ACHIEVEMENTS, ...JSON.parse(local) };
      }

      return this.DEFAULT_ACHIEVEMENTS;
    } catch (error) {
      console.error('❌ Erreur chargement achievements:', error);
      return this.DEFAULT_ACHIEVEMENTS;
    }
  }

  // Vérifier et débloquer les succès
  static async checkAchievements(userId, stats, gameResult) {
    try {
      const achievements = await this.loadAchievements(userId);
      let newAchievements = { ...achievements };
      let hasNewAchievement = false;

      // Première partie
      if (!achievements.firstGame.unlocked && stats.gamesPlayed >= 1) {
        newAchievements.firstGame = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // 10 parties
      if (!achievements.tenGames.unlocked && stats.gamesPlayed >= 10) {
        newAchievements.tenGames = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // 100 parties
      if (!achievements.hundredGames.unlocked && stats.gamesPlayed >= 100) {
        newAchievements.hundredGames = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // Première victoire
      if (!achievements.firstWin.unlocked && stats.gamesWon >= 1) {
        newAchievements.firstWin = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // 10 victoires
      if (!achievements.tenWins.unlocked && stats.gamesWon >= 10) {
        newAchievements.tenWins = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // 50 victoires
      if (!achievements.fiftyWins.unlocked && stats.gamesWon >= 50) {
        newAchievements.fiftyWins = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // Vitesse démon (60+ WPM)
      if (!achievements.speedDemon.unlocked && (gameResult.wpm >= 60 || stats.averageWPM >= 60)) {
        newAchievements.speedDemon = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // Maître (80+ WPM)
      if (!achievements.master.unlocked && (gameResult.wpm >= 80 || stats.averageWPM >= 80)) {
        newAchievements.master = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // Légende (100+ WPM)
      if (!achievements.legend.unlocked && (gameResult.wpm >= 100 || stats.averageWPM >= 100)) {
        newAchievements.legend = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // Score élevé 5k
      if (!achievements.highScore5k.unlocked && stats.highScore >= 5000) {
        newAchievements.highScore5k = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // Score élevé 10k
      if (!achievements.highScore10k.unlocked && stats.highScore >= 10000) {
        newAchievements.highScore10k = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      // Champion multijoueur
      if (!achievements.multiplayerChamp.unlocked && stats.multiplayerWins >= 25) {
        newAchievements.multiplayerChamp = { unlocked: true, unlockedAt: Date.now() };
        hasNewAchievement = true;
      }

      if (hasNewAchievement) {
        await this.saveAchievements(userId, newAchievements);
        console.log('🏆 Nouveaux succès débloqués!');
      }

      return newAchievements;
    } catch (error) {
      console.error('❌ Erreur vérification achievements:', error);
      return achievements;
    }
  }

  // Sauvegarder les succès
  static async saveAchievements(userId, achievements) {
    try {
      // Local
      await AsyncStorage.setItem(
        `${this.KEYS.ACHIEVEMENTS}${userId}`,
        JSON.stringify(achievements)
      );

      // Firebase
      if (!userId.startsWith('guest_')) {
        try {
          const achievementsRef = ref(database, `achievements/${userId}`);
          await set(achievementsRef, achievements);
        } catch (error) {
          console.log('⚠️ Erreur sauvegarde Firebase achievements');
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde achievements:', error);
      return false;
    }
  }

  // Charger les paramètres
  static async loadSettings(userId) {
    try {
      if (!userId) return this.DEFAULT_SETTINGS;

      const local = await AsyncStorage.getItem(`${this.KEYS.SETTINGS}${userId}`);
      if (local) {
        return { ...this.DEFAULT_SETTINGS, ...JSON.parse(local) };
      }

      return this.DEFAULT_SETTINGS;
    } catch (error) {
      console.error('❌ Erreur chargement settings:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  // Sauvegarder les paramètres
  static async saveSettings(userId, settings) {
    try {
      await AsyncStorage.setItem(
        `${this.KEYS.SETTINGS}${userId}`,
        JSON.stringify(settings)
      );
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde settings:', error);
      return false;
    }
  }

  // Formater le temps de jeu
  static formatPlayTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // Calculer le niveau d'expérience
  static getLevelInfo(experience) {
    const level = Math.floor(experience / 1000) + 1;
    const currentLevelExp = experience % 1000;
    const nextLevelExp = 1000;
    const progress = currentLevelExp / nextLevelExp;
    
    return {
      level,
      currentExp: currentLevelExp,
      nextLevelExp,
      progress: Math.round(progress * 100)
    };
  }
}

export default UserStatsService;
