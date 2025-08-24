import { database } from './firebase';
import { 
  ref, 
  push, 
  set, 
  onValue, 
  off, 
  update, 
  remove,
  serverTimestamp,
  child,
  get
} from 'firebase/database';
import * as Crypto from 'expo-crypto';

export class MultiplayerService {
  constructor() {
    this.currentRoomId = null;
    this.currentPlayerId = null;
    this.listeners = {};
  }

  // Générer un ID unique pour le joueur
  generatePlayerId() {
    if (!this.currentPlayerId) {
      this.currentPlayerId = Crypto.randomUUID();
    }
    return this.currentPlayerId;
  }

  // Créer une nouvelle salle de jeu
  async createRoom(playerName, gameSettings = {}) {
    try {
      const playerId = this.generatePlayerId();
      const roomsRef = ref(database, 'rooms');
      const newRoomRef = push(roomsRef);
      const roomId = newRoomRef.key;
      
      // Code de salle à 6 chiffres
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const roomData = {
        id: roomId,
        code: roomCode,
        host: playerId,
        status: 'waiting', // waiting, playing, finished
        createdAt: serverTimestamp(),
        settings: {
          maxPlayers: gameSettings.maxPlayers || 4,
          gameMode: gameSettings.gameMode || 'race',
          textId: gameSettings.textId || 'default',
          difficulty: gameSettings.difficulty || 'medium',
          ...gameSettings
        },
        players: {
          [playerId]: {
            id: playerId,
            name: playerName,
            isHost: true,
            joinedAt: serverTimestamp(),
            ready: false,
            progress: 0,
            wpm: 0,
            accuracy: 100,
            finished: false,
            finishTime: null,
            position: null
          }
        },
        gameState: {
          startTime: null,
          endTime: null,
          currentText: null,
          results: {}
        }
      };

      await set(newRoomRef, roomData);
      this.currentRoomId = roomId;
      
      return {
        roomId,
        roomCode,
        success: true
      };
    } catch (error) {
      console.error('Erreur création salle:', error);
      return { success: false, error: error.message };
    }
  }

  // Rejoindre une salle existante
  async joinRoom(roomCode, playerName) {
    try {
      const playerId = this.generatePlayerId();
      const roomsRef = ref(database, 'rooms');
      
      // Rechercher la salle par code
      const snapshot = await get(roomsRef);
      let targetRoomId = null;
      
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        for (const [roomId, roomData] of Object.entries(rooms)) {
          if (roomData.code === roomCode && roomData.status === 'waiting') {
            targetRoomId = roomId;
            break;
          }
        }
      }

      if (!targetRoomId) {
        return { success: false, error: 'Salle non trouvée ou fermée' };
      }

      // Vérifier si la salle n'est pas pleine
      const roomRef = ref(database, `rooms/${targetRoomId}`);
      const roomSnapshot = await get(roomRef);
      const roomData = roomSnapshot.val();
      
      const currentPlayers = Object.keys(roomData.players || {}).length;
      if (currentPlayers >= roomData.settings.maxPlayers) {
        return { success: false, error: 'Salle pleine' };
      }

      // Ajouter le joueur à la salle
      const playerData = {
        id: playerId,
        name: playerName,
        isHost: false,
        joinedAt: serverTimestamp(),
        ready: false,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        finishTime: null,
        position: null
      };

      await update(ref(database, `rooms/${targetRoomId}/players/${playerId}`), playerData);
      this.currentRoomId = targetRoomId;

      return {
        roomId: targetRoomId,
        roomCode,
        success: true
      };
    } catch (error) {
      console.error('Erreur rejoindre salle:', error);
      return { success: false, error: error.message };
    }
  }

  // Marquer un joueur comme prêt
  async setPlayerReady(ready = true) {
    if (!this.currentRoomId || !this.currentPlayerId) return false;
    
    try {
      await update(ref(database, `rooms/${this.currentRoomId}/players/${this.currentPlayerId}`), {
        ready
      });
      return true;
    } catch (error) {
      console.error('Erreur set ready:', error);
      return false;
    }
  }

  // Démarrer la partie (host seulement)
  async startGame(textData) {
    if (!this.currentRoomId) return false;
    
    try {
      const updates = {
        [`rooms/${this.currentRoomId}/status`]: 'playing',
        [`rooms/${this.currentRoomId}/gameState/startTime`]: serverTimestamp(),
        [`rooms/${this.currentRoomId}/gameState/currentText`]: textData
      };
      
      await update(ref(database), updates);
      return true;
    } catch (error) {
      console.error('Erreur démarrage jeu:', error);
      return false;
    }
  }

  // Mettre à jour le progrès du joueur
  async updatePlayerProgress(progress, wpm, accuracy) {
    if (!this.currentRoomId || !this.currentPlayerId) return false;
    
    try {
      await update(ref(database, `rooms/${this.currentRoomId}/players/${this.currentPlayerId}`), {
        progress,
        wpm,
        accuracy,
        lastUpdate: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur update progress:', error);
      return false;
    }
  }

  // Marquer le joueur comme terminé
  async finishGame(finalStats) {
    if (!this.currentRoomId || !this.currentPlayerId) return false;
    
    try {
      await update(ref(database, `rooms/${this.currentRoomId}/players/${this.currentPlayerId}`), {
        finished: true,
        finishTime: serverTimestamp(),
        finalWpm: finalStats.wpm,
        finalAccuracy: finalStats.accuracy,
        finalProgress: 100
      });
      return true;
    } catch (error) {
      console.error('Erreur finish game:', error);
      return false;
    }
  }

  // Écouter les changements de la salle
  onRoomUpdate(callback) {
    if (!this.currentRoomId) return null;
    
    const roomRef = ref(database, `rooms/${this.currentRoomId}`);
    const listener = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
    
    this.listeners.room = listener;
    return () => {
      off(roomRef, 'value', listener);
      delete this.listeners.room;
    };
  }

  // Écouter les changements des joueurs
  onPlayersUpdate(callback) {
    if (!this.currentRoomId) return null;
    
    const playersRef = ref(database, `rooms/${this.currentRoomId}/players`);
    const listener = onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
    
    this.listeners.players = listener;
    return () => {
      off(playersRef, 'value', listener);
      delete this.listeners.players;
    };
  }

  // Quitter la salle
  async leaveRoom() {
    if (!this.currentRoomId || !this.currentPlayerId) return false;
    
    try {
      // Supprimer le joueur de la salle
      await remove(ref(database, `rooms/${this.currentRoomId}/players/${this.currentPlayerId}`));
      
      // Nettoyer les listeners
      Object.values(this.listeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
      this.listeners = {};
      
      this.currentRoomId = null;
      return true;
    } catch (error) {
      console.error('Erreur quitter salle:', error);
      return false;
    }
  }

  // Trouver une partie rapide
  async findQuickMatch(playerName, skillLevel = 'medium') {
    try {
      const playerId = this.generatePlayerId();
      const roomsRef = ref(database, 'rooms');
      const snapshot = await get(roomsRef);
      
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        
        // Chercher une salle compatible
        for (const [roomId, roomData] of Object.entries(rooms)) {
          if (roomData.status === 'waiting' && 
              roomData.settings.difficulty === skillLevel &&
              Object.keys(roomData.players || {}).length < roomData.settings.maxPlayers) {
            
            // Rejoindre cette salle
            const result = await this.joinRoom(roomData.code, playerName);
            if (result.success) {
              return result;
            }
          }
        }
      }
      
      // Aucune salle trouvée, en créer une nouvelle
      return await this.createRoom(playerName, {
        maxPlayers: 4,
        gameMode: 'race',
        difficulty: skillLevel
      });
      
    } catch (error) {
      console.error('Erreur partie rapide:', error);
      return { success: false, error: error.message };
    }
  }

  // Nettoyer les salles vides ou expirées (à appeler périodiquement)
  async cleanupRooms() {
    try {
      const roomsRef = ref(database, 'rooms');
      const snapshot = await get(roomsRef);
      
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        for (const [roomId, roomData] of Object.entries(rooms)) {
          const createdAt = roomData.createdAt || 0;
          const isEmpty = !roomData.players || Object.keys(roomData.players).length === 0;
          const isExpired = now - createdAt > oneHour;
          
          if (isEmpty || isExpired) {
            await remove(ref(database, `rooms/${roomId}`));
          }
        }
      }
    } catch (error) {
      console.error('Erreur nettoyage salles:', error);
    }
  }
}

// Instance globale du service
export const multiplayerService = new MultiplayerService();
