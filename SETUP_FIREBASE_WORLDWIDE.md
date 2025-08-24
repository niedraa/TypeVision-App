# 🌍 Configuration Firebase pour Multijoueur Mondial

## 🚨 URGENT : Votre app est en mode local car Firebase n'est pas configuré !

### Étape 1: Vérifier votre projet Firebase
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionnez votre projet **"typevision-ac679"**

### Étape 2: Configurer Realtime Database
1. Dans le menu, cliquez sur **"Realtime Database"**
2. Si la database n'existe pas, cliquez sur **"Créer une base de données"**
3. Choisissez **"Commencer en mode test"**
4. Sélectionnez la région **"europe-west1"**

### Étape 3: Configurer les règles de sécurité
1. Une fois la database créée, cliquez sur l'onglet **"Règles"**
2. Remplacez le contenu par :

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "globalRooms": {
      ".read": true,
      ".write": true,
      ".indexOn": ["status", "code", "createdAt"],
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
    "users": {
      ".read": true,
      ".write": true,
      "$userId": {
        ".read": true,
        ".write": true,
        "status": {
          ".read": true,
          ".write": true
        }
      }
    },
    "presence": {
      ".read": true,
      ".write": true,
      "$userId": {
        ".read": true,
        ".write": true
      }
    },
    "stats": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Cliquez sur **"Publier"**

### Étape 4: Configurer l'authentification
1. Dans le menu, cliquez sur **"Authentication"**
2. Cliquez sur l'onglet **"Sign-in method"**
3. Activez **"Connexion anonyme"**
4. Cliquez sur **"Enregistrer"**

### Étape 5: Tester
1. Redémarrez votre app Expo
2. Créez une salle - vous devriez voir "✅ Salle mondiale créée"
3. Sur un autre appareil, utilisez le même code pour rejoindre

## 🔧 Si vous avez encore des erreurs :

### Erreur "Index not defined"
- Cette erreur apparaît lors de la recherche de parties rapides
- **Solution :** Ajoutez `.indexOn": ["status", "code", "createdAt"]` dans les règles (voir Étape 3)
- Republier les règles dans Firebase Console

### Erreur "Permission denied"
- Vérifiez que les règles sont bien publiées
- Assurez-vous que l'authentification anonyme est activée

### Erreur "configuration-not-found"
- Vérifiez que votre apiKey est correcte dans firebase.js
- Assurez-vous que le projet Firebase existe

### Erreur de réseau
- Vérifiez votre connexion internet
- Testez sur un autre réseau

## 🎮 Une fois configuré :
- ✅ Multijoueur mondial fonctionnel
- ✅ Salles partagées dans le monde entier
- ✅ Synchronisation temps réel
- ✅ Statistiques mondiales

**⚠️ Important :** Les règles ci-dessus sont pour le développement. En production, ajoutez des restrictions de sécurité appropriées.
