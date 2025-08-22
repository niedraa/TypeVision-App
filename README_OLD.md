# TypeVision (Expo)

Projet Expo minimal pour iOS (Expo Go).

Prérequis
- Node.js (16+ recommandé)
- npm ou yarn
- Expo Go app sur votre iPhone ou iPad (App Store)

Installation et exécution (macOS, zsh)

```bash
# depuis le dossier du projet
cd /Users/matthieu/TypeVision-final
npm install
npx expo start
```

Ensuite, ouvrez l'app Expo Go sur votre appareil iOS et scannez le QR affiché dans le terminal ou dans le navigateur `http://localhost:19002`.

Pour lancer sur le simulateur iOS (si vous avez Xcode installé):

```bash
npx expo start --ios
```

Notes
- Les images `assets/icon.png` et `assets/splash.png` ne sont pas incluses: placez vos images dans `assets/` ou remplacez les chemins dans `app.json`.
- Ce projet est un point de départ; ajoutez vos dépendances et fonctionnalités selon vos besoins.
