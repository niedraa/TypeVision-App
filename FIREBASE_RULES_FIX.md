# 🔧 Configuration des Règles Firebase - URGENT

## ❌ Problème actuel
Les erreurs `Permission denied` indiquent que votre Realtime Database a des règles trop restrictives.

## ✅ Solution immédiate (1 minute)

### Étape 1: Ouvrir les règles Firebase
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionnez **"typevision-ac679"**
3. Cliquez sur **"Realtime Database"**
4. Cliquez sur l'onglet **"Règles"**

### Étape 2: Remplacer les règles
Remplacez le contenu par ces règles de développement :

```json
{
  "rules": {
    ".read": "auth != null || true",
    ".write": "auth != null || true",
    "globalRooms": {
      ".read": true,
      ".write": true,
      "$roomId": {
        ".read": true,
        ".write": true,
        "players": {
          ".read": true,
          ".write": true
        },
        "gameState": {
          ".read": true,
          ".write": true
        }
      }
    },
    "stats": {
      ".read": true,
      ".write": true
    },
    "presence": {
      ".read": true,
      ".write": true
    }
  }
}
```

### Étape 3: Publier
1. Cliquez sur **"Publier"**
2. Confirmez la publication

### Étape 4: Tester
Redémarrez votre app - les erreurs `Permission denied` disparaîtront !

## ⚠️ Note sécurité
Ces règles permettent l'accès libre pour le développement. 
Pour la production, nous configurerons des règles plus sécurisées.

## Temps: 1-2 minutes max ! 🚀
