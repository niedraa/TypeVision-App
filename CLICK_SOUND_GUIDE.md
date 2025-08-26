# Guide d'utilisation de l'effet sonore de clic

## 🔊 Système d'effets sonores

L'application TypeVision intègre maintenant un système d'effets sonores qui joue automatiquement un son de clic (`click.mp3`) sur tous les boutons de l'application.

## 📁 Fichiers mis à jour

### Services
- `services/AudioService.js` - Service principal pour gérer les effets sonores
- `services/MusicService.js` - Service pour la musique de fond (déjà existant)

### Utilitaires
- `utils/useClickSound.js` - Hook et fonctions utilitaires pour ajouter facilement l'effet sonore

### Composants
- `components/AnimatedButton.js` - Bouton animé avec effet sonore intégré

## 🎯 Comment utiliser l'effet sonore

### Méthode 1: Utiliser AnimatedButton (Recommandé)
```jsx
import { AnimatedButton } from '../components/AnimatedButton';

// L'effet sonore est automatiquement ajouté
<AnimatedButton onPress={handlePress} style={styles.button}>
  <Text>Mon bouton</Text>
</AnimatedButton>
```

### Méthode 2: Wrapper withClickSound
```jsx
import { withClickSound } from '../utils/useClickSound';

<TouchableOpacity onPress={withClickSound(handlePress)}>
  <Text>Mon bouton</Text>
</TouchableOpacity>
```

### Méthode 3: Hook useClickSound
```jsx
import { useClickSound } from '../utils/useClickSound';

function MonComposant() {
  const handlePressWithSound = useClickSound(handlePress);
  
  return (
    <TouchableOpacity onPress={handlePressWithSound}>
      <Text>Mon bouton</Text>
    </TouchableOpacity>
  );
}
```

### Méthode 4: Service direct
```jsx
import audioService from '../services/AudioService';

const handlePress = () => {
  audioService.playClickSound();
  // Votre logique ici
};
```

## 📝 Écrans déjà mis à jour

Les écrans suivants ont été automatiquement mis à jour avec l'effet sonore :

- ✅ `screens/MultiplayerScreen.js`
- ✅ `screens/SettingsScreen.js` 
- ✅ `screens/LoginScreen.js`
- ✅ `ShopScreen.js`
- ✅ `components/AnimatedButton.js`

## 🔧 Configuration

L'effet sonore se charge automatiquement au démarrage de l'application dans `App.js`.

Le fichier audio utilisé est : `assets/audio/music/click.mp3`

## 🎵 Fonctionnalités

- ✅ Chargement automatique du son au démarrage
- ✅ Gestion d'erreur si le fichier audio n'existe pas
- ✅ Performance optimisée (pas de rechargement à chaque clic)
- ✅ Compatible avec les paramètres audio système
- ✅ Intégration facile dans les nouveaux composants

## 🚀 Pour les nouveaux boutons

Pour tous les nouveaux boutons que vous créerez, utilisez simplement `withClickSound()` autour de votre fonction `onPress` :

```jsx
// Ancien code
<TouchableOpacity onPress={monAction}>

// Nouveau code
<TouchableOpacity onPress={withClickSound(monAction)}>
```

L'effet sonore sera automatiquement ajouté ! 🎉
