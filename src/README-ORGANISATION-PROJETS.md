# 🌐 Mes Projets Web - Organisation VS Code

## 📁 Structure recommandée

```
C:\Users\fires\OneDrive\Bureau\
├── 📁 MesSitesWeb/
│   ├── 📁 ds-parfum/                 # ✅ Projet actuel
│   │   ├── src/
│   │   ├── dist/
│   │   ├── package.json
│   │   └── ds-parfum.code-workspace  # ✅ Workspace créé
│   ├── 📁 site-pizzas/               # 🔮 Futur projet
│   ├── 📁 site-nettoyage/            # 🔮 Futur projet
│   └── 📁 portfolio/                 # 🔮 Futur projet
```

## 🚀 Comment utiliser vos workspaces

### 1. Ouvrir DS Parfum
- Double-clic sur `ds-parfum.code-workspace`
- Ou dans VS Code : File → Open Workspace from File...

### 2. Créer un nouveau projet
```bash
cd C:\Users\fires\OneDrive\Bureau\MesSitesWeb
mkdir nouveau-site
cd nouveau-site
# Initialiser votre projet...
```

### 3. Basculer entre projets
- **Ctrl+Shift+P** → "File: Open Recent"
- Ou garder plusieurs fenêtres VS Code ouvertes

## ⚡ Raccourcis utiles

| Action | Raccourci |
|--------|-----------|
| Ouvrir workspace récent | `Ctrl+R` |
| Nouvelle fenêtre VS Code | `Ctrl+Shift+N` |
| Changer de fenêtre | `Alt+Tab` |
| Palette de commandes | `Ctrl+Shift+P` |

## 🛠️ Extensions recommandées (déjà configurées)

- **Tailwind CSS IntelliSense** - Autocomplétion CSS
- **Auto Rename Tag** - Renommage automatique des balises
- **Path Intellisense** - Autocomplétion des chemins
- **Prettier** - Formatage automatique du code

## 📋 Tasks configurées dans le workspace

- **Dev Server** - `Ctrl+Shift+P` → "Run Task" → "Dev Server"
- **Build Production** - `Ctrl+Shift+P` → "Run Task" → "Build Production"
- **Preview Build** - `Ctrl+Shift+P` → "Run Task" → "Preview Build"
