# 📊 Mise à Jour Statistiques Multijoueur

## Nouvelles Fonctionnalités

### 1. Affichage en Temps Réel
- **Nombre de joueurs connectés** : Utilisateurs actifs en mode multijoueur
- **Nombre de parties en cours** : Salles avec 2+ joueurs actifs

### 2. Limites de Joueurs Mises à Jour
- **Minimum** : 2 joueurs (parties rapides et personnalisées)
- **Maximum** : 6 joueurs (augmenté de 4 à 6)

## Nouvelles Méthodes API

### GlobalMultiplayerService

```javascript
// Obtenir le nombre d'utilisateurs connectés
const connectedUsers = await globalMultiplayerService.getConnectedUsersCount();

// Obtenir le nombre de parties actives
const activeGames = await globalMultiplayerService.getActiveGamesCount();

// Obtenir statistiques complètes
const stats = await globalMultiplayerService.getMultiplayerStats();
// Retourne: { connectedUsers: number, activeGames: number, timestamp: number }

// Surveiller les statistiques en temps réel
const unsubscribe = globalMultiplayerService.subscribeToStats((stats) => {
  console.log('Stats mises à jour:', stats);
  // Mettre à jour l'interface utilisateur
});

// Arrêter la surveillance
unsubscribe();
```

### MockMultiplayerService

```javascript
// Mêmes méthodes disponibles pour le mode local
const stats = await mockMultiplayerService.getMultiplayerStats();
const unsubscribe = mockMultiplayerService.subscribeToStats(callback);
```

## Intégration dans l'Interface

### Exemple d'utilisation dans un écran React Native

```javascript
import React, { useState, useEffect } from 'react';
import { globalMultiplayerService } from '../services/globalMultiplayerService';

const MultiplayerScreen = () => {
  const [stats, setStats] = useState({
    connectedUsers: 0,
    activeGames: 0,
    timestamp: Date.now()
  });

  useEffect(() => {
    // S'abonner aux statistiques en temps réel
    const unsubscribe = globalMultiplayerService.subscribeToStats(setStats);

    // Nettoyage lors du démontage
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>TypeVision Multijoueur</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.connectedUsers}</Text>
          <Text style={styles.statLabel}>Joueurs en ligne</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.activeGames}</Text>
          <Text style={styles.statLabel}>Parties en cours</Text>
        </View>
      </View>
      
      {/* Afficher les limites */}
      <Text style={styles.info}>
        Joueurs par partie: 2-6 joueurs
      </Text>
    </View>
  );
};
```

## Détails Techniques

### Comptage des Utilisateurs Connectés
- Basé sur la présence Firebase (`presence` node)
- Filtre les utilisateurs avec `inMultiplayer: true`
- Seuil d'activité : 2 minutes depuis le dernier heartbeat

### Comptage des Parties Actives
- Basé sur les salles Firebase (`globalRooms` node)
- Filtre les salles avec 2+ joueurs
- Statuts valides : `waiting`, `playing`, `countdown`

### Optimisations de Performance
- Listeners Firebase pour mises à jour en temps réel
- Calculs locaux pour éviter les requêtes répétées
- Seuils de temps pour filtrer les données obsolètes

## Mise à Jour des Limites de Joueurs

### Parties Rapides
```javascript
// Ancienne limite : 2-4 joueurs
// Nouvelle limite : 2-6 joueurs
await globalMultiplayerService.findGlobalQuickMatch(playerName, difficulty);
```

### Parties Personnalisées
```javascript
// Validation automatique des limites
const roomData = {
  maxPlayers: 8, // Sera automatiquement limité à 6
  // ...autres paramètres
};

const result = await globalMultiplayerService.createCustomRoom(roomData);
// room.settings.maxPlayers sera 6 (maximum autorisé)
```

## Tests et Validation

### Tester les Statistiques
```javascript
// Test manuel des compteurs
const stats = await globalMultiplayerService.getMultiplayerStats();
console.log('Statistiques actuelles:', stats);

// Test des limites de joueurs
const roomData = { maxPlayers: 10 }; // Sera limité à 6
const result = await globalMultiplayerService.createCustomRoom(roomData);
console.log('Max players effectif:', result.room.settings.maxPlayers);
```

### Surveillance en Développement
```javascript
// Activer les logs détaillés
globalMultiplayerService.subscribeToStats((stats) => {
  console.log(`🟢 ${stats.connectedUsers} joueurs | 🎮 ${stats.activeGames} parties`);
});
```

## Notes Important

1. **Performance** : Les statistiques sont mises à jour en temps réel mais avec un throttling intelligent
2. **Précision** : Le comptage peut avoir un délai de quelques secondes due à la synchronisation Firebase
3. **Fallback** : En cas d'erreur, les compteurs retournent 0 plutôt que de planter
4. **Compatibilité** : Toutes les méthodes sont disponibles dans les deux services (global et mock)

## Prochaines Étapes

1. Intégrer les statistiques dans `MultiplayerScreen.js`
2. Ajouter des indicateurs visuels (icônes, couleurs)
3. Tester avec plusieurs appareils
4. Optimiser la fréquence de mise à jour selon les besoins
