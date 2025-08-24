// Service Multijoueur Mondial - TypeVision
// Permet de jouer avec n'importe qui dans le monde via Firebase
import { database, auth } from './firebase';
import { gameData } from '../data/gameData';
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
  limitToFirst,
  startAt,
  endAt,
  onDisconnect
} from 'firebase/database';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import * as Crypto from 'expo-crypto';

export class GlobalMultiplayerService {
  constructor() {
    this.currentRoomId = null;
    this.currentPlayerId = null;
    this.currentUser = null;
    this.listeners = {};
    this.presenceRef = null;
    this.userPresenceRef = null;
    this.presenceCleanupInterval = null;
    this.multiplayerHeartbeat = null;
    this.isAuthenticated = false;
    this.localRooms = new Map(); // Fallback local storage
    this.isOnline = false;
    
    // Vérifier si Firebase est disponible
    this.firebaseAvailable = database && auth;
    
    // Authentification automatique
    this.initializeAuth();
    
    // Gérer la fermeture de l'app
    this.setupAppStateHandlers();
  }

  // Gérer la fermeture/minimisation de l'app
  setupAppStateHandlers() {
    try {
      // Pour React Native
      const { AppState } = require('react-native');
      
      AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          console.log('📱 App en arrière-plan, nettoyage...');
          this.markAsDisconnected();
        } else if (nextAppState === 'active') {
          console.log('📱 App active, reconnexion...');
          this.setupPresence();
        }
      });
      
      // Gérer la fermeture complète
      const unloadHandler = () => {
        this.markAsDisconnected();
      };
      
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', unloadHandler);
        window.addEventListener('unload', unloadHandler);
      }
      
    } catch (error) {
      console.log('⚠️ Gestionnaires d\'état app non disponibles');
    }
  }

  // Initialiser l'authentification Firebase
  async initializeAuth() {
    try {
      // Vérifier si Firebase Auth est disponible
      if (!auth) {
        console.log('🌍 Mode mondial forcé (Firebase Auth non configuré)');
        this.isAuthenticated = true;
        this.currentPlayerId = 'global-' + Math.random().toString(36).substr(2, 9);
        this.isOnline = true; // Forcer le mode en ligne pour le multijoueur mondial
        return;
      }

      // Écouter les changements d'authentification
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.currentUser = user;
          this.currentPlayerId = user.uid;
          this.isAuthenticated = true;
          this.isOnline = true;
          this.setupPresence();
          console.log('🔐 Utilisateur Firebase authentifié:', user.uid);
        } else {
          this.isAuthenticated = false;
          console.log('🔐 Connexion Firebase en cours...');
        }
      });

      // Connexion anonyme si pas encore connecté
      if (!auth.currentUser) {
        const userCredential = await signInAnonymously(auth);
        console.log('👤 Connexion anonyme Firebase réussie:', userCredential.user.uid);
      }
    } catch (error) {
      console.log('📱 Mode local activé (Firebase:', error.message + ')');
      
      // Mode fallback local si Firebase échoue
      this.isAuthenticated = true;
      this.currentPlayerId = 'local-' + Math.random().toString(36).substr(2, 9);
      this.isOnline = false;
    }
  }

  // Configurer la présence en ligne
  setupPresence() {
    if (!this.currentPlayerId || !database) return;

    try {
      const userStatusRef = ref(database, `users/${this.currentPlayerId}/status`);
      const userPresenceRef = ref(database, `presence/${this.currentPlayerId}`);
      
      const isOfflineForDatabase = {
        state: 'offline',
        lastSeen: Date.now(),
        playerId: this.currentPlayerId,
        inMultiplayer: false
      };

      const isOnlineForDatabase = {
        state: 'online',
        lastSeen: Date.now(),
        playerId: this.currentPlayerId,
        connectedAt: Date.now(),
        inMultiplayer: true
      };

      // Créer une référence pour la connexion
      const connectedRef = ref(database, '.info/connected');
      onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) {
          console.log('🔴 Déconnecté de Firebase');
          return;
        }

        // Configurer la déconnexion automatique SEULEMENT pour la présence, pas les salles
        onDisconnect(userStatusRef).set(isOfflineForDatabase);
        onDisconnect(userPresenceRef).set({
          ...isOfflineForDatabase,
          disconnectedAt: Date.now()
        });
        
        // NE PAS configurer onDisconnect pour les salles ici
        // Les joueurs doivent explicitement quitter le mode multijoueur
        
        // Marquer comme en ligne
        set(userStatusRef, isOnlineForDatabase);
        set(userPresenceRef, isOnlineForDatabase);
        console.log('🟢 Connecté au serveur mondial (persistance des salles activée)');
      });

      this.presenceRef = userStatusRef;
      this.userPresenceRef = userPresenceRef;
      
      // Nettoyer les utilisateurs vraiment déconnectés toutes les 2 minutes
      this.startPresenceCleanup();
      
    } catch (error) {
      console.log('⚠️ Présence non disponible, mode local');
    }
  }

  // Démarrer le nettoyage automatique de présence
  startPresenceCleanup() {
    if (this.presenceCleanupInterval) {
      clearInterval(this.presenceCleanupInterval);
    }
    
    this.presenceCleanupInterval = setInterval(async () => {
      await this.cleanupDisconnectedUsers();
    }, 120000); // Toutes les 2 minutes (moins agressif)
  }

  // Nettoyer les utilisateurs vraiment déconnectés (plus conservateur)
  async cleanupDisconnectedUsers() {
    if (!database) return;
    
    try {
      console.log('🧹 Nettoyage conservateur des utilisateurs déconnectés...');
      
      const presenceRef = ref(database, 'presence');
      const snapshot = await get(presenceRef);
      
      if (!snapshot.exists()) return;
      
      const now = Date.now();
      const DISCONNECT_TIMEOUT = 10 * 60 * 1000; // 10 minutes (plus tolérant)
      let cleanedCount = 0;
      
      const updates = {};
      
      snapshot.forEach((childSnapshot) => {
        const userId = childSnapshot.key;
        const presence = childSnapshot.val();
        
        // Ne nettoyer que si vraiment déconnecté depuis longtemps ET pas en multijoueur
        if (presence.state === 'offline' && 
            !presence.inMultiplayer &&
            (now - presence.lastSeen) > DISCONNECT_TIMEOUT) {
          updates[`presence/${userId}`] = null;
          updates[`users/${userId}/status`] = null;
          cleanedCount++;
          console.log(`🗑️ Utilisateur vraiment déconnecté supprimé: ${userId}`);
        }
      });
      
      if (cleanedCount > 0) {
        await update(ref(database), updates);
        console.log(`✅ ${cleanedCount} utilisateur(s) vraiment déconnecté(s) nettoyé(s)`);
      } else {
        console.log('✅ Aucun nettoyage nécessaire');
      }
      
    } catch (error) {
      console.error('❌ Erreur nettoyage présence:', error);
    }
  }

  // Nettoyer les salles vides
  async cleanupEmptyRooms() {
    try {
      const roomsRef = ref(database, 'globalRooms');
      const snapshot = await get(roomsRef);
      
      if (!snapshot.exists()) return;
      
      let cleanedRooms = 0;
      const updates = {};
      
      snapshot.forEach((childSnapshot) => {
        const roomId = childSnapshot.key;
        const room = childSnapshot.val();
        
        // Vérifier si la salle est vide ou expirée
        const players = room.players || {};
        const playerCount = Object.keys(players).length;
        const roomAge = Date.now() - (room.createdAt || 0);
        const MAX_ROOM_AGE = 30 * 60 * 1000; // 30 minutes
        
        if (playerCount === 0 || roomAge > MAX_ROOM_AGE) {
          updates[`globalRooms/${roomId}`] = null;
          cleanedRooms++;
        }
      });
      
      if (cleanedRooms > 0) {
        await update(ref(database), updates);
        console.log(`🗑️ ${cleanedRooms} salle(s) vide(s) supprimée(s)`);
      }
      
    } catch (error) {
      console.error('❌ Erreur nettoyage salles:', error);
    }
  }

  // Marquer comme entré en mode multijoueur
  async enterMultiplayerMode() {
    if (!database || !this.currentPlayerId) return;
    
    try {
      console.log('🎮 Entrée en mode multijoueur...');
      
      const updates = {};
      updates[`users/${this.currentPlayerId}/status/inMultiplayer`] = true;
      updates[`users/${this.currentPlayerId}/status/lastSeen`] = Date.now();
      updates[`presence/${this.currentPlayerId}/inMultiplayer`] = true;
      updates[`presence/${this.currentPlayerId}/lastSeen`] = Date.now();
      
      await update(ref(database), updates);
      console.log('✅ Mode multijoueur activé');
      
      // Démarrer le heartbeat pour maintenir la présence
      this.startMultiplayerHeartbeat();
      
    } catch (error) {
      console.error('❌ Erreur activation multijoueur:', error);
    }
  }

  // Maintenir la présence active en mode multijoueur
  startMultiplayerHeartbeat() {
    if (this.multiplayerHeartbeat) {
      clearInterval(this.multiplayerHeartbeat);
    }
    
    this.multiplayerHeartbeat = setInterval(async () => {
      if (this.currentRoomId && database && this.currentPlayerId) {
        try {
          const updates = {};
          updates[`presence/${this.currentPlayerId}/lastSeen`] = Date.now();
          updates[`users/${this.currentPlayerId}/status/lastSeen`] = Date.now();
          
          // Mettre à jour aussi dans la salle si on y est
          if (this.currentRoomId) {
            updates[`globalRooms/${this.currentRoomId}/players/${this.currentPlayerId}/lastSeen`] = Date.now();
          }
          
          await update(ref(database), updates);
        } catch (error) {
          console.warn('⚠️ Erreur heartbeat multijoueur:', error);
        }
      }
    }, 30000); // Toutes les 30 secondes
  }

  // Marquer comme sorti du mode multijoueur
  async exitMultiplayerMode() {
    if (!database || !this.currentPlayerId) return;
    
    try {
      console.log('🚪 Sortie du mode multijoueur...');
      
      // Arrêter le heartbeat
      if (this.multiplayerHeartbeat) {
        clearInterval(this.multiplayerHeartbeat);
        this.multiplayerHeartbeat = null;
      }
      
      // D'abord quitter la salle actuelle si on en a une
      if (this.currentRoomId) {
        const playerRef = ref(database, `globalRooms/${this.currentRoomId}/players/${this.currentPlayerId}`);
        await remove(playerRef);
        this.currentRoomId = null;
      }
      
      const updates = {};
      updates[`users/${this.currentPlayerId}/status/inMultiplayer`] = false;
      updates[`users/${this.currentPlayerId}/status/lastSeen`] = Date.now();
      updates[`presence/${this.currentPlayerId}/inMultiplayer`] = false;
      updates[`presence/${this.currentPlayerId}/lastSeen`] = Date.now();
      
      await update(ref(database), updates);
      console.log('✅ Mode multijoueur désactivé');
      
      // Arrêter le nettoyage automatique
      if (this.presenceCleanupInterval) {
        clearInterval(this.presenceCleanupInterval);
        this.presenceCleanupInterval = null;
      }
      
    } catch (error) {
      console.error('❌ Erreur désactivation multijoueur:', error);
    }
  }

  // Marquer explicitement comme déconnecté (appelé quand l'utilisateur quitte)
  async markAsDisconnected() {
    if (!database || !this.currentPlayerId) return;
    
    try {
      console.log('👋 Déconnexion explicite...');
      
      const updates = {};
      updates[`users/${this.currentPlayerId}/status`] = {
        state: 'offline',
        lastSeen: Date.now(),
        playerId: this.currentPlayerId
      };
      updates[`presence/${this.currentPlayerId}`] = null;
      
      // Quitter la salle courante si dans une salle
      if (this.currentRoomId) {
        updates[`globalRooms/${this.currentRoomId}/players/${this.currentPlayerId}`] = null;
        console.log('🚪 Quitté automatiquement la salle:', this.currentRoomId);
      }
      
      await update(ref(database), updates);
      
      // Arrêter le nettoyage automatique
      if (this.presenceCleanupInterval) {
        clearInterval(this.presenceCleanupInterval);
        this.presenceCleanupInterval = null;
      }
      
      this.currentRoomId = null;
      console.log('✅ Déconnexion propre terminée');
      
    } catch (error) {
      console.error('❌ Erreur déconnexion explicite:', error);
    }
  }

  // Attendre que l'authentification soit prête
  async waitForAuth() {
    if (this.isAuthenticated) return true;
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Ne pas rejeter, juste résoudre en mode local
        console.log('⚠️ Timeout auth, mode local activé');
        this.isAuthenticated = true;
        this.currentPlayerId = 'local-' + Math.random().toString(36).substr(2, 9);
        resolve(true);
      }, 5000); // Réduire le timeout à 5 secondes

      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            clearTimeout(timeout);
            unsubscribe();
            resolve(true);
          }
        });
      } else {
        // Pas d'auth disponible, mode local directement
        clearTimeout(timeout);
        this.isAuthenticated = true;
        this.currentPlayerId = 'local-' + Math.random().toString(36).substr(2, 9);
        resolve(true);
      }
    });
  }

  // Créer une salle mondiale
  async createGlobalRoom(playerName, gameSettings = {}) {
    try {
      await this.waitForAuth();
      console.log('� Création de salle...');
      
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const roomData = {
        code: roomCode,
        host: this.currentPlayerId,
        status: 'waiting',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        region: this.isOnline ? 'global' : 'local',
        settings: {
          minPlayers: gameSettings.minPlayers || 2, // Minimum 2 joueurs
          maxPlayers: Math.min(Math.max(gameSettings.maxPlayers || 6, 2), 6), // Maximum 6 joueurs
          gameMode: gameSettings.gameMode || 'race',
          difficulty: gameSettings.difficulty || 'medium',
          textLength: gameSettings.textLength || 'medium',
          isPublic: gameSettings.isPublic !== false,
          language: gameSettings.language || 'fr'
        },
        players: {
          [this.currentPlayerId]: {
            id: this.currentPlayerId,
            name: playerName,
            isReady: false,
            isHost: true,
            joinedAt: Date.now(),
            status: 'connected',
            avatar: this.isOnline ? '🌍' : '📱',
            country: 'FR'
          }
        },
        gameState: {
          status: 'waiting',
          text: null,
          startTime: null,
          endTime: null,
          countdown: null,
          winner: null,
          results: {}
        }
      };

      // Forcer l'utilisation de Firebase pour le multijoueur mondial
      if (database) {
        try {
          console.log('🌍 Tentative de création de salle mondiale sur Firebase...');
          // Mode Firebase - forcer même sans auth parfaite
          const roomsRef = ref(database, 'globalRooms');
          const newRoomRef = push(roomsRef);
          const roomId = newRoomRef.key;
          
          await set(newRoomRef, roomData);
          this.currentRoomId = roomId;
          
          // Marquer comme en mode multijoueur
          await this.enterMultiplayerMode();
          
          // NE PAS configurer onDisconnect pour les salles - les joueurs persistent
          console.log('✅ Salle mondiale créée avec succès:', roomCode);
          
          return {
            success: true,
            roomId,
            roomCode,
            playerId: this.currentPlayerId,
            roomData: {
              ...roomData,
              id: roomId
            }
          };
        } catch (error) {
          console.error('❌ Erreur création salle Firebase:', error.message);
          if (error.code === 'PERMISSION_DENIED') {
            console.log('');
            console.log('� CONFIGURATION FIREBASE REQUISE:');
            console.log('   Suivez les instructions dans FIREBASE_RULES_FIX.md');
            console.log('   Ou configurez les règles Firebase en mode développement');
            console.log('');
          }
          // Ne pas faire de fallback local - retourner l'erreur pour forcer la config Firebase
          return {
            success: false,
            error: 'Configuration Firebase requise pour le multijoueur mondial. Voir FIREBASE_RULES_FIX.md'
          };
        }
      } else {
        return {
          success: false,
          error: 'Base de données Firebase non disponible. Vérifiez votre configuration.'
        };
      }

    } catch (error) {
      console.error('❌ Erreur création salle mondiale:', error);
      return {
        success: false,
        error: 'Impossible de créer la salle mondiale'
      };
    }
  }

  // Rejoindre une salle mondiale
  async joinGlobalRoom(roomCode, playerName) {
    try {
      await this.waitForAuth();
      console.log('🔍 Recherche de salle mondiale:', roomCode);
      
      // Utiliser seulement Firebase pour le multijoueur mondial
      if (!database) {
        return {
          success: false,
          error: 'Base de données Firebase non disponible. Vérifiez votre configuration.'
        };
      }

      try {
        const roomsRef = ref(database, 'globalRooms');
        const roomQuery = query(roomsRef, orderByChild('code'), equalTo(roomCode));
        const snapshot = await get(roomQuery);
        
        if (!snapshot.exists()) {
          return {
            success: false,
            error: 'Salle introuvable. Vérifiez le code.'
          };
        }

        let roomData = null;
        let roomId = null;
        
        snapshot.forEach((childSnapshot) => {
          roomId = childSnapshot.key;
          roomData = childSnapshot.val();
        });

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

        const newPlayer = {
          id: this.currentPlayerId,
          name: playerName,
          isReady: false,
          isHost: false,
          joinedAt: Date.now(),
          status: 'connected',
          avatar: '🌍',
          country: 'FR'
        };

        const playerRef = ref(database, `globalRooms/${roomId}/players/${this.currentPlayerId}`);
        await set(playerRef, newPlayer);
        
        // Marquer comme en mode multijoueur
        await this.enterMultiplayerMode();
        
        // Mettre à jour l'activité de la salle
        const lastActivityRef = ref(database, `globalRooms/${roomId}/lastActivity`);
        await set(lastActivityRef, Date.now());

        this.currentRoomId = roomId;
        
        // Vérifier si c'est une partie rapide et si on a maintenant 2+ joueurs
        const updatedPlayerCount = playerCount + 1;
        if (roomData.settings && roomData.settings.isPublic && updatedPlayerCount >= 2) {
          // Partie rapide avec 2+ joueurs : démarrer le countdown automatique
          console.log('⚡ Partie rapide - 2+ joueurs détectés, démarrage countdown...');
          await this.startQuickMatchCountdown(roomId);
        }
        
        console.log('✅ Salle mondiale rejointe avec succès (persistance activée)');

        return {
          success: true,
          roomId,
          roomCode,
          playerId: this.currentPlayerId,
          roomData: {
            ...roomData,
            id: roomId
          }
        };
      } catch (firebaseError) {
        console.error('❌ Erreur Firebase lors de la recherche:', firebaseError.message);
        if (firebaseError.code === 'PERMISSION_DENIED') {
          return {
            success: false,
            error: 'Configuration Firebase requise. Voir FIREBASE_RULES_FIX.md'
          };
        }
        return {
          success: false,
          error: 'Erreur de connexion à la base de données'
        };
      }

    } catch (error) {
      console.error('❌ Erreur rejoindre salle mondiale:', error);
      return {
        success: false,
        error: 'Impossible de rejoindre la salle'
      };
    }
  }

  // Rejoindre une salle locale (fallback)
  async joinLocalRoom(roomCode, playerName) {
    try {
      console.log('🔍 Recherche de salle locale:', roomCode);
      
      // Chercher d'abord dans les salles locales en mémoire
      if (this.localRooms && this.localRooms.size > 0) {
        for (let [roomId, roomData] of this.localRooms.entries()) {
          if (roomData.code === roomCode) {
            return this.joinExistingLocalRoom(roomId, roomData, playerName);
          }
        }
      }
      
      // Chercher dans AsyncStorage pour les salles partagées
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const sharedRooms = await AsyncStorage.default.getItem('sharedLocalRooms');
        const rooms = sharedRooms ? JSON.parse(sharedRooms) : {};
        
        if (rooms[roomCode]) {
          const roomData = rooms[roomCode];
          const now = Date.now();
          
          // Vérifier que la salle n'est pas trop ancienne (5 minutes)
          if (now - roomData.timestamp < 5 * 60 * 1000) {
            // Vérifier qu'on est sur le même réseau
            const currentNetworkId = await this.getNetworkId();
            if (currentNetworkId === roomData.networkId) {
              // Créer la salle localement et la rejoindre
              const roomId = 'local-' + Math.random().toString(36).substr(2, 9);
              roomData.id = roomId;
              this.localRooms = this.localRooms || new Map();
              this.localRooms.set(roomId, roomData);
              
              return this.joinExistingLocalRoom(roomId, roomData, playerName);
            } else {
              console.log('⚠️ Salle trouvée mais sur un autre réseau');
            }
          } else {
            console.log('⚠️ Salle expirée, suppression...');
            delete rooms[roomCode];
            await AsyncStorage.default.setItem('sharedLocalRooms', JSON.stringify(rooms));
          }
        }
      } catch (error) {
        console.warn('⚠️ Erreur lecture salles partagées:', error);
      }
      
      return {
        success: false,
        error: 'Salle introuvable - Assurez-vous que les deux appareils sont sur le même réseau'
      };
      
    } catch (error) {
      console.error('❌ Erreur rejoindre salle locale:', error);
      return {
        success: false,
        error: 'Impossible de rejoindre la salle locale'
      };
    }
  }

  // Rejoindre une salle locale existante
  async joinExistingLocalRoom(roomId, roomData, playerName) {
    const playerCount = Object.keys(roomData.players || {}).length;
    if (playerCount >= roomData.settings.maxPlayers) {
      return {
        success: false,
        error: 'Salle complète'
      };
    }

    // Ajouter le joueur à la salle locale
    roomData.players[this.currentPlayerId] = {
      id: this.currentPlayerId,
      name: playerName,
      isReady: false,
      isHost: false,
      joinedAt: Date.now(),
      status: 'connected',
      avatar: '📱',
      country: 'FR'
    };

    this.currentRoomId = roomId;
    console.log('✅ Salle locale rejointe avec succès');

    return {
      success: true,
      roomId,
      roomCode: roomData.code,
      playerId: this.currentPlayerId,
      roomData: {
        ...roomData,
        id: roomId
      }
    };
  }

  // Obtenir un identifiant de réseau simple
  async getNetworkId() {
    try {
      // On va utiliser une combinaison simple pour identifier le réseau local
      // En production, on pourrait utiliser des libs comme react-native-network-info
      const timestamp = Date.now();
      const hour = Math.floor(timestamp / (1000 * 60 * 60)); // Heure actuelle
      return `network_${hour}`; // Change chaque heure pour éviter les conflits
    } catch (error) {
      return 'default_network';
    }
  }

  // Recherche de partie rapide mondiale
  async findGlobalQuickMatch(playerName, difficulty = 'medium') {
    try {
      await this.waitForAuth();
      console.log('⚡ Recherche partie rapide mondiale...');
      
      // Si on est déjà dans une salle, la quitter d'abord
      if (this.currentRoomId) {
        console.log('🚪 Quitter la salle actuelle avant recherche rapide...');
        await this.leaveRoom(this.currentRoomId);
        // Petite pause pour que la base de données se mette à jour
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Nettoyage rapide des salles expirées avant recherche
      console.log('🧹 Nettoyage rapide avant recherche...');
      await this.cleanupExpiredRooms();
      
      // Chercher une salle publique disponible (sans index pour éviter l'erreur)
      const roomsRef = ref(database, 'globalRooms');
      
      // Utiliser get() simple au lieu de query pour éviter l'erreur d'index
      const snapshot = await get(roomsRef);
      
      if (snapshot.exists()) {
        let bestRoom = null;
        let bestRoomId = null;
        
        snapshot.forEach((childSnapshot) => {
          const room = childSnapshot.val();
          const roomId = childSnapshot.key;
          
          // Vérifier les critères manuellement ET s'assurer qu'on n'est pas déjà dans cette salle
          if (room.status === 'waiting' &&
              room.settings && 
              room.settings.isPublic && 
              room.settings.difficulty === difficulty &&
              room.players &&
              Object.keys(room.players).length < room.settings.maxPlayers &&
              !room.players[this.currentPlayerId] && // Pas déjà dans la salle
              room.host !== this.currentPlayerId && // Pas l'hôte de cette salle
              roomId !== this.currentRoomId) { // Pas notre salle actuelle
            
            // Vérification supplémentaire : la salle ne doit pas être trop ancienne
            const roomAge = Date.now() - (room.createdAt || 0);
            const MAX_ROOM_AGE = 5 * 60 * 1000; // 5 minutes max
            
            if (roomAge < MAX_ROOM_AGE) {
              bestRoom = room;
              bestRoomId = roomId;
              console.log(`🎯 Salle valide trouvée: ${room.code} (${Math.round(roomAge/1000)}s d'âge)`);
              return true; // Prendre la première salle trouvée
            } else {
              console.log(`⏰ Salle ignorée (trop ancienne): ${room.code} (${Math.round(roomAge/60000)}min)`);
            }
          }
        });
        
        if (bestRoom) {
          console.log('🎯 Salle mondiale trouvée, rejoindre...');
          return await this.joinGlobalRoom(bestRoom.code, playerName);
        } else {
          console.log('🔍 Aucune salle récente disponible trouvée (excluant mes propres salles)');
        }
      }
      
      // Aucune salle trouvée, créer une nouvelle salle publique
      console.log('🆕 Création d\'une nouvelle salle mondiale...');
      return await this.createGlobalRoom(playerName, {
        minPlayers: 2,
        maxPlayers: 6, // Maximum 6 joueurs pour partie rapide
        gameMode: 'race',
        difficulty: difficulty,
        isPublic: true
      });

    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        console.log('⚠️ Permissions Firebase requises pour les parties rapides - voir FIREBASE_RULES_FIX.md');
      } else {
        console.error('❌ Erreur partie rapide mondiale:', error);
      }
      return {
        success: false,
        error: 'Impossible de trouver une partie'
      };
    }
  }

  // Écouter les changements d'une salle
  addGlobalRoomListener(roomId, callback) {
    if (this.listeners[roomId]) {
      off(this.listeners[roomId]);
    }

    const roomRef = ref(database, `globalRooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        callback({
          ...roomData,
          id: roomId
        });
      } else {
        callback(null);
      }
    });

    this.listeners[roomId] = roomRef;
    console.log('👂 Listener mondial ajouté pour la salle:', roomId);
    
    return unsubscribe;
  }

  // Supprimer un listener
  removeGlobalRoomListener(roomId) {
    if (this.listeners[roomId]) {
      off(this.listeners[roomId]);
      delete this.listeners[roomId];
      console.log('🔇 Listener mondial supprimé pour la salle:', roomId);
    }
  }

  // Mettre à jour l'état "prêt" d'un joueur
  async setPlayerReady(roomId, isReady) {
    try {
      // Vérifier d'abord si c'est une partie rapide (publique)
      const roomRef = ref(database, `globalRooms/${roomId}`);
      const roomSnapshot = await get(roomRef);
      
      if (roomSnapshot.exists()) {
        const room = roomSnapshot.val();
        
        // Si c'est une partie rapide (publique), ignorer le système "prêt"
        if (room.settings && room.settings.isPublic) {
          console.log('⚡ Partie rapide détectée - système "prêt" ignoré');
          return { 
            success: false, 
            error: 'Les parties rapides démarrent automatiquement, pas besoin d\'être prêt !' 
          };
        }
        
        // Pour les parties personnalisées, vérifier le minimum de joueurs
        if (isReady) {
          const players = room.players || {};
          const playerCount = Object.keys(players).length;
          
          if (playerCount < 2) {
            return { 
              success: false, 
              error: `Attendez qu'un autre joueur rejoigne la salle (${playerCount}/2 minimum)` 
            };
          }
        }
      }
      
      const playerReadyRef = ref(database, `globalRooms/${roomId}/players/${this.currentPlayerId}/isReady`);
      await set(playerReadyRef, isReady);
      
      // Mettre à jour aussi le timestamp de dernière activité du joueur
      const playerLastSeenRef = ref(database, `globalRooms/${roomId}/players/${this.currentPlayerId}/lastSeen`);
      await set(playerLastSeenRef, Date.now());
      
      // Mettre à jour l'activité de la salle
      const lastActivityRef = ref(database, `globalRooms/${roomId}/lastActivity`);
      await set(lastActivityRef, Date.now());
      
      // Mettre à jour la présence générale
      if (this.userPresenceRef) {
        await update(this.userPresenceRef, { lastSeen: Date.now() });
      }
      
      console.log(`${isReady ? '✅' : '❌'} Statut prêt mis à jour: ${isReady}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mettre à jour prêt:', error);
      return { success: false, error: 'Erreur de mise à jour' };
    }
  }

  // Vérifier si la partie peut commencer (tous prêts + minimum 2 joueurs)
  async canStartGame(roomId) {
    try {
      const roomRef = ref(database, `globalRooms/${roomId}`);
      const roomSnapshot = await get(roomRef);
      
      if (!roomSnapshot.exists()) {
        return { canStart: false, reason: 'Salle introuvable' };
      }
      
      const room = roomSnapshot.val();
      const players = room.players || {};
      const playerCount = Object.keys(players).length;
      
      // Minimum 2 joueurs requis
      if (playerCount < 2) {
        return { 
          canStart: false, 
          reason: `Il faut au minimum 2 joueurs (actuellement: ${playerCount})`,
          playerCount 
        };
      }
      
      // Différencier parties rapides et personnalisées
      if (room.settings && room.settings.isPublic) {
        // Partie rapide : peut démarrer dès qu'il y a 2+ joueurs (pas besoin d'être prêt)
        return { 
          canStart: true, 
          reason: `Partie rapide avec ${playerCount} joueurs - démarrage automatique !`,
          playerCount,
          isQuickMatch: true
        };
      } else {
        // Partie personnalisée : vérifier que tous les joueurs sont prêts
        const allReady = Object.values(players).every(player => player.isReady === true);
        
        if (!allReady) {
          const readyCount = Object.values(players).filter(player => player.isReady === true).length;
          return { 
            canStart: false, 
            reason: `Tous les joueurs doivent être prêts (${readyCount}/${playerCount})`,
            playerCount,
            readyCount,
            isQuickMatch: false
          };
        }
        
        return { 
          canStart: true, 
          reason: `Tous les ${playerCount} joueurs sont prêts !`,
          playerCount,
          isQuickMatch: false
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification démarrage:', error);
      return { canStart: false, reason: 'Erreur de vérification' };
    }
  }

  // Obtenir des infos sur l'état d'une salle
  async getRoomStatus(roomId) {
    try {
      const roomRef = ref(database, `globalRooms/${roomId}`);
      const roomSnapshot = await get(roomRef);
      
      if (!roomSnapshot.exists()) {
        return { found: false };
      }
      
      const room = roomSnapshot.val();
      const players = room.players || {};
      const playerCount = Object.keys(players).length;
      const readyCount = Object.values(players).filter(player => player.isReady === true).length;
      const minPlayers = room.settings?.minPlayers || 2;
      const maxPlayers = room.settings?.maxPlayers || 4;
      
      return {
        found: true,
        code: room.code,
        status: room.status,
        playerCount,
        readyCount,
        minPlayers,
        maxPlayers,
        canStart: playerCount >= minPlayers && readyCount === playerCount,
        needsMorePlayers: playerCount < minPlayers,
        players: Object.values(players).map(p => ({
          name: p.name,
          isReady: p.isReady,
          isHost: p.isHost
        }))
      };
      
    } catch (error) {
      console.error('❌ Erreur status salle:', error);
      return { found: false, error: error.message };
    }
  }

  // Démarrer une partie
  async startGame(roomId, gameText = null) {
    try {
      // Vérifier d'abord qu'il y a au moins 2 joueurs
      const roomRef = ref(database, `globalRooms/${roomId}`);
      const roomSnapshot = await get(roomRef);
      
      if (!roomSnapshot.exists()) {
        return { success: false, error: 'Salle introuvable' };
      }
      
      const room = roomSnapshot.val();
      const players = room.players || {};
      const playerCount = Object.keys(players).length;
      
      if (playerCount < 2) {
        return { 
          success: false, 
          error: `Il faut au minimum 2 joueurs pour commencer (actuellement: ${playerCount})` 
        };
      }
      
      // Générer un texte si aucun n'est fourni
      if (!gameText) {
        const difficulty = room.settings?.difficulty || 'medium';
        const textLength = room.settings?.textLength || 'medium';
        gameText = this.generateGameText(difficulty, textLength);
        console.log('🎲 Texte auto-généré pour la partie');
      }
      
      // Vérifier que le texte n'est pas undefined ou vide
      if (!gameText || typeof gameText !== 'string' || gameText.trim() === '') {
        gameText = 'TypeVision - Défi de frappe rapide ! Tapez ce texte le plus rapidement et précisément possible pour remporter la victoire.';
        console.log('⚠️ Texte de fallback utilisé');
      }
      
      console.log(`🎮 Démarrage de la partie avec ${playerCount} joueurs`);
      console.log(`📝 Texte: "${gameText.substring(0, 50)}..."`);
      
      const gameStateRef = ref(database, `globalRooms/${roomId}/gameState`);
      const statusRef = ref(database, `globalRooms/${roomId}/status`);
      
      await update(gameStateRef, {
        status: 'countdown',
        text: gameText,
        startTime: null,
        countdown: 3
      });
      
      await set(statusRef, 'countdown');
      
      // Démarrer le compte à rebours
      setTimeout(async () => {
        await update(gameStateRef, {
          status: 'playing',
          startTime: Date.now(),
          countdown: null
        });
        await set(statusRef, 'playing');
      }, 3000);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur démarrer partie:', error);
      return { success: false, error: 'Erreur de démarrage' };
    }
  }

  // Quitter une salle
  async leaveRoom(roomId) {
    try {
      if (this.currentPlayerId && roomId) {
        console.log('🚪 Quitter la salle:', roomId);
        
        const playerRef = ref(database, `globalRooms/${roomId}/players/${this.currentPlayerId}`);
        await remove(playerRef);
        
        this.removeGlobalRoomListener(roomId);
        this.currentRoomId = null;
        
        // Sortir du mode multijoueur
        await this.exitMultiplayerMode();
        
        // Vérifier si la salle est maintenant vide et la supprimer si nécessaire
        await this.checkAndCleanupRoom(roomId);
        
        console.log('👋 Salle mondiale quittée proprement');
      }
      return { success: true };
    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        console.log('⚠️ Permissions Firebase requises pour quitter - voir FIREBASE_RULES_FIX.md');
      } else {
        console.error('❌ Erreur quitter salle:', error);
      }
      return { success: false };
    }
  }

  // Vérifier et nettoyer une salle si elle est vide
  async checkAndCleanupRoom(roomId) {
    try {
      const roomRef = ref(database, `globalRooms/${roomId}`);
      const snapshot = await get(roomRef);
      
      if (snapshot.exists()) {
        const room = snapshot.val();
        const players = room.players || {};
        const playerCount = Object.keys(players).length;
        
        if (playerCount === 0) {
          await remove(roomRef);
          console.log(`🗑️ Salle ${roomId} supprimée (vide)`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage salle:', error);
    }
  }

  // Nettoyer les salles expirées (côté client)
  async cleanupExpiredRooms() {
    try {
      // Cette fonction pourrait être appelée périodiquement
      // ou implémentée côté serveur avec des Cloud Functions
      console.log('🧹 Nettoyage des salles expirées...');
      
      const roomsRef = ref(database, 'globalRooms');
      const snapshot = await get(roomsRef);
      
      if (snapshot.exists()) {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        snapshot.forEach((childSnapshot) => {
          const room = childSnapshot.val();
          const roomAge = now - (room.createdAt || 0);
          
          if (roomAge > oneHour && room.status === 'waiting') {
            // Salle trop ancienne, la supprimer
            remove(childSnapshot.ref);
          }
        });
      }
    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        console.log('⚠️ Permissions Firebase requises pour le nettoyage - voir FIREBASE_RULES_FIX.md');
      } else {
        console.error('❌ Erreur nettoyage:', error);
      }
    }
  }

  // Obtenir les statistiques locales
  async getLocalStats() {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.default.getItem('localPlayerStats');
      
      return stored ? JSON.parse(stored) : {
        gamesPlayed: 0,
        gamesWon: 0,
        totalWords: 0,
        bestWPM: 0,
        averageAccuracy: 0,
        totalTime: 0,
        lastPlayed: null
      };
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

  // Mettre à jour les statistiques locales
  async updateLocalStats(gameResults) {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const stats = await this.getLocalStats();
      
      stats.gamesPlayed += 1;
      if (gameResults.won) stats.gamesWon += 1;
      stats.totalWords += gameResults.wordsTyped || 0;
      if (gameResults.wpm > stats.bestWPM) stats.bestWPM = gameResults.wpm;
      stats.totalTime += gameResults.gameTime || 0;
      stats.lastPlayed = Date.now();
      
      // Calculer précision moyenne
      const totalAccuracy = (stats.averageAccuracy * (stats.gamesPlayed - 1) + (gameResults.accuracy || 0)) / stats.gamesPlayed;
      stats.averageAccuracy = Math.round(totalAccuracy * 100) / 100;

      await AsyncStorage.default.setItem('localPlayerStats', JSON.stringify(stats));
      
      return { success: true, stats };
    } catch (error) {
      console.error('❌ Erreur mise à jour stats:', error);
      return { success: false, error: 'Impossible de sauvegarder les stats' };
    }
  }

    // Obtenir les statistiques mondiales
  async getGlobalStats() {
    try {
      if (!database) return this.getLocalStats();

      const statsRef = ref(database, 'stats');
      const snapshot = await get(statsRef);
      
      if (snapshot.exists()) {
        return {
          playersOnline: snapshot.val().playersOnline || 0,
          gamesPlayed: snapshot.val().gamesPlayed || 0,
          ...snapshot.val()
        };
      }
      
      return this.getLocalStats();
    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        console.log('⚠️ Permissions Firebase non configurées - voir FIREBASE_RULES_FIX.md');
      } else {
        console.error('❌ Erreur stats mondiales:', error);
      }
      return this.getLocalStats();
    }
  }

  // Obtenir le nombre d'utilisateurs connectés
  async getConnectedUsersCount() {
    try {
      if (!database) return 0;
      
      const presenceRef = ref(database, 'presence');
      const snapshot = await get(presenceRef);
      
      if (!snapshot.exists()) return 0;
      
      let connectedCount = 0;
      const now = Date.now();
      const ACTIVE_THRESHOLD = 2 * 60 * 1000; // 2 minutes
      
      snapshot.forEach((childSnapshot) => {
        const presence = childSnapshot.val();
        if (presence.state === 'online' && 
            presence.inMultiplayer === true &&
            (now - presence.lastSeen) < ACTIVE_THRESHOLD) {
          connectedCount++;
        }
      });
      
      return connectedCount;
    } catch (error) {
      console.error('❌ Erreur comptage utilisateurs:', error);
      return 0;
    }
  }

  // Obtenir le nombre de parties en cours
  async getActiveGamesCount() {
    try {
      if (!database) return 0;
      
      const roomsRef = ref(database, 'globalRooms');
      const snapshot = await get(roomsRef);
      
      if (!snapshot.exists()) return 0;
      
      let activeGamesCount = 0;
      
      snapshot.forEach((childSnapshot) => {
        const room = childSnapshot.val();
        const players = room.players || {};
        const playerCount = Object.keys(players).length;
        
        // Compter les salles avec au moins 2 joueurs
        if (playerCount >= 2 && (room.status === 'waiting' || room.status === 'playing' || room.status === 'countdown')) {
          activeGamesCount++;
        }
      });
      
      return activeGamesCount;
    } catch (error) {
      console.error('❌ Erreur comptage parties:', error);
      return 0;
    }
  }

  // Générer un texte de jeu aléatoire
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
        // Texte de fallback si aucun texte trouvé
        return 'Le défi commence maintenant ! Tapez rapidement et précisément pour remporter la victoire dans cette course effrénée contre vos adversaires du monde entier.';
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
      
      // Si aucun texte filtré, utiliser tous
      if (filteredTexts.length === 0) {
        filteredTexts = allTexts;
      }
      
      // Sélectionner un texte aléatoire
      const randomIndex = Math.floor(Math.random() * filteredTexts.length);
      const selectedText = filteredTexts[randomIndex].text;
      
      console.log(`🎲 Texte généré: ${selectedText.length} caractères`);
      return selectedText;
      
    } catch (error) {
      console.error('❌ Erreur génération texte:', error);
      // Texte de fallback en cas d'erreur
      return 'Bienvenue dans TypeVision ! Montrez vos talents de frappe dans cette compétition mondiale de dactylographie rapide et précise.';
    }
  }

  // Obtenir l'état du countdown pour les parties rapides
  async getCountdownStatus(roomId) {
    try {
      if (!database || !roomId) return null;

      const roomRef = ref(database, `globalRooms/${roomId}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) return null;
      
      const room = snapshot.val();
      
      if (room.status === 'countdown' && room.countdownStarted) {
        const elapsed = Date.now() - room.countdownStarted;
        const remaining = Math.max(0, (room.countdownDuration || 15000) - elapsed);
        
        return {
          active: remaining > 0,
          remaining: Math.ceil(remaining / 1000), // secondes restantes
          total: Math.ceil((room.countdownDuration || 15000) / 1000),
          isQuickMatch: room.settings && room.settings.isPublic
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erreur état countdown:', error);
      return null;
    }
  }

  // Démarrer le compte à rebours automatique pour les parties rapides
  async startQuickMatchCountdown(roomId) {
    try {
      if (!database || !roomId) return;

      console.log('⏰ Démarrage compte à rebours partie rapide (15s)...');
      
      // Mettre à jour le statut de la salle
      await update(ref(database, `globalRooms/${roomId}`), {
        status: 'countdown',
        countdownStarted: Date.now(),
        countdownDuration: 15000, // 15 secondes
        lastActivity: Date.now()
      });

      // Programmer le démarrage automatique dans 15 secondes
      setTimeout(async () => {
        try {
          // Vérifier que la salle existe encore et est toujours en countdown
          const roomRef = ref(database, `globalRooms/${roomId}`);
          const snapshot = await get(roomRef);
          
          if (snapshot.exists()) {
            const room = snapshot.val();
            const playerCount = Object.keys(room.players || {}).length;
            
            if (room.status === 'countdown' && playerCount >= 2) {
              console.log('🚀 Lancement automatique partie rapide !');
              await this.startGame(roomId);
            } else {
              console.log('❌ Conditions non remplies pour lancement auto');
            }
          }
        } catch (error) {
          console.error('❌ Erreur lancement automatique:', error);
        }
      }, 15000);

    } catch (error) {
      console.error('❌ Erreur démarrage countdown:', error);
    }
  }

  // Observer les statistiques en temps réel
  subscribeToStats(callback) {
    try {
      if (!database) {
        callback({ connectedUsers: 0, activeGames: 0, timestamp: Date.now() });
        return null;
      }

      // Observer les présences
      const presenceRef = ref(database, 'presence');
      const roomsRef = ref(database, 'globalRooms');
      
      let presenceData = {};
      let roomsData = {};
      
      const updateStats = () => {
        try {
          // Compter les utilisateurs connectés
          let connectedUsers = 0;
          const now = Date.now();
          const ACTIVE_THRESHOLD = 2 * 60 * 1000; // 2 minutes
          
          Object.values(presenceData).forEach(presence => {
            if (presence.state === 'online' && 
                presence.inMultiplayer === true &&
                (now - presence.lastSeen) < ACTIVE_THRESHOLD) {
              connectedUsers++;
            }
          });
          
          // Compter les parties actives
          let activeGames = 0;
          Object.values(roomsData).forEach(room => {
            const players = room.players || {};
            const playerCount = Object.keys(players).length;
            
            if (playerCount >= 2 && 
                (room.status === 'waiting' || room.status === 'playing' || room.status === 'countdown')) {
              activeGames++;
            }
          });
          
          callback({
            connectedUsers,
            activeGames,
            timestamp: now
          });
        } catch (error) {
          console.error('❌ Erreur calcul stats:', error);
          callback({ connectedUsers: 0, activeGames: 0, timestamp: Date.now() });
        }
      };
      
      // Listener pour les présences
      const presenceUnsubscribe = onValue(presenceRef, (snapshot) => {
        presenceData = snapshot.val() || {};
        updateStats();
      });
      
      // Listener pour les salles
      const roomsUnsubscribe = onValue(roomsRef, (snapshot) => {
        roomsData = snapshot.val() || {};
        updateStats();
      });
      
      // Retourner fonction de désinscription
      return () => {
        presenceUnsubscribe();
        roomsUnsubscribe();
      };
      
    } catch (error) {
      console.error('❌ Erreur subscription stats:', error);
      callback({ connectedUsers: 0, activeGames: 0, timestamp: Date.now() });
      return null;
    }
  }

  // Forcer le nettoyage manuel (pour debug)
  async forceCleanup() {
    console.log('🧹 Nettoyage forcé en cours...');
    await this.cleanupDisconnectedUsers();
    await this.cleanupEmptyRooms();
    const connectedUsers = await this.getConnectedUsersCount();
    console.log(`✅ Nettoyage terminé. ${connectedUsers} utilisateur(s) connecté(s)`);
    return connectedUsers;
  }

  // Debug: Afficher toutes les salles et leur statut
  async debugRooms() {
    try {
      if (!database) {
        console.log('❌ Database non disponible');
        return;
      }

      console.log('🔍 === DEBUG SALLES ===');
      const roomsRef = ref(database, 'globalRooms');
      const snapshot = await get(roomsRef);
      
      if (!snapshot.exists()) {
        console.log('📭 Aucune salle trouvée');
        return;
      }
      
      let totalRooms = 0;
      let myRooms = 0;
      let availableRooms = 0;
      
      snapshot.forEach((childSnapshot) => {
        const roomId = childSnapshot.key;
        const room = childSnapshot.val();
        totalRooms++;
        
        const isMyRoom = room.host === this.currentPlayerId;
        const playerCount = Object.keys(room.players || {}).length;
        const isAvailable = room.status === 'waiting' && 
                           room.settings?.isPublic && 
                           playerCount < (room.settings?.maxPlayers || 4) &&
                           !isMyRoom;
        
        if (isMyRoom) myRooms++;
        if (isAvailable) availableRooms++;
        
        console.log(`📋 Salle ${room.code || roomId}:`);
        console.log(`   - Host: ${room.host} ${isMyRoom ? '(MOI)' : ''}`);
        console.log(`   - Joueurs: ${playerCount}/${room.settings?.maxPlayers || 4}`);
        console.log(`   - Status: ${room.status}`);
        console.log(`   - Public: ${room.settings?.isPublic}`);
        console.log(`   - Disponible: ${isAvailable ? '✅' : '❌'}`);
        
        // Afficher les détails des joueurs
        if (room.players) {
          console.log(`   - Joueurs dans la salle:`);
          Object.values(room.players).forEach(player => {
            console.log(`     * ${player.name || 'Anonyme'} (${player.id})`);
          });
        }
        console.log('   ---');
      });
      
      console.log(`📊 RÉSUMÉ:`);
      console.log(`   - Total salles: ${totalRooms}`);
      console.log(`   - Mes salles: ${myRooms}`);
      console.log(`   - Salles disponibles: ${availableRooms}`);
      console.log(`   - Mon ID: ${this.currentPlayerId}`);
      console.log('🔍 === FIN DEBUG ===');
      
    } catch (error) {
      console.error('❌ Erreur debug salles:', error);
    }
  }

  // Supprimer un utilisateur fantôme spécifique
  async removeGhostUser(userId) {
    try {
      if (!database) {
        console.log('❌ Database non disponible');
        return false;
      }

      console.log(`👻 Suppression de l'utilisateur fantôme: ${userId}`);
      
      const updates = {};
      
      // Supprimer de la présence
      updates[`presence/${userId}`] = null;
      updates[`users/${userId}`] = null;
      
      // Chercher et supprimer de toutes les salles
      const roomsRef = ref(database, 'globalRooms');
      const roomsSnapshot = await get(roomsRef);
      
      if (roomsSnapshot.exists()) {
        roomsSnapshot.forEach((roomSnapshot) => {
          const roomId = roomSnapshot.key;
          const room = roomSnapshot.val();
          
          // Si l'utilisateur fantôme est dans cette salle
          if (room.players && room.players[userId]) {
            updates[`globalRooms/${roomId}/players/${userId}`] = null;
            console.log(`🗑️ Supprimé de la salle ${room.code || roomId}`);
          }
          
          // Si c'est l'hôte de la salle, supprimer toute la salle
          if (room.host === userId) {
            updates[`globalRooms/${roomId}`] = null;
            console.log(`🗑️ Salle supprimée (hôte fantôme): ${room.code || roomId}`);
          }
        });
      }
      
      // Appliquer toutes les suppressions
      await update(ref(database), updates);
      
      console.log(`✅ Utilisateur fantôme ${userId} supprimé avec succès`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erreur suppression utilisateur fantôme ${userId}:`, error);
      return false;
    }
  }

  // Nettoyer TOUS les utilisateurs fantômes
  async cleanupAllGhosts() {
    try {
      if (!database) {
        console.log('❌ Database non disponible');
        return;
      }

      console.log('👻 === NETTOYAGE FANTÔMES ===');
      
      // Obtenir toutes les salles
      const roomsRef = ref(database, 'globalRooms');
      const roomsSnapshot = await get(roomsRef);
      
      if (!roomsSnapshot.exists()) {
        console.log('📭 Aucune salle à nettoyer');
        return;
      }
      
      const ghostUsers = new Set();
      const updates = {};
      let cleanedRooms = 0;
      
      // Identifier tous les utilisateurs dans les salles
      roomsSnapshot.forEach((roomSnapshot) => {
        const roomId = roomSnapshot.key;
        const room = roomSnapshot.val();
        const roomAge = Date.now() - (room.createdAt || 0);
        const MAX_ROOM_AGE = 10 * 60 * 1000; // 10 minutes
        
        // Si la salle est trop ancienne, la supprimer complètement
        if (roomAge > MAX_ROOM_AGE) {
          updates[`globalRooms/${roomId}`] = null;
          cleanedRooms++;
          console.log(`🗑️ Salle expirée supprimée: ${room.code || roomId} (${Math.round(roomAge/60000)}min)`);
          return;
        }
        
        // Vérifier les joueurs dans la salle
        if (room.players) {
          Object.keys(room.players).forEach(playerId => {
            // Si ce n'est pas moi, c'est potentiellement un fantôme
            if (playerId !== this.currentPlayerId) {
              ghostUsers.add(playerId);
            }
          });
        }
      });
      
      // Vérifier quels utilisateurs sont réellement connectés
      const presenceRef = ref(database, 'presence');
      const presenceSnapshot = await get(presenceRef);
      
      const now = Date.now();
      const ACTIVE_THRESHOLD = 2 * 60 * 1000; // 2 minutes
      
      for (const userId of ghostUsers) {
        let isGhost = true;
        
        if (presenceSnapshot.exists()) {
          const userPresence = presenceSnapshot.child(userId).val();
          if (userPresence && 
              userPresence.state === 'online' && 
              (now - userPresence.lastSeen) < ACTIVE_THRESHOLD) {
            isGhost = false; // Utilisateur vraiment actif
          }
        }
        
        if (isGhost) {
          console.log(`👻 Utilisateur fantôme détecté: ${userId}`);
          await this.removeGhostUser(userId);
        } else {
          console.log(`✅ Utilisateur actif confirmé: ${userId}`);
        }
      }
      
      // Appliquer les suppressions de salles expirées
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
      }
      
      console.log(`✅ Nettoyage fantômes terminé. ${cleanedRooms} salle(s) expirée(s) supprimée(s)`);
      console.log('👻 === FIN NETTOYAGE ===');
      
    } catch (error) {
      console.error('❌ Erreur nettoyage fantômes:', error);
    }
  }
}

// Instance globale du service
export const globalMultiplayerService = new GlobalMultiplayerService();
export default globalMultiplayerService;
