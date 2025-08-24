// Service multijoueur en mode simulation pour tests
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameData } from '../data/gameData';

export class MockMultiplayerService {
  constructor() {
    this.currentRoomId = null;
    this.currentPlayerId = null;
    this.listeners = {};
    this.rooms = new Map(); // Stockage local des salles
    this.simulationMode = true;
    this.localStats = null; // Ajout pour les stats locales
  }

  // Générer un ID unique pour le joueur
  generatePlayerId() {
    if (!this.currentPlayerId) {
      this.currentPlayerId = Crypto.randomUUID();
    }
    return this.currentPlayerId;
  }

  // Ajouter cette méthode pour gérer les stats locales
  async getLocalStats() {
    try {
      if (!this.localStats) {
        // Charger depuis AsyncStorage ou créer des stats par défaut
        const stored = await AsyncStorage.getItem('localPlayerStats');
        this.localStats = stored ? JSON.parse(stored) : {
          gamesPlayed: 0,
          gamesWon: 0,
          totalWords: 0,
          bestWPM: 0,
          averageAccuracy: 0,
          totalTime: 0,
          lastPlayed: null
        };
      }
      return this.localStats;
    } catch (error) {
      console.error('❌ Erreur chargement stats locales:', error);
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        totalWords: 0,
        bestWPM: 0,
        averageAccuracy: 0,
        totalTime: 0,
        lastPlayed: null
      };
    }
  }

  // Mettre à jour les stats locales
  // Obtenir le nombre d'utilisateurs connectés (local)
  async getConnectedUsersCount() {
    return 1; // Toujours 1 en mode local
  }

  // Obtenir le nombre de parties en cours (local)
  async getActiveGamesCount() {
    return this.currentRoom ? 1 : 0;
  }

  // Obtenir des statistiques complètes du multijoueur
  async getMultiplayerStats() {
    return {
      connectedUsers: await this.getConnectedUsersCount(),
      activeGames: await this.getActiveGamesCount(),
      timestamp: Date.now()
    };
  }

  // Générer un texte de jeu aléatoire (même logique que le service global)
  generateGameText(difficulty = 'medium', textLength = 'medium') {
    try {
      // Collecter tous les textes disponibles
      const allTexts = [];
      
      // Parcourir tous les mondes et niveaux
      Object.values(gameData.worlds).forEach(world => {
        if (world.levels) {
          world.levels.forEach(level => {
            if (level.text) {
              allTexts.push({
                text: level.text,
                difficulty: level.difficulty,
                length: level.text.length
              });
            }
          });
        }
      });
      
      if (allTexts.length === 0) {
        return 'Le défi commence maintenant ! Tapez rapidement et précisément pour remporter la victoire dans cette course locale.';
      }
      
      // Filtrer par difficulté si possible
      let filteredTexts = allTexts;
      if (difficulty === 'easy') {
        filteredTexts = allTexts.filter(item => 
          item.difficulty === 'Facile' || item.length < 150
        );
      } else if (difficulty === 'hard') {
        filteredTexts = allTexts.filter(item => 
          item.difficulty === 'Difficile' || item.length > 200
        );
      }
      
      if (filteredTexts.length === 0) {
        filteredTexts = allTexts;
      }
      
      const randomIndex = Math.floor(Math.random() * filteredTexts.length);
      return filteredTexts[randomIndex].text;
      
    } catch (error) {
      console.error('❌ Erreur génération texte local:', error);
      return 'Bienvenue dans TypeVision ! Mode local - Montrez vos talents de frappe rapide et précise.';
    }
  }

  // Obtenir l'état du countdown pour les parties rapides (mock)
  async getCountdownStatus(roomId) {
    return null; // Pas de countdown automatique en mode local
  }

  // Démarrer le compte à rebours automatique pour les parties rapides (mock)
  async startQuickMatchCountdown(roomId) {
    console.log('ℹ️ Countdown automatique non disponible en mode local');
    return false;
  }

  // Observer les statistiques en temps réel (local)
  subscribeToStats(callback) {
    const updateStats = () => {
      callback({
        connectedUsers: 1,
        activeGames: this.currentRoom ? 1 : 0,
        timestamp: Date.now()
      });
    };
    
    // Mise à jour immédiate
    updateStats();
    
    // Mise à jour périodique
    const interval = setInterval(updateStats, 5000);
    
    // Retourner fonction de désinscription
    return () => clearInterval(interval);
  }

  // Obtenir les stats mondiales simulées
  async getGlobalStats() {
    try {
      // Simuler des stats mondiales
      const localStats = await this.getLocalStats();
      
      return {
        success: true,
        stats: {
          totalPlayers: 15000 + Math.floor(Math.random() * 1000),
          activeToday: 2500 + Math.floor(Math.random() * 500),
          averageWPM: 65 + Math.floor(Math.random() * 20),
          topWPM: 150 + Math.floor(Math.random() * 50),
          totalGames: 50000 + Math.floor(Math.random() * 10000),
          playerRank: Math.max(1, Math.floor(Math.random() * 10000)),
          playerStats: localStats
        }
      };
    } catch (error) {
      console.error('❌ Erreur stats mondiales:', error);
      return {
        success: false,
        error: 'Impossible de charger les stats mondiales'
      };
    }
  }

  // Générer un code de salle à 6 chiffres
  generateRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Créer une nouvelle salle de jeu (simulation)
  async createRoom(playerName, gameSettings = {}) {
    try {
      console.log('🎮 Création de salle en mode simulation...');
      
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const playerId = this.generatePlayerId();
      const roomId = Crypto.randomUUID();
      const roomCode = this.generateRoomCode();
      
      const roomData = {
        id: roomId,
        code: roomCode,
        host: playerId,
        status: 'waiting',
        createdAt: Date.now(),
        settings: {
          maxPlayers: gameSettings.maxPlayers || 4,
          gameMode: gameSettings.gameMode || 'race',
          difficulty: gameSettings.difficulty || 'medium',
          textLength: gameSettings.textLength || 'medium'
        },
        players: {
          [playerId]: {
            id: playerId,
            name: playerName,
            isReady: false,
            isHost: true,
            joinedAt: Date.now(),
            status: 'connected'
          }
        },
        gameState: {
          status: 'waiting',
          text: '',
          startTime: null,
          endTime: null
        }
      };

      // Stocker la salle localement
      this.rooms.set(roomId, roomData);
      this.currentRoomId = roomId;

      console.log('✅ Salle créée avec succès:', roomCode);

      return {
        success: true,
        roomId,
        roomCode,
        playerId,
        roomData: roomData
      };

    } catch (error) {
      console.error('❌ Erreur création salle:', error);
      return {
        success: false,
        error: 'Impossible de créer la salle'
      };
    }
  }

  // Rejoindre une salle existante (simulation)
  async joinRoom(roomCode, playerName) {
    try {
      console.log('🔍 Recherche de salle:', roomCode);
      
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Chercher la salle par code
      let targetRoom = null;
      for (let room of this.rooms.values()) {
        if (room.code === roomCode) {
          targetRoom = room;
          break;
        }
      }

      if (!targetRoom) {
        return {
          success: false,
          error: 'Salle introuvable'
        };
      }

      if (targetRoom.status !== 'waiting') {
        return {
          success: false,
          error: 'La partie a déjà commencé'
        };
      }

      const playerCount = Object.keys(targetRoom.players).length;
      if (playerCount >= targetRoom.settings.maxPlayers) {
        return {
          success: false,
          error: 'Salle complète'
        };
      }

      const playerId = this.generatePlayerId();
      
      // Ajouter le joueur à la salle
      targetRoom.players[playerId] = {
        id: playerId,
        name: playerName,
        isReady: false,
        isHost: false,
        joinedAt: Date.now(),
        status: 'connected'
      };

      this.currentRoomId = targetRoom.id;

      console.log('✅ Salle rejointe avec succès');

      return {
        success: true,
        roomId: targetRoom.id,
        roomCode: targetRoom.code,
        playerId,
        roomData: targetRoom
      };

    } catch (error) {
      console.error('❌ Erreur rejoindre salle:', error);
      return {
        success: false,
        error: 'Impossible de rejoindre la salle'
      };
    }
  }

  // Partie rapide (simulation)
  async findQuickMatch(playerName, difficulty = 'medium') {
    try {
      console.log('⚡ Recherche partie rapide...');
      
      // Simulation d'un délai de matchmaking
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simuler la recherche d'une salle existante
      let availableRoom = null;
      for (let room of this.rooms.values()) {
        if (room.status === 'waiting' && 
            room.settings.difficulty === difficulty &&
            Object.keys(room.players).length < room.settings.maxPlayers) {
          availableRoom = room;
          break;
        }
      }

      if (availableRoom) {
        // Rejoindre une salle existante
        return await this.joinRoom(availableRoom.code, playerName);
      } else {
        // Créer une nouvelle salle
        console.log('🆕 Aucune salle trouvée, création automatique...');
        return await this.createRoom(playerName, {
          maxPlayers: 4,
          gameMode: 'race',
          difficulty: difficulty
        });
      }

    } catch (error) {
      console.error('❌ Erreur partie rapide:', error);
      return {
        success: false,
        error: 'Impossible de trouver une partie'
      };
    }
  }

  // Mettre à jour l'état "prêt" d'un joueur
  async setPlayerReady(roomId, playerId, isReady) {
    try {
      const room = this.rooms.get(roomId);
      if (!room || !room.players[playerId]) {
        return { success: false, error: 'Joueur non trouvé' };
      }

      room.players[playerId].isReady = isReady;
      
      console.log(`✅ Joueur ${isReady ? 'prêt' : 'pas prêt'}`);
      
      return { success: true, roomData: room };
    } catch (error) {
      return { success: false, error: 'Erreur mise à jour' };
    }
  }

  // Démarrer la partie
  async startGame(roomId, gameText) {
    try {
      const room = this.rooms.get(roomId);
      if (!room) {
        return { success: false, error: 'Salle non trouvée' };
      }

      room.status = 'playing';
      room.gameState.status = 'countdown';
      room.gameState.text = gameText || 'Texte de démonstration pour tester le multijoueur en temps réel.';
      room.gameState.startTime = Date.now() + 3000; // 3 secondes de countdown

      console.log('🚀 Partie démarrée !');

      return { success: true, roomData: room };
    } catch (error) {
      return { success: false, error: 'Erreur démarrage partie' };
    }
  }

  // Simuler des listeners pour les mises à jour temps réel
  addRoomListener(roomId, callback) {
    console.log('👂 Listener ajouté pour la salle');
    
    // Simuler des mises à jour périodiques
    const interval = setInterval(() => {
      const room = this.rooms.get(roomId);
      if (room) {
        callback(room);
      }
    }, 2000);

    this.listeners[roomId] = interval;
  }

  removeRoomListener(roomId) {
    if (this.listeners[roomId]) {
      clearInterval(this.listeners[roomId]);
      delete this.listeners[roomId];
      console.log('🔇 Listener supprimé');
    }
  }

  // Quitter la salle
  async leaveRoom(roomId, playerId) {
    try {
      const room = this.rooms.get(roomId);
      if (room && room.players[playerId]) {
        delete room.players[playerId];
        
        // Si plus de joueurs, supprimer la salle
        if (Object.keys(room.players).length === 0) {
          this.rooms.delete(roomId);
        }
      }
      
      this.currentRoomId = null;
      this.removeRoomListener(roomId);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur quitter salle' };
    }
  }

  // Nettoyage (pas nécessaire en simulation)
  async cleanupRooms() {
    console.log('🧹 Nettoyage des salles expirées...');
    
    try {
      const now = Date.now();
      const ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes
      
      for (let [roomId, room] of this.rooms.entries()) {
        // Supprimer les salles inactives
        if (now - room.createdAt > ROOM_TIMEOUT) {
          this.rooms.delete(roomId);
          console.log(`🗑️ Salle ${room.code} supprimée (expirée)`);
        }
        
        // Supprimer les salles vides
        if (Object.keys(room.players).length === 0) {
          this.rooms.delete(roomId);
          console.log(`🗑️ Salle ${room.code} supprimée (vide)`);
        }
      }
      
      console.log(`✅ Nettoyage terminé. ${this.rooms.size} salles actives`);
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  }
}

// Instance unique du service
export const mockMultiplayerService = new MockMultiplayerService();
export default mockMultiplayerService;
