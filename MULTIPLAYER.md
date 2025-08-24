# 🌍 Multijoueur Mondial - TypeVision

## Vue d'ensemble

TypeVision dispose maintenant d'un **système multijoueur mondial** qui permet aux joueurs du monde entier de s'affronter en temps réel dans des courses de frappe !

## 🚀 Fonctionnalités

### ✨ Multijoueur en Temps Réel
- **Connexion mondiale** : Jouez avec n'importe qui dans le monde
- **Synchronisation en temps réel** : Utilise Firebase Realtime Database
- **Présence en ligne** : Détection automatique des connexions/déconnexions
- **Authentification anonyme** : Pas besoin de créer un compte

### 🎮 Modes de Jeu
1. **Partie Rapide** : Rejoint automatiquement une partie ou en crée une nouvelle
2. **Créer une Salle** : Créez votre propre salle publique
3. **Rejoindre une Salle** : Utilisez un code à 6 chiffres pour rejoindre une salle spécifique

### 📊 Statistiques en Temps Réel
- **Joueurs en ligne** : Nombre total de joueurs connectés
- **Salles en attente** : Salles ouvertes recherchant des joueurs
- **Parties en cours** : Nombre de parties actuellement jouées

## 🛠 Architecture Technique

### Services Principaux

#### `globalMultiplayerService.js`
- **Gestion des connexions** : Authentification Firebase automatique
- **Gestion des salles** : Création, recherche, et gestion des salles mondiales
- **Synchronisation** : Mise à jour en temps réel de l'état des parties
- **Présence** : Détection des joueurs en ligne/hors ligne

#### `firebase.js`
- **Configuration Firebase** : Projet TypeVision Multiplayer
- **Authentification** : Persistance avec AsyncStorage
- **Base de données** : Firebase Realtime Database Europe West 1

### Structure des Données

```javascript
globalRooms/
├── {roomId}/
│   ├── code: "123456"           // Code à 6 chiffres
│   ├── host: "user-id"          // ID de l'hôte
│   ├── status: "waiting"        // waiting | countdown | playing | finished
│   ├── region: "global"         // Indique une salle mondiale
│   ├── settings: {
│   │   ├── maxPlayers: 4
│   │   ├── difficulty: "medium"
│   │   ├── isPublic: true
│   │   └── language: "fr"
│   ├── players: {
│   │   └── {playerId}: {
│   │       ├── name: "Joueur"
│   │       ├── isReady: false
│   │       ├── avatar: "🌍"
│   │       └── country: "FR"
│   │   }
│   └── gameState: {
│       ├── status: "waiting"
│       ├── text: null
│       ├── startTime: null
│       └── results: {}
│   }
```

## 🎯 Interface Utilisateur

### Écran Principal (`MultiplayerScreen.js`)
- **Badge Mondial** : Indique le mode multijoueur mondial
- **Statistiques Live** : Affiche les stats en temps réel
- **Options de Jeu** : Partie rapide, créer, rejoindre

### Lobby de Salle (`MultiplayerLobbyScreen.js`)
- **Liste des Joueurs** : Voir tous les joueurs connectés
- **État de Préparation** : Système de "prêt" pour tous les joueurs
- **Partage de Code** : Partager le code de salle facilement

### Jeu Multijoueur (`MultiplayerGameScreen.js`)
- **Synchronisation** : Texte et démarrage synchronisés
- **Compte à Rebours** : Démarrage simultané pour tous
- **Résultats** : Classement en temps réel

## 🔧 Configuration Firebase

Le projet utilise une configuration Firebase réelle :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDvK5Z8XqGpBjN-7LrYzFjMtBcUyh3FzCg",
  authDomain: "typevision-multiplayer.firebaseapp.com",
  databaseURL: "https://typevision-multiplayer-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "typevision-multiplayer"
  // ...
};
```

## 🚀 Utilisation

### Pour les Joueurs

1. **Lancer l'App** → L'authentification se fait automatiquement
2. **Aller dans Multijoueur** → Voir les statistiques mondiales
3. **Choisir un Mode** :
   - **Partie Rapide** : Rejoint automatiquement une partie
   - **Créer une Salle** : Invitez des amis avec un code
   - **Rejoindre** : Utilisez un code partagé

### Pour les Développeurs

```javascript
import { globalMultiplayerService } from './services/globalMultiplayerService';

// Créer une salle mondiale
const result = await globalMultiplayerService.createGlobalRoom(playerName, {
  maxPlayers: 4,
  difficulty: 'medium',
  isPublic: true
});

// Rejoindre une salle
const result = await globalMultiplayerService.joinGlobalRoom(roomCode, playerName);

// Partie rapide
const result = await globalMultiplayerService.findGlobalQuickMatch(playerName, 'medium');
```

## 🔒 Sécurité

- **Authentification anonyme** : Pas de données personnelles stockées
- **Salles temporaires** : Auto-suppression après inactivité
- **Validation côté serveur** : Règles Firebase Realtime Database
- **Nettoyage automatique** : Suppression des salles expirées

## 📱 Compatibilité

- ✅ **iOS** : Expo Go et builds natifs
- ✅ **Android** : Expo Go et builds natifs  
- ✅ **Web** : Navigateurs modernes
- ✅ **Temps réel** : Synchronisation instantanée

## 🌟 Avantages

1. **Mondial** : Joueurs du monde entier
2. **Instantané** : Pas de délai de synchronisation
3. **Fiable** : Infrastructure Firebase Google
4. **Scalable** : Supporte des milliers de joueurs simultanés
5. **Simple** : Interface intuitive et codes de salle faciles

## 🎮 Prochaines Fonctionnalités

- 🏆 **Classements mondiaux**
- 🎯 **Tournois organisés**
- 💬 **Chat en temps réel**
- 🌍 **Détection de région automatique**
- 🎨 **Avatars personnalisés**
- 📊 **Statistiques détaillées**

---

*Prêt à défier le monde ? Lancez TypeVision et commencez à taper !* 🚀
