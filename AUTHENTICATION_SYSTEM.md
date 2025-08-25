# 🔐 Système d'Authentification TypeVision

## 📱 Modes d'Authentification Disponibles

### ✅ 1. Connexion Invité
- **Accès immédiat** sans inscription
- **Sauvegarde locale** des scores
- **Aucune donnée personnelle** requise
- **Idéal pour** essayer l'application

### ✅ 2. Authentification Email/Mot de passe
#### Se connecter
- **Connexion** avec compte existant
- **Validation** des identifiants Firebase
- **Récupération** du profil utilisateur

#### Créer un compte
- **Création automatique** de compte Firebase
- **Validation** email et mot de passe (min. 6 caractères)
- **Profil personnalisé** généré automatiquement

## 🎨 Interface Utilisateur

### Sélecteur de Mode
Interface avec 2 onglets :
- 👤 **Invité** - Accès rapide
- 📧 **Compte** - Email avec toggle Connexion/Création

### Toggle Connexion/Création
Dans le mode Email :
- **Se connecter** - Pour comptes existants
- **Créer un compte** - Pour nouveaux utilisateurs

### Messages Informatifs Adaptatifs
- **Mode Invité** : "Sauvegarde locale des scores"
- **Mode Connexion** : "Récupération de votre profil"
- **Mode Création** : "Synchronisation cloud des scores"

## 🔧 Configuration Firebase

### Providers Activés
- ✅ **Email/Password** - Activé
- ✅ **Anonymous** - Activé (pour invités)
- ❌ **Phone** - Supprimé (simplifié)

### Fonctionnalités
- **Création de comptes** email séparée de la connexion
- **Validation côté client** (email, mot de passe)
- **Gestion d'erreurs** spécifique par action
- **Fallback gracieux** si Firebase indisponible

## 🔄 Flux d'Authentification

### Mode Invité
```
Utilisateur clique "Jouer maintenant"
  ↓
Création utilisateur local temporaire
  ↓
Accès immédiat à l'application
```

### Mode Email - Connexion
```
Utilisateur sélectionne "Se connecter"
  ↓
Saisie email + mot de passe
  ↓
Vérification Firebase
  ↓
Si compte existe → Connexion réussie
  ↓
Si compte n'existe pas → Erreur explicite
```

### Mode Email - Création
```
Utilisateur sélectionne "Créer un compte"
  ↓
Saisie email + mot de passe (validation)
  ↓
Création compte Firebase
  ↓
Si email libre → Compte créé + connexion
  ↓
Si email utilisé → Erreur explicite
```

## 🛡️ Sécurité

### Validation Côté Client
- **Email** : Format valide requis
- **Mot de passe** : Minimum 6 caractères
- **Feedback immédiat** sur erreurs de saisie

### Gestion des Erreurs Firebase
- **auth/user-not-found** : "Aucun compte trouvé"
- **auth/wrong-password** : "Mot de passe incorrect"
- **auth/email-already-in-use** : "Email déjà utilisé"
- **auth/weak-password** : "Mot de passe trop faible"
- **auth/too-many-requests** : Protection anti-spam

### Données Stockées
- **Firebase** : Profils utilisateurs, scores cloud
- **Local** : Cache session, scores locaux
- **Aucun mot de passe** stocké localement

## 📱 Expérience Mobile

### Optimisations
- **Toggle visuel** connexion/création
- **Validation en temps réel** des champs
- **Messages d'erreur** contextuels
- **Clavier adaptatif** (email, secure)

### États de Loading
- **Texte adaptatif** : "Connexion..." / "Création..."
- **Boutons désactivés** pendant traitement
- **Feedback visuel** avec spinner

## 🧪 Tests

### Scénarios à Tester
1. **Mode Invité** : Doit fonctionner instantanément
2. **Création compte** : Email valide + mot de passe 6+ caractères
3. **Connexion existant** : Utiliser compte créé précédemment
4. **Erreurs** : Email invalide, mot de passe court, compte inexistant

### Cas d'Erreur
- Email déjà utilisé lors de la création
- Mauvais identifiants lors de la connexion
- Mot de passe trop court
- Format email invalide
- Connexion réseau perdue

## 🚀 Déploiement

### Développement
```bash
npx expo start
```

### Production
- **Firebase Console** : Email/Password activé
- **Domaines autorisés** : Configurés pour l'app
- **Quotas** : Vérifier limites créations de comptes

## 📊 Analytics Recommandées

### Métriques Utiles
- **Répartition** Invité vs Compte (%)
- **Taux de conversion** Invité → Compte créé
- **Échecs de connexion** par type d'erreur
- **Taux d'abandon** sur formulaire de création

## 🔍 Débogage

### Logs de Succès
```
📧 Connexion avec email: user@example.com
✅ Connexion email réussie: uid123
� Création compte email: newuser@example.com
✅ Compte email créé: uid456
```

### Logs d'Erreur
```
❌ Erreur connexion email: auth/user-not-found
❌ Erreur création compte email: auth/email-already-in-use
```

---

**Système simplifié** : Deux modes clairs (Invité/Compte) avec interface intuitive pour création et connexion séparées.
