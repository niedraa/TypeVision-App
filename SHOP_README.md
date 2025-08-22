# TypeVision - Shop Stripe Intégré

## 🎯 Fonctionnalités

✅ **Interface Shop moderne** - Design fidèle aux maquettes
✅ **Intégration Stripe complète** - Paiements sécurisés
✅ **Synchronisation produits** - Récupération automatique depuis Stripe
✅ **Navigation fluide** - Pages succès/annulation
✅ **Responsive** - Compatible web, iOS, Android

## 🔧 Configuration Stripe

### 1. Configuration des clés

Mettez à jour le fichier `.env` avec vos vraies clés Stripe :

```env
# Remplacez par vos vraies clés Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete
```

### 2. Configuration des produits Stripe

Dans votre dashboard Stripe :

1. **Créez vos produits** avec les métadonnées :
   - `type` : `skin`, `theme`, `premium`, etc.
   - `color` : couleur hex pour l'icône (ex: `#4299E1`)

2. **Configurez les prix** pour chaque produit

3. **Activez les produits** que vous voulez vendre

### 3. Types d'icônes supportés

Le shop génère automatiquement des icônes basées sur les métadonnées :

- **`type: "skin"`** ou **`type: "keyboard"`** → Icône clavier
- **`type: "theme"`** → Icône thème coloré
- **`type: "premium"`** ou **`type: "unlock"`** → Icône couronne
- **Défaut** → Icône point d'interrogation

## 🚀 Utilisation

### Lancement de l'application

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npx expo start

# Web seulement
npx expo start --web

# Mobile seulement  
npx expo start --tunnel
```

### Navigation

1. **Menu principal** → Cliquez sur "Shop"
2. **Liste des produits** → Synchronisés depuis Stripe
3. **Bouton "Acheter"** → Redirige vers Stripe Checkout
4. **Pages de retour** → Succès ou annulation

## 🔒 Sécurité

### ⚠️ Important pour la production

Le code actuel utilise la clé secrète Stripe côté client **uniquement pour le développement**. 

**Pour la production :**

1. **Créez un backend** (Node.js, Python, PHP, etc.)
2. **Déplacez la clé secrète** côté serveur
3. **Utilisez des endpoints sécurisés** pour :
   - Récupérer les produits
   - Créer les sessions de paiement
   - Vérifier les paiements

### Architecture recommandée

```
Frontend (TypeVision) → Backend API → Stripe API
```

## 📱 Fonctionnalités du Shop

### Interface utilisateur

- **Design moderne** avec cartes et ombres
- **Icônes dynamiques** selon le type de produit
- **Prix formatés** automatiquement
- **États de chargement** et erreurs
- **Responsive** sur tous les appareils

### Gestion des produits

- **Récupération automatique** depuis Stripe
- **Filtrage** des produits actifs uniquement
- **Association** prix/produits automatique
- **Métadonnées** pour personnaliser l'affichage

### Processus de paiement

1. **Sélection produit** → Clic sur "Acheter"
2. **Création session** → Appel API Stripe
3. **Redirection** → Stripe Checkout hébergé
4. **Retour app** → Page succès ou annulation

## 🛠️ Structure des fichiers

```
TypeVision-final/
├── services/
│   ├── StripeService.js      # Interface Stripe principale
│   └── StripeBackend.js      # Backend simulé (dev only)
├── ShopScreen.js             # Interface shop principale
├── SuccessScreen.js          # Page de succès
├── CancelScreen.js           # Page d'annulation
├── App.js                    # Navigation principale
└── .env                      # Configuration Stripe
```

## 🔧 Customisation

### Ajouter de nouveaux types d'icônes

Dans `ShopScreen.js`, modifiez la fonction `getProductIcon()` :

```javascript
case 'votre_nouveau_type':
  return renderVotreNouvelleIcone();
```

### Modifier les styles

Tous les styles sont dans `ShopScreen.js` dans l'objet `styles`.

### Ajouter des fonctionnalités

- **Panier** → Gérer plusieurs articles
- **Favoris** → Sauvegarder des produits
- **Historique** → Voir les achats précédents

## 📞 Support

Pour toute question sur l'intégration Stripe ou l'utilisation du shop, consultez :

- [Documentation Stripe](https://stripe.com/docs)
- [Guide Expo](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)

---

**TypeVision Shop** - Propulsé par Stripe 💳
