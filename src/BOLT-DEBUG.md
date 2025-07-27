# Debug pour StackBlitz Bolt

## Problèmes possibles et solutions :

### 1. Vider le cache du navigateur
- Ctrl + F5 (Windows) ou Cmd + Shift + R (Mac)
- Ou ouvrir les DevTools > Network > cocher "Disable cache"

### 2. Redémarrer Bolt
- Fermer l'onglet Bolt
- Rouvrir le projet depuis votre dashboard

### 3. Vérifier les imports problématiques
Les dernières modifications peuvent avoir causé des conflits.

### 4. Alternative : Copier vers un nouveau projet Bolt
1. Créer un nouveau projet Vite + React sur Bolt
2. Copier le contenu des fichiers un par un
3. Tester progressivement

### 5. Solution de secours : CodeSandbox
Si Bolt ne fonctionne pas, utilisez CodeSandbox.io qui est plus stable.

### 6. Déploiement direct
Votre build fonctionne, vous pouvez déployer directement sur :
- Netlify (glisser-déposer le dossier dist)
- Vercel (import GitHub)
- GitHub Pages

## Commandes de diagnostic :
```bash
npm run dev
npm run build
npm run preview
```

## Fichiers critiques à vérifier :
- src/main.jsx (point d'entrée)
- src/App.jsx (composant principal)
- package.json (dépendances)
- vite.config.js (configuration)
