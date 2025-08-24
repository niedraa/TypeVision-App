# Configuration Firebase pour TypeVision

## Instructions pour configurer Firebase

### 1. Créer un projet Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet (ex: "typevision-multiplayer")
4. Désactivez Google Analytics (optionnel)
5. Créez le projet

### 2. Configurer la base de données en temps réel
1. Dans le menu latéral, cliquez sur "Realtime Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez une localisation (europe-west1 recommandé)
4. Commencez en mode test (règles de sécurité ouvertes temporairement)

### 3. Ajouter votre application
1. Cliquez sur l'icône Web "</>" pour ajouter une app web
2. Enregistrez l'app avec un nom (ex: "TypeVision")
3. Copiez la configuration fournie

### 4. Mettre à jour le fichier firebase.js
Remplacez les valeurs dans `/services/firebase.js` avec votre vraie configuration :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://VOTRE_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

### 5. Configurer les règles de sécurité
Dans Realtime Database → Règles, utilisez ces règles pour commencer :

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["status", "createdAt"]
      }
    },
    "matchmaking": {
      ".read": true,
      ".write": true,
      ".indexOn": ["difficulty", "createdAt"]
    }
  }
}
```

### 6. Activer l'authentification (optionnel)
Si vous voulez des comptes utilisateurs persistants :
1. Allez dans Authentication → Sign-in method
2. Activez "Anonyme" pour commencer
3. Optionnellement, activez Email/Password

## Fonctionnalités du système multiplayer

### ✅ Fonctionnalités implémentées
- **Parties rapides** : Matchmaking automatique
- **Salles privées** : Création et partage de codes à 6 chiffres
- **Jeu en temps réel** : Synchronisation des progressions
- **Système de lobby** : Attente des joueurs, états "prêt"
- **Classement en direct** : Affichage des positions pendant le jeu
- **Nettoyage automatique** : Suppression des salles expirées

### 🎮 Types de jeu supportés
- **Course** : Premier à finir le texte
- **Précision** : Moins d'erreurs gagne
- **Vitesse** : Mots par minute

### 🔧 Paramètres configurables
- Nombre max de joueurs (2-8)
- Difficulté des textes
- Temps de préparation
- Durée des parties

### 📱 Interface utilisateur
- **Écran principal** : Partie rapide, créer/rejoindre une salle
- **Lobby** : Liste des joueurs, états de préparation, partage de code
- **Jeu** : Barres de progression temps réel, classement, chronomètre
- **Résultats** : Classement final, statistiques, option rejouer

## Test de l'application

1. Configurez Firebase avec vos vraies clés
2. Lancez l'app : `npm start`
3. Testez le multijoueur :
   - Créez une salle
   - Rejoignez avec un autre appareil/émulateur
   - Lancez une partie et testez la synchronisation

Le système est conçu pour être robuste et gérer les déconnexions, reconnexions et états incohérents.
