# Instructions pour configurer la musique

## Étapes pour ajouter votre musique :

1. **Placez votre fichier de musique** :
   - Copiez votre fichier `music.mp3` dans le dossier `/Users/matthieu/TypeVision-App/assets/audio/music/`
   - Assurez-vous que le fichier s'appelle exactement `music.mp3`

2. **Formats supportés** :
   - MP3 (recommandé)
   - WAV
   - M4A
   - AAC

3. **Fonctionnalités du système de musique** :
   - ✅ Lecture automatique au démarrage de l'app
   - ✅ Musique en boucle
   - ✅ Contrôles de lecture/pause
   - ✅ Contrôle du volume
   - ✅ Interface de contrôle en haut à droite de l'écran

## Utilisation :

### Dans l'application :
- **Bouton Play/Pause** : Contrôle la lecture de la musique
- **Boutons Volume** : Augmentent/diminuent le volume (🔉/🔊)
- **Affichage du volume** : Montre le pourcentage du volume actuel

### Depuis le code :
```javascript
import musicService from './services/MusicService';

// Jouer la musique
await musicService.playMusic();

// Mettre en pause
await musicService.pauseMusic();

// Changer le volume (0.0 à 1.0)
await musicService.setVolume(0.8);

// Basculer lecture/pause
await musicService.toggleMusic();

// Activer/désactiver la boucle
await musicService.setLooping(true);
```

## Test :
Une fois votre fichier `music.mp3` placé dans le bon dossier, redémarrez l'application avec Expo Go pour entendre la musique de fond.

La musique démarrera automatiquement après l'écran de chargement (3 secondes).
