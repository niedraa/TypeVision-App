# 🎮 Système de Compte à Rebours Amélioré - TypeVision

## 🔄 Comportement du Compte à Rebours pour les Parties Rapides

### ✅ Nouveau Comportement (Corrigé)

#### Démarrage du Compte à Rebours
1. **Premier joueur** rejoint → ⏳ Attente d'autres joueurs
2. **Deuxième joueur** rejoint → ⏰ **Countdown 15s démarre automatiquement**
3. **Troisième joueur+** rejoint → ⏰ Countdown continue (pas de reset)

#### Gestion des Départs Pendant le Countdown
- **Si un joueur quitte pendant le countdown :**
  - ✅ **Moins de 2 joueurs** → ⏸️ **Countdown ARRÊTÉ, salle en attente**
  - ✅ **2+ joueurs restants** → ⏰ **Countdown CONTINUE**

#### Reprise du Countdown
- **Nouveau joueur rejoint une salle en attente :**
  - ✅ **2+ joueurs atteints** → ⏰ **Nouveau countdown 15s démarre**

### 🔧 Détails Techniques

#### États de la Salle
```javascript
// États possibles d'une salle
{
  status: 'waiting',     // En attente de joueurs (< 2)
  status: 'countdown',   // Compte à rebours en cours (2+ joueurs)
  status: 'playing',     // Jeu en cours
  status: 'finished'     // Jeu terminé
}
```

#### Données du Countdown
```javascript
// Quand le countdown est actif
{
  status: 'countdown',
  countdownStarted: 1756140000000,  // Timestamp de début
  countdownDuration: 15000,         // 15 secondes
  lastActivity: 1756140000000
}

// Quand le countdown est arrêté
{
  status: 'waiting',
  countdownStarted: null,
  countdownDuration: null,
  lastActivity: 1756140000000
}
```

### 📊 Scénarios d'Usage

#### Scénario 1 : Countdown Normal
```
Joueur A rejoint    → status: 'waiting'
Joueur B rejoint    → status: 'countdown' (15s)
... 15 secondes ... → status: 'playing'
```

#### Scénario 2 : Joueur Quitte Pendant Countdown
```
Joueur A rejoint    → status: 'waiting'
Joueur B rejoint    → status: 'countdown' (15s)
Joueur A quitte     → status: 'waiting' (countdown arrêté)
Joueur C rejoint    → status: 'countdown' (nouveau 15s)
```

#### Scénario 3 : Plusieurs Joueurs, Un Quitte
```
Joueur A rejoint    → status: 'waiting'
Joueur B rejoint    → status: 'countdown' (15s)
Joueur C rejoint    → status: 'countdown' (continue)
Joueur B quitte     → status: 'countdown' (continue, 2 restants)
... 15 secondes ... → status: 'playing'
```

### 🚀 Avantages du Nouveau Système

#### Pour les Joueurs
- ✅ **Pas d'attente inutile** si quelqu'un quitte
- ✅ **Reprise automatique** quand assez de joueurs
- ✅ **Countdown équitable** - tout le monde a le même temps

#### Pour l'Expérience
- ✅ **Réactivité améliorée** aux changements de lobby
- ✅ **Logique intuitive** - countdown = 2+ joueurs
- ✅ **Évite les jeux avec 1 seul joueur**

### 🔍 Logs de Debug

#### Logs de Démarrage Countdown
```
⚡ Partie rapide - 2+ joueurs détectés, démarrage countdown...
⏰ Démarrage compte à rebours partie rapide (15s)...
```

#### Logs d'Arrêt Countdown
```
🚪 Quitter la salle: room123
⏰ Arrêt du compte à rebours - moins de 2 joueurs
⏸️ Salle remise en attente de joueurs
```

#### Logs de Continuation
```
⏰ Compte à rebours maintenu - toujours 3 joueurs
```

#### Logs de Lancement
```
🚀 Lancement automatique partie rapide ! 2 joueurs
⏸️ Compte à rebours annulé - salle remise en attente
❌ Lancement annulé - plus assez de joueurs ( 1 )
```

### 🧪 Tests Recommandés

#### Test 1 : Countdown Basique
1. Joueur 1 rejoint → Vérifier "waiting"
2. Joueur 2 rejoint → Vérifier "countdown" démarre
3. Attendre 15s → Vérifier "playing"

#### Test 2 : Départ Pendant Countdown
1. 2 joueurs → Countdown démarre
2. 1 joueur quitte → Vérifier "waiting"
3. Nouveau joueur → Vérifier nouveau countdown

#### Test 3 : Départ avec Plusieurs Joueurs
1. 3 joueurs → Countdown démarre
2. 1 joueur quitte → Vérifier countdown continue
3. Attendre 15s → Vérifier lancement avec 2 joueurs

### 📱 Interface Utilisateur

#### Messages Utilisateur
- **"En attente de joueurs..."** → status: 'waiting'
- **"Partie démarre dans Xs"** → status: 'countdown'
- **"Jeu en cours !"** → status: 'playing'

#### Indicateurs Visuels
- 🔴 **Attente** → Rouge/Orange
- 🟡 **Countdown** → Animation countdown
- 🟢 **Jeu** → Vert/Bleu

---

**Note** : Ce système assure une expérience multijoueur fluide et réactive, en évitant les attentes inutiles tout en garantissant des parties équitables.
