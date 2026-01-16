# OSINT Globe Backend

Backend API proxy pour OSINT Globe. Résout les problèmes de CORS en faisant les requêtes côté serveur.

## 🚀 Déploiement rapide sur Vercel (GRATUIT)

### Étape 1 : Prérequis

1. **Créer un compte Vercel** : Va sur [vercel.com](https://vercel.com) et inscris-toi (gratuit avec GitHub/GitLab/Email)

2. **Installer Node.js** : Télécharge sur [nodejs.org](https://nodejs.org) (version LTS)

3. **Installer Vercel CLI** : Ouvre un terminal et tape :
   ```bash
   npm install -g vercel
   ```

### Étape 2 : Déployer

1. **Ouvre un terminal** dans le dossier `osint-backend`

2. **Connecte-toi à Vercel** :
   ```bash
   vercel login
   ```
   (Suis les instructions - ça ouvre ton navigateur)

3. **Déploie** :
   ```bash
   vercel deploy --prod
   ```

4. **C'est fait !** Tu reçois une URL comme : `https://osint-backend-xxxxx.vercel.app`

### Étape 3 : Tester

Ouvre dans ton navigateur :
```
https://TON-URL.vercel.app/api/events
```

Tu devrais voir des données JSON avec les événements !

---

## 📡 Endpoints disponibles

### GET /api/events
Endpoint principal - retourne les événements géopolitiques formatés.

**Paramètres :**
- `q` : Requête de recherche (défaut: "conflict OR military OR protest")
- `limit` : Nombre max d'événements (défaut: 50)
- `timespan` : Période (défaut: "24h")

**Exemple :**
```
/api/events?q=ukraine&limit=30&timespan=48h
```

### GET /api/gdelt
Accès direct à GDELT (données brutes).

### GET /api/acled
Données ACLED sur les conflits armés.

---

## 🔧 Développement local

```bash
# Installer les dépendances
npm install

# Lancer en local
vercel dev
```

Le serveur démarre sur `http://localhost:3000`

---

## 🔗 Connecter ton OSINT Globe

Une fois déployé, remplace l'URL dans ton fichier HTML :

```javascript
// Remplace ceci :
const API_URL = 'https://TON-URL.vercel.app/api/events';

// Puis fetch comme ça :
const response = await fetch(API_URL);
const data = await response.json();
```

---

## 📊 Limites (gratuit)

- **100 GB** de bande passante/mois
- **Serverless** : démarre à la demande
- **Cache** : 5 minutes pour optimiser

C'est largement suffisant pour un usage personnel !

---

## ❓ Problèmes courants

**"Command not found: vercel"**
→ Réinstalle : `npm install -g vercel`

**"Not authenticated"**
→ Reconnecte : `vercel login`

**"Deployment failed"**
→ Vérifie que tu es dans le bon dossier (celui avec package.json)

---

## 📁 Structure du projet

```
osint-backend/
├── api/
│   ├── events.js    # Endpoint principal (GDELT formaté)
│   ├── gdelt.js     # Proxy GDELT brut
│   └── acled.js     # Proxy ACLED
├── package.json     # Dépendances
├── vercel.json      # Config Vercel
└── README.md        # Ce fichier
```

---

Créé pour OSINT Globe 🌐
