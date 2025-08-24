// Service multijoueur TypeVision - Firebase Production
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
  limitToLast,
  onDisconnect
} from 'firebase/database';
import * as Crypto from 'expo-crypto';

export class MultiplayerService {
  constructor() {
    this.currentRoomId = null;
    this.currentPlayerId = null;
    this.listeners = {};
    this.playerPresence = null;
  }

  // Générer un ID unique pour le joueur
  generatePlayerId() {
    if (!this.currentPlayerId) {
      this.currentPlayerId = Crypto.randomUUID();
    }
    return this.currentPlayerId;
  }

  // Gérer la présence du joueur
  setupPlayerPresence(playerId) {
    const presenceRef = ref(database, `presence/${playerId}`);
    const connectedRef = ref(database, '.info/connected');
    
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // Marquer comme connecté
        set(presenceRef, {
          online: true,
          lastSeen: serverTimestamp()
        });
        
        // Marquer comme déconnecté lors de la déconnexion
        onDisconnect(presenceRef).set({
          online: false,
          lastSeen: serverTimestamp()
        });
      }
    });
  }

  // Créer une nouvelle salle de jeu
  async createRoom(playerName, gameSettings = {}) {
    try {
      console.log('🎮 Création de salle multijoueur...');
      
      const playerId = this.generatePlayerId();
      this.setupPlayerPresence(playerId);
      
      const roomsRef = ref(database, 'rooms');
      const newRoomRef = push(roomsRef);
      const roomId = newRoomRef.key;
      
      // Code de salle à 6 chiffres unique
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const roomData = {
        id: roomId,
        code: roomCode,
        host: playerId,
        status: 'waiting', // waiting, countdown, playing, finished
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        settings: {
          maxPlayers: gameSettings.maxPlayers || 4,
          gameMode: gameSettings.gameMode || 'race', // race, survival, precision
          difficulty: gameSettings.difficulty || 'medium',
          textLength: gameSettings.textLength || 'medium',
          timeLimit: gameSettings.timeLimit || null
        },
        players: {
          [playerId]: {
            id: playerId,
            name: playerName,
            isReady: false,
            isHost: true,
            joinedAt: serverTimestamp(),
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
        },
        chat: {} // Messages du chat
      };

      // Créer la salle dans Firebase
      await set(newRoomRef, roomData);
      
      this.currentRoomId = roomId;
      
      console.log('✅ Salle créée avec succès:', roomCode);

      return {
        success: true,
        roomId,
        roomCode,
        playerId,
        roomData: {
          ...roomData,
          id: roomId,
          code: roomCode
        }
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
      
      // Rechercher la salle par code
      const roomsRef = ref(database, 'rooms');
      const roomQuery = query(roomsRef, orderByChild('code'), equalTo(roomCode));
      const snapshot = await get(roomQuery);
      
      if (!snapshot.exists()) {
        return {
          success: false,
          error: 'Salle introuvable'
        };
      }

      let roomData = null;
      let roomId = null;
      
      snapshot.forEach((childSnapshot) => {
        roomId = childSnapshot.key;
        roomData = childSnapshot.val();
      });

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
      this.setupPlayerPresence(playerId);
      
      // Ajouter le joueur à la salle
      const playerRef = ref(database, `rooms/${roomId}/players/${playerId}`);
      await set(playerRef, {
        id: playerId,
        name: playerName,
        isReady: false,
        isHost: false,
        joinedAt: serverTimestamp(),
        status: 'connected',
        avatar: '👤'
      });

      // Mettre à jour l'activité de la salle
      const activityRef = ref(database, `rooms/${roomId}/lastActivity`);
      await set(activityRef, serverTimestamp());

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

  // Recherche partie rapide avec matchmaking intelligent
  async findQuickMatch(playerName, difficulty = 'medium') {
    try {
      console.log('⚡ Recherche partie rapide...');
      
      // Rechercher des salles en attente avec la même difficulté
      const roomsRef = ref(database, 'rooms');
      const waitingRoomsQuery = query(
        roomsRef, 
        orderByChild('status'), 
        equalTo('waiting')
      );
      
      const snapshot = await get(waitingRoomsQuery);
      
      if (snapshot.exists()) {
        let bestRoom = null;
        let bestRoomId = null;
        
        snapshot.forEach((childSnapshot) => {
          const room = childSnapshot.val();
          const roomId = childSnapshot.key;
          
          // Vérifier les critères de matchmaking
          if (room.settings.difficulty === difficulty &&
              Object.keys(room.players || {}).length < room.settings.maxPlayers &&
              room.status === 'waiting') {
            
            // Privilégier les salles avec plus de joueurs
            if (!bestRoom || 
                Object.keys(room.players || {}).length > Object.keys(bestRoom.players || {}).length) {
              bestRoom = room;
              bestRoomId = roomId;
            }
          }
        });
        
        if (bestRoom) {
          console.log('🎯 Salle trouvée, rejoindre...');
          return await this.joinRoom(bestRoom.code, playerName);
        }
      }
      
      // Aucune salle trouvée, créer une nouvelle
      console.log('🆕 Aucune salle trouvée, création automatique...');
      return await this.createRoom(playerName, {
        maxPlayers: 4,
        gameMode: 'race',
        difficulty: difficulty
      });

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
      const playerReadyRef = ref(database, `rooms/${roomId}/players/${playerId}/isReady`);
      await set(playerReadyRef, isReady);
      
      console.log(`✅ Joueur ${isReady ? 'prêt' : 'pas prêt'}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour prêt:', error);
      return { success: false, error: 'Erreur mise à jour' };
    }
  }

  // Démarrer la partie (host seulement)
  async startGame(roomId, gameText) {
    try {
      const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
      const statusRef = ref(database, `rooms/${roomId}/status`);
      
      const gameStartData = {
        status: 'countdown',
        text: gameText || 'TypeVision est une application révolutionnaire qui transforme la façon dont nous apprenons à taper rapidement et précisément.',
        startTime: Date.now() + 3000, // 3 secondes de countdown
        endTime: null,
        countdown: 3,
        winner: null
      };

      await set(gameStateRef, gameStartData);
      await set(statusRef, 'countdown');

      console.log('🚀 Partie démarrée !');

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur démarrage partie:', error);
      return { success: false, error: 'Erreur démarrage partie' };
    }
  }

  // Ajouter un listener pour les mises à jour temps réel
  addRoomListener(roomId, callback) {
    const roomRef = ref(database, `rooms/${roomId}`);
    
    const listener = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        callback(roomData);
      } else {
        callback(null);
      }
    });

    this.listeners[roomId] = listener;
    console.log('👂 Listener temps réel ajouté');
  }

  // Supprimer le listener
  removeRoomListener(roomId) {
    if (this.listeners[roomId]) {
      const roomRef = ref(database, `rooms/${roomId}`);
      off(roomRef, 'value', this.listeners[roomId]);
      delete this.listeners[roomId];
      console.log('🔇 Listener supprimé');
    }
  }

  // Mettre à jour la progression du joueur en temps réel
  async updatePlayerProgress(roomId, playerId, progress) {
    try {
      const progressRef = ref(database, `rooms/${roomId}/players/${playerId}/gameProgress`);
      await set(progressRef, {
        currentPosition: progress.currentPosition,
        correctChars: progress.correctChars,
        totalChars: progress.totalChars,
        wpm: progress.wpm,
        accuracy: progress.accuracy,
        isFinished: progress.isFinished,
        finishTime: progress.isFinished ? serverTimestamp() : null,
        lastUpdate: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour progression:', error);
      return { success: false };
    }
  }

  // Quitter la salle
  async leaveRoom(roomId, playerId) {
    try {
      // Supprimer le joueur de la salle
      const playerRef = ref(database, `rooms/${roomId}/players/${playerId}`);
      await remove(playerRef);
      
      // Supprimer la présence
      const presenceRef = ref(database, `presence/${playerId}`);
      await remove(presenceRef);
      
      // Vérifier s'il reste des joueurs
      const roomPlayersRef = ref(database, `rooms/${roomId}/players`);
      const snapshot = await get(roomPlayersRef);
      
      if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
        // Plus de joueurs, supprimer la salle
        const roomRef = ref(database, `rooms/${roomId}`);
        await remove(roomRef);
        console.log('🗑️ Salle supprimée (aucun joueur)');
      }
      
      this.currentRoomId = null;
      this.removeRoomListener(roomId);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur quitter salle:', error);
      return { success: false, error: 'Erreur quitter salle' };
    }
  }

  // Nettoyage des salles expirées (appelé périodiquement)
  async cleanupRooms() {
    try {
      const roomsRef = ref(database, 'rooms');
      const snapshot = await get(roomsRef);
      
      if (snapshot.exists()) {
        const now = Date.now();
        const roomsToDelete = [];
        
        snapshot.forEach((childSnapshot) => {
          const room = childSnapshot.val();
          const roomId = childSnapshot.key;
          
          // Supprimer les salles inactives depuis plus de 1 heure
          const lastActivity = room.lastActivity || room.createdAt;
          if (now - lastActivity > 3600000) { // 1 heure
            roomsToDelete.push(roomId);
          }
        });
        
        // Supprimer les salles expirées
        for (const roomId of roomsToDelete) {
          const roomRef = ref(database, `rooms/${roomId}`);
          await remove(roomRef);
        }
        
        if (roomsToDelete.length > 0) {
          console.log(`🧹 ${roomsToDelete.length} salles expirées supprimées`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
    }
  }

  // Envoyer un message dans le chat (bonus)
  async sendChatMessage(roomId, playerId, playerName, message) {
    try {
      const chatRef = ref(database, `rooms/${roomId}/chat`);
      const newMessageRef = push(chatRef);
      
      await set(newMessageRef, {
        playerId,
        playerName,
        message,
        timestamp: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      return { success: false };
    }
  }
}

// Instance unique du service
export const multiplayerService = new MultiplayerService();
export default multiplayerService;
