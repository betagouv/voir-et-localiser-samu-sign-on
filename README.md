# Brique d'identification pour https://operateur.localerte.beta.gouv.fr

## Développement

En local, il faut lancer :
```
npm ci
npm run dev
# Aller à http://localhost:10101
```

## Déploiement

Pour déployer le service en production, il faut lancer :
```
npm ci
pm2 start start.json --env production
```
