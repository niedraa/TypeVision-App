# ⏰ Système de Countdown Automatique - Parties Rapides

## Nouveau Comportement

### 🏃 Parties Rapides (Quick Match)
- **Démarrage automatique** : Dès que 2 joueurs sont connectés
- **Countdown** : 15 secondes avant le lancement
- **Pas de système "prêt"** : Les joueurs n'ont plus besoin de se marquer prêts
- **Maximum 6 joueurs** : D'autres joueurs peuvent rejoindre pendant le countdown

### 🎨 Parties Personnalisées (Custom)
- **Système "prêt" conservé** : Tous les joueurs doivent se marquer prêts
- **Minimum 2 joueurs** : Requis avant de pouvoir démarrer
- **Maximum 6 joueurs** : Configurable par l'hôte
- **Contrôle total** : L'hôte décide quand lancer la partie

## Nouvelles Méthodes API

### GlobalMultiplayerService

```javascript
// Obtenir l'état du countdown
const countdownStatus = await globalMultiplayerService.getCountdownStatus(roomId);
if (countdownStatus) {
  console.log(`Countdown: ${countdownStatus.remaining}s restantes`);
  console.log(`Partie rapide: ${countdownStatus.isQuickMatch}`);
}

// Démarrer un countdown automatique (utilisé automatiquement)
await globalMultiplayerService.startQuickMatchCountdown(roomId);

// Vérifier si une partie peut démarrer (maintenant avec distinction)
const canStart = await globalMultiplayerService.canStartGame(roomId);
console.log(`Peut démarrer: ${canStart.canStart}`);
console.log(`Partie rapide: ${canStart.isQuickMatch}`);
```

### Logique Automatique

```javascript
// Quand un 2ème joueur rejoint une partie rapide
if (isQuickMatch && playerCount >= 2) {
  // Countdown automatique de 15 secondes
  await startQuickMatchCountdown(roomId);
  
  setTimeout(() => {
    // Lancement automatique après 15s
    if (playerCount >= 2) {
      startGame(roomId);
    }
  }, 15000);
}
```

## Intégration Interface Utilisateur

### Écran Partie Rapide

```javascript
import React, { useState, useEffect } from 'react';

const QuickMatchScreen = ({ roomId }) => {
  const [countdown, setCountdown] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Surveiller le countdown
    const checkCountdown = async () => {
      const status = await globalMultiplayerService.getCountdownStatus(roomId);
      setCountdown(status);
    };

    const interval = setInterval(checkCountdown, 1000);
    return () => clearInterval(interval);
  }, [roomId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partie Rapide</Text>
      
      {/* Affichage joueurs */}
      <Text>{players.length}/6 joueurs connectés</Text>
      
      {/* Countdown automatique */}
      {countdown && countdown.active ? (
        <View style={styles.countdown}>
          <Text style={styles.countdownText}>
            Démarrage dans {countdown.remaining}s
          </Text>
          <Text style={styles.info}>
            D'autres joueurs peuvent encore rejoindre !
          </Text>
        </View>
      ) : (
        <Text style={styles.waiting}>
          En attente d'un autre joueur...
        </Text>
      )}
      
      {/* Pas de bouton "Prêt" pour les parties rapides */}
    </View>
  );
};
```

### Écran Partie Personnalisée

```javascript
const CustomGameScreen = ({ roomId, isHost }) => {
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const toggleReady = async () => {
    const result = await globalMultiplayerService.setPlayerReady(roomId, !isReady);
    if (result.success) {
      setIsReady(!isReady);
    } else {
      alert(result.error); // Affiche les messages d'erreur
    }
  };

  const startGame = async () => {
    const canStart = await globalMultiplayerService.canStartGame(roomId);
    if (canStart.canStart) {
      await globalMultiplayerService.startGame(roomId);
    } else {
      alert(canStart.reason);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partie Personnalisée</Text>
      
      {/* Liste des joueurs avec statut prêt */}
      {players.map(player => (
        <Text key={player.id}>
          {player.name} {player.isReady ? '✅' : '❌'}
        </Text>
      ))}
      
      {/* Bouton prêt pour tous */}
      <TouchableOpacity onPress={toggleReady}>
        <Text>{isReady ? 'Annuler' : 'Prêt'}</Text>
      </TouchableOpacity>
      
      {/* Bouton démarrer pour l'hôte */}
      {isHost && (
        <TouchableOpacity onPress={startGame}>
          <Text>Démarrer la partie</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

## Messages d'Erreur

### Partie Rapide
```javascript
// Si quelqu'un essaie de se marquer prêt
"Les parties rapides démarrent automatiquement, pas besoin d'être prêt !"
```

### Partie Personnalisée
```javascript
// Si pas assez de joueurs
"Attendez qu'un autre joueur rejoigne la salle (1/2 minimum)"

// Si pas tous prêts
"Tous les joueurs doivent être prêts (2/3)"
```

## Flux de Données

### 1. Création Partie Rapide
```
Joueur 1 crée → Salle "waiting" → Attend autres joueurs
```

### 2. Joueur 2 Rejoint
```
Joueur 2 rejoint → playerCount = 2 → Auto-trigger countdown 15s
```

### 3. Countdown Actif
```
Status: "countdown" → countdownStarted: timestamp → Autres peuvent rejoindre
```

### 4. Fin Countdown
```
15s écoulées → playerCount >= 2 → Auto-start game
```

## Détection Type de Partie

```javascript
// Dans la base de données Firebase
const room = {
  settings: {
    isPublic: true,    // = Partie rapide
    isPublic: false,   // = Partie personnalisée
    // ...
  }
}

// Dans le code
const isQuickMatch = room.settings && room.settings.isPublic;
```

## Surveillance Temps Réel

```javascript
// Observer les changements de salle
const roomRef = ref(database, `globalRooms/${roomId}`);
onValue(roomRef, (snapshot) => {
  const room = snapshot.val();
  
  if (room.status === 'countdown') {
    // Afficher countdown
    updateCountdownUI(room);
  } else if (room.status === 'playing') {
    // Naviguer vers le jeu
    navigateToGame();
  }
});
```

## Tests et Validation

### Tester Partie Rapide
1. Créer partie rapide avec Joueur 1
2. Rejoindre avec Joueur 2
3. Vérifier countdown automatique de 15s
4. Confirmer démarrage auto après 15s
5. Tester avec 3+ joueurs qui rejoignent pendant countdown

### Tester Partie Personnalisée
1. Créer partie personnalisée
2. Vérifier que le système "prêt" fonctionne toujours
3. Confirmer que le minimum 2 joueurs est respecté
4. Tester maximum 6 joueurs

## Notes Importantes

- **Persistance** : Le countdown survit aux déconnexions réseau temporaires
- **Synchronisation** : Tous les clients voient le même countdown
- **Optimisation** : Un seul timer côté serveur évite les désynchronisations
- **Fallback** : En cas d'erreur, la partie peut toujours être lancée manuellement
