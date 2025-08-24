# 🚀 Configuration Firebase Rapide - TypeVision

## 📋 Étapes Simples (5 minutes)

### 1. Ouvrir la Console Firebase
- Allez sur [console.firebase.google.com](https://console.firebase.google.com)
- Cliquez sur votre projet **`typevision-ac679`**

### 2. Activer l'Authentification
```
Sidebar → Authentication → Get started → Sign-in method → Anonymous → Enable → Save
```

### 3. Créer la Realtime Database
```
Sidebar → Realtime Database → Create Database → Start in test mode → Done
```

### 4. Copier l'URL de Database
- Une fois créée, vous verrez l'URL de votre database
- Elle ressemblera à : `https://typevision-ac679-default-rtdb.firebaseio.com`
- **Important** : Votre URL peut être différente selon la région !

### 5. Mettre à Jour l'URL (Si Nécessaire)
Si l'URL affichée est différente de celle dans le code, modifiez le fichier `services/firebase.js` :

```javascript
databaseURL: "VOTRE_URL_EXACTE_ICI"
```

## ✅ Vérification

Une fois configuré, vous verrez dans les logs :
```
🔐 Utilisateur Firebase authentifié: [user-id]
✅ Salle mondiale créée: [code]
🟢 Connecté au serveur mondial
```

## 🎮 Résultat

- **Avant** : Mode local uniquement
- **Après** : Multijoueur mondial avec des joueurs du monde entier !

## 🔒 Règles de Sécurité (Optionnel)

Pour la production, remplacez les règles de database par :

```json
{
  "rules": {
    "globalRooms": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

**C'est tout !** En moins de 5 minutes, votre TypeVision aura un vrai multijoueur mondial ! 🌍
