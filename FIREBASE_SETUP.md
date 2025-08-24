# 🔧 Guide de Configuration Firebase - TypeVision

## 🚨 Problèmes Courants et Solutions

### Erreur: `auth/configuration-not-found`

**Cause :** L'authentification Firebase n'est pas activée dans votre projet.

**Solution :**
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionnez votre projet `typevision-ac679`
3. Dans le menu de gauche : **Authentication** → **Sign-in method**
4. Activez **"Connexion anonyme"** (Anonymous)
5. Cliquez sur **"Enregistrer"**

### Erreur: Database URL incorrecte

**Cause :** L'URL de Realtime Database n'existe pas ou est incorrecte.

**Solution :**
1. Dans la console Firebase : **Realtime Database**
2. Cliquez sur **"Créer une base de données"**
3. Choisissez votre région (recommandé: `us-central1`)
4. Démarrez en **mode test** temporairement
5. Copiez l'URL exacte qui apparaît (ex: `https://typevision-ac679-default-rtdb.firebaseio.com`)

### Configuration Automatique des Règles

Une fois la database créée, remplacez les règles par :

```json
{
  "rules": {
    "globalRooms": {
      ".read": true,
      ".write": true,
      "$roomId": {
        ".validate": "newData.hasChildren(['code', 'host', 'status', 'players'])",
        "players": {
          "$playerId": {
            ".write": "$playerId === auth.uid || root.child('globalRooms').child($roomId).child('host').val() === auth.uid"
          }
        }
      }
    },
    "users": {
      "$userId": {
        "status": {
          ".read": true,
          ".write": "$userId === auth.uid"
        }
      }
    },
    ".read": false,
    ".write": false
  }
}
```

## ✅ Mode de Fallback Automatique

Si Firebase n'est pas configuré, l'app fonctionne automatiquement en **mode local** :

- ✅ Création de salles locales
- ✅ Multijoueur sur le même réseau
- ✅ Toutes les fonctionnalités de base

## 🔄 Étapes de Configuration Complète

### 1. Authentification
```bash
Console Firebase → Authentication → Sign-in method → Anonymous (Activer)
```

### 2. Realtime Database
```bash
Console Firebase → Realtime Database → Créer → Mode test → Copier URL
```

### 3. Règles de Sécurité
```bash
Realtime Database → Règles → Coller les règles ci-dessus → Publier
```

### 4. Vérification
- URL dans `firebase.js` correspond à celle de la console
- Authentification anonyme activée
- Règles publiées

## 🧪 Test de Connectivité

L'app affiche automatiquement :
- 🟢 **"Connecté au serveur mondial"** si Firebase fonctionne
- 🔴 **"Mode local activé"** si Firebase n'est pas disponible

## 📱 URLs par Région

Votre URL peut varier selon la région choisie :

- **US Central :** `https://PROJECT-ID-default-rtdb.firebaseio.com`
- **Europe :** `https://PROJECT-ID-default-rtdb.europe-west1.firebasedatabase.app`
- **Asie :** `https://PROJECT-ID-default-rtdb.asia-southeast1.firebasedatabase.app`

## 🔒 Sécurité Production

Pour la production, modifiez les règles :

```json
{
  "rules": {
    "globalRooms": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$roomId": {
        "players": {
          "$playerId": {
            ".write": "$playerId === auth.uid || root.child('globalRooms').child($roomId).child('host').val() === auth.uid"
          }
        }
      }
    }
  }
}
```

## 🚀 Prêt !

Une fois configuré, votre app TypeVision aura un **vrai multijoueur mondial** ! 🌍
