// Service multijoueur hybride - Fonctionne avec ou sans Firebase
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
  get,
  query,
  orderByChild,
  equalTo,
  onDisconnect
} from 'firebase/database';
import * as Crypto from 'expo-crypto';

export class HybridMultiplayerService {
  constructor() {
    this.currentRoomId = null;
    this.currentPlayerId = null;
    this.listeners = {};
    this.isOnline = false;
    this.localRooms = new Map(); // Fallback local storage
    this.checkConnection();
  }

  // Vérifier la connexion Firebase
  async checkConnection() {
    try {
      const connectedRef = ref(database, '.info/connected');
      onValue(connectedRef, (snapshot) => {
        this.isOnline = snapshot.val() === true;
        console.log(this.isOnline ? '🔥 Firebase connecté' : '📱 Mode local activé');
      });
    } catch (error) {
      this.isOnline = false;
      console.log('📱 Mode local activé (Firebase indisponible)');
    }
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
      console.log('🎮 Création de salle...');
      
      const playerId = this.generatePlayerId();
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const roomData = {
        id: this.isOnline ? null : Crypto.randomUUID(),
        code: roomCode,
        host: playerId,
        status: 'waiting',
        createdAt: Date.now(),
        lastActivity: Date.now(),
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
            status: 'connected',
            avatar: '👤'
          }
        },
        gameState: {
          status: 'waiting',
          text: null,
          startTime: null,
          endTime: null,
          countdown: null,
          winner: null
        }
      };

      if (this.isOnline) {
        // Mode Firebase
        const roomsRef = ref(database, 'rooms');
        const newRoomRef = push(roomsRef);
        const roomId = newRoomRef.key;
        
        roomData.id = roomId;
        await set(newRoomRef, roomData);
        this.currentRoomId = roomId;
        
        console.log('✅ Salle Firebase créée:', roomCode);
      } else {
        // Mode local
        const roomId = roomData.id;
        this.localRooms.set(roomId, roomData);
        this.currentRoomId = roomId;
        
        console.log('✅ Salle locale créée:', roomCode);
      }

      return {
        success: true,
        roomId: roomData.id,
        roomCode,
        playerId,
        roomData
      };

    } catch (error) {
      console.error('❌ Erreur création salle:', error);
      return {
        success: false,
        error: 'Impossible de créer la salle'
      };
    }
  }

  // Rejoindre une salle existante
  async joinRoom(roomCode, playerName) {
    try {
      console.log('🔍 Recherche de salle:', roomCode);
      
      let roomData = null;
      let roomId = null;

      if (this.isOnline) {
        // Mode Firebase
        const roomsRef = ref(database, 'rooms');
        const roomQuery = query(roomsRef, orderByChild('code'), equalTo(roomCode));
        const snapshot = await get(roomQuery);
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            roomId = childSnapshot.key;
            roomData = childSnapshot.val();
          });
        }
      } else {
        // Mode local
        for (let [id, room] of this.localRooms.entries()) {
          if (room.code === roomCode) {
            roomId = id;
            roomData = room;
            break;
          }
        }
      }

      if (!roomData) {
        return {
          success: false,
          error: 'Salle introuvable'
        };
      }

      if (roomData.status !== 'waiting') {
        return {
          success: false,
          error: 'La partie a déjà commencé'
        };
      }

      const playerCount = Object.keys(roomData.players || {}).length;
      if (playerCount >= roomData.settings.maxPlayers) {
        return {
          success: false,
          error: 'Salle complète'
        };
      }

      const playerId = this.generatePlayerId();
      
      const newPlayer = {
        id: playerId,
        name: playerName,
        isReady: false,
        isHost: false,
        joinedAt: Date.now(),
        status: 'connected',
        avatar: '👤'
      };

      if (this.isOnline) {
        // Mode Firebase
        const playerRef = ref(database, `rooms/${roomId}/players/${playerId}`);
        await set(playerRef, newPlayer);
      } else {
        // Mode local
        roomData.players[playerId] = newPlayer;
        this.localRooms.set(roomId, roomData);
      }

      this.currentRoomId = roomId;
      console.log('✅ Salle rejointe avec succès');

      return {
        success: true,
        roomId,
        roomCode,
        playerId,
        roomData: {
          ...roomData,
          id: roomId
        }
      };

    } catch (error) {
      console.error('❌ Erreur rejoindre salle:', error);
      return {
        success: false,
        error: 'Impossible de rejoindre la salle'
      };
    }
  }

  // Recherche partie rapide
  async findQuickMatch(playerName, difficulty = 'medium') {
    try {
      console.log('⚡ Recherche partie rapide...');
      
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let availableRoom = null;
      let availableRoomId = null;

      if (this.isOnline) {
        // Mode Firebase
        const roomsRef = ref(database, 'rooms');
        const waitingRoomsQuery = query(roomsRef, orderByChild('status'), equalTo('waiting'));
        const snapshot = await get(waitingRoomsQuery);
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const room = childSnapshot.val();
            if (room.settings.difficulty === difficulty &&
                Object.keys(room.players || {}).length < room.settings.maxPlayers) {
              availableRoom = room;
              availableRoomId = childSnapshot.key;
            }
          });
        }
      } else {
        // Mode local
        for (let [id, room] of this.localRooms.entries()) {
          if (room.status === 'waiting' && 
              room.settings.difficulty === difficulty &&
              Object.keys(room.players || {}).length < room.settings.maxPlayers) {
            availableRoom = room;
            availableRoomId = id;
            break;
          }
        }
      }

      if (availableRoom) {
        console.log('🎯 Salle trouvée, rejoindre...');
        return await this.joinRoom(availableRoom.code, playerName);
      } else {
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
      if (this.isOnline) {
        const playerReadyRef = ref(database, `rooms/${roomId}/players/${playerId}/isReady`);
        await set(playerReadyRef, isReady);
      } else {
        const room = this.localRooms.get(roomId);
        if (room && room.players[playerId]) {
          room.players[playerId].isReady = isReady;
          this.localRooms.set(roomId, room);
        }
      }
      
      console.log(`✅ Joueur ${isReady ? 'prêt' : 'pas prêt'}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour prêt:', error);
      return { success: false, error: 'Erreur mise à jour' };
    }
  }

  // Démarrer la partie
  async startGame(roomId, gameText) {
    try {
      const gameStartData = {
        status: 'countdown',
        text: gameText || 'TypeVision est une application révolutionnaire qui transforme la façon dont nous apprenons à taper rapidement et précisément.',
        startTime: Date.now() + 3000,
        countdown: 3,
        winner: null
      };

      if (this.isOnline) {
        const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
        const statusRef = ref(database, `rooms/${roomId}/status`);
        await set(gameStateRef, gameStartData);
        await set(statusRef, 'countdown');
      } else {
        const room = this.localRooms.get(roomId);
        if (room) {
          room.gameState = gameStartData;
          room.status = 'countdown';
          this.localRooms.set(roomId, room);
        }
      }

      console.log('🚀 Partie démarrée !');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur démarrage partie:', error);
      return { success: false, error: 'Erreur démarrage partie' };
    }
  }

  // Ajouter un listener pour les mises à jour temps réel
  addRoomListener(roomId, callback) {
    if (this.isOnline) {
      const roomRef = ref(database, `rooms/${roomId}`);
      const listener = onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val());
        } else {
          callback(null);
        }
      });
      this.listeners[roomId] = listener;
    } else {
      // Mode local - simuler des mises à jour
      const interval = setInterval(() => {
        const room = this.localRooms.get(roomId);
        if (room) {
          callback(room);
        }
      }, 2000);
      this.listeners[roomId] = interval;
    }
    
    console.log('👂 Listener ajouté');
  }

  // Supprimer le listener
  removeRoomListener(roomId) {
    if (this.listeners[roomId]) {
      if (this.isOnline) {
        const roomRef = ref(database, `rooms/${roomId}`);
        off(roomRef, 'value', this.listeners[roomId]);
      } else {
        clearInterval(this.listeners[roomId]);
      }
      delete this.listeners[roomId];
      console.log('🔇 Listener supprimé');
    }
  }

  // Mettre à jour la progression du joueur
  async updatePlayerProgress(roomId, playerId, progress) {
    try {
      if (this.isOnline) {
        const progressRef = ref(database, `rooms/${roomId}/players/${playerId}/gameProgress`);
        await set(progressRef, {
          currentPosition: progress.currentPosition,
          correctChars: progress.correctChars,
          totalChars: progress.totalChars,
          wpm: progress.wpm,
          accuracy: progress.accuracy,
          isFinished: progress.isFinished,
          finishTime: progress.isFinished ? Date.now() : null,
          lastUpdate: Date.now()
        });
      } else {
        const room = this.localRooms.get(roomId);
        if (room && room.players[playerId]) {
          room.players[playerId].gameProgress = progress;
          this.localRooms.set(roomId, room);
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Quitter la salle
  async leaveRoom(roomId, playerId) {
    try {
      if (this.isOnline) {
        const playerRef = ref(database, `rooms/${roomId}/players/${playerId}`);
        await remove(playerRef);
        
        const roomPlayersRef = ref(database, `rooms/${roomId}/players`);
        const snapshot = await get(roomPlayersRef);
        
        if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
          const roomRef = ref(database, `rooms/${roomId}`);
          await remove(roomRef);
        }
      } else {
        const room = this.localRooms.get(roomId);
        if (room) {
          delete room.players[playerId];
          if (Object.keys(room.players).length === 0) {
            this.localRooms.delete(roomId);
          } else {
            this.localRooms.set(roomId, room);
          }
        }
      }
      
      this.currentRoomId = null;
      this.removeRoomListener(roomId);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur quitter salle' };
    }
  }

  // Nettoyage des salles expirées
  async cleanupRooms() {
    console.log('🧹 Nettoyage des salles...');
    // Implémentation simple pour éviter les erreurs
  }
}

// Instance unique du service
export const multiplayerService = new HybridMultiplayerService();
export default multiplayerService;
