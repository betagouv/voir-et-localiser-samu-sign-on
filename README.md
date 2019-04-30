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
npm ci # ou npm install si ci n'est pas disponible
pm2 start start.json --env production # on npm run reload
```

### Déploiement continu

La ligne suivante a été ajoutée au fichier pour permetter le déploiement continu en remplaçant CHEMIN_ABSOLU_VERS_DEPLOY par le bon chemin. Cela permet à CircleCI de déployer master en production.

```
command="CHEMIN_ABSOLU_VERS_DEPLOY.SH",no-pty,no-port-forwarding,no-agent-forwarding ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC4uceDXC5Mw661l6Ldk1KQCQoGBPjqK934aAS0NQncPoQ+2AG2A/lzDvsXIGM6jBwNSPdG1BxzB9cV41DhWlm2c6OTvn3R+aQPSHKbqMLN678daA5xgG17C/hQMejp8m/LDbukXZX7Ru0FnGmX3tlU+uIAHqfCXpX+iuspLeh2PvpackSddX5anEhe76p2XYwDHQuDJWbfqK26MfIBHzGp2DQPMiZHfVFI5Sn3FYwTEG0YbZfUdHaxk0thscLYbr0w0cUhj/DnOLKhok1V+rp15SLT1SmkenMp9Wx9R8Hrr9YFWAwPqt7TZBu1K5zWm9BJBQwftCyyqx5y7D/1aHZt
```
