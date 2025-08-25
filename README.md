# TypeVision 🎯

TypeVision est une application mobile de frappe tactile moderne développée avec React Native et Expo SDK 53. L'application offre une expérience utilisateur complète avec authentification, système de profil, mode histoire, multijoueur et boutique intégrée avec Stripe.

## 🚀 Fonctionnalités

### 🔐 Système d'authentification
- Connexion utilisateur avec compte
- Mode invité avec pseudo aléatoire (user_XXXXXXX)
- Gestion des sessions utilisateur

### 👤 Système de profil complet
- Profil utilisateur personnalisé
- Statistiques de jeu détaillées
- Système d'achievements/succès
- Paramètres utilisateur
- Gestion du compte

### 🎮 Modes de jeu
- **Multiplayer** : Mode multijoueur avec :
  - Partie rapide
  - Création/Rejoindre un salon
  - Inviter des amis
  - Code de salon

### 🛒 Boutique intégrée
- Intégration Stripe complète (live)
- Système de paiement sécurisé
- Gestion des produits dynamique
- Compatible iOS/Android

### 🎨 Interface utilisateur
- Animations fluides et transitions
- Design moderne et responsive
- Écrans de chargement animés
- Composants réutilisables

## 🛠️ Technologies utilisées

- **React Native** 0.79.5
- **Expo SDK** 53.0.22
- **React** 19.0.0
- **Stripe API** (intégration live)
- **Expo Vector Icons**
- **React Native Animations**

## 📁 Structure du projet

```
TypeVision-final/
├── App.js                 # Point d'entrée principal
├── screens/               # Écrans de l'application
│   ├── LoginScreen.js     # Écran de connexion
│   ├── ProfileScreen.js   # Écran de profil
│   ├── MultiplayerScreen.js # Mode multijoueur
│   └── LoadingScreen.js   # Écran de chargement
├── components/            # Composants réutilisables
│   ├── AnimatedButton.js  # Boutons animés
│   └── Transitions.js     # Animations de transition
├── services/              # Services externes
│   └── stripe.js         # Configuration Stripe
├── utils/                 # Utilitaires
│   └── userUtils.js      # Gestion des utilisateurs
├── ShopScreen.js         # Écran boutique
├── SuccessScreen.js      # Écran de succès paiement
└── CancelScreen.js       # Écran d'annulation paiement
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 18 ou plus)
- npm ou yarn
- Expo CLI
- Compte Stripe (pour la boutique)

### Installation

```bash
# Cloner le repository
git clone https://github.com/[votre-username]/TypeVision.git
cd TypeVision

# Installer les dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Ajouter vos clés Stripe dans le fichier .env
```

### Configuration Stripe

Créez un fichier `.env` à la racine du projet :

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Démarrage

```bash
# Démarrer le serveur de développement
npx expo start

# Ou avec cache clear
npx expo start --clear
```

## 📱 Utilisation

1. **Première connexion** : Choisissez entre créer un compte ou continuer en tant qu'invité
2. **Navigation** : Utilisez le menu principal pour accéder aux différents modes
3. **Profil** : Consultez vos statistiques et gérez votre compte
4. **Multijoueur** : Rejoignez ou créez des salons de jeu
5. **Boutique** : Achetez des skins et contenus premium

## 🎯 Fonctionnalités à venir

- [ ] Système de classement global
- [ ] Mode tournoi
- [ ] Chat en temps réel
- [ ] Personnalisation avancée
- [ ] Mode entraînement avec leçons

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Développeur

Développé avec ❤️ par Matthieu

## 📞 Support

Pour toute question ou support, n'hésitez pas à ouvrir une issue sur GitHub.

---

⭐ N'oubliez pas de star le projet si vous l'aimez !
