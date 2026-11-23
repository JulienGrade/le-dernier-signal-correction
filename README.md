# Le dernier signal - point de départ

Ouvrir ce dossier dans votre IDE, puis son terminal intégré.

```sh
npm ci
npm run dev
```

Node.js 22.12 ou supérieur. Ouvrir l'adresse affichée par Vite. L'interface apparaît, mais la scène attend votre code. Suivre les huit étapes du PDF. Les commentaires TODO repèrent les fonctions à compléter.

L'interface HTML/CSS, les polices, Three.js, les addons et les assets sont fournis. Le code de scène, de sélection, d'état et de transmission reste à construire. Le contrat des assets est dans docs/CONTRAT_ASSETS.md.

`npm test` vérifie le contrat GLB et les règles de mission. Les tests de règles échouent volontairement tant que state.js n'est pas complété. Une fois votre travail terminé, `npm run build` puis `npm start` servent la compilation sur http://localhost:4173.

Pour travailler avec Git : `git init -b main`, puis créer un commit à chaque étape validée. La correction et son historique sont dans une archive séparée.

Aucun jQuery, aucune ressource 3D distante. Les dépendances de développement se téléchargent lors du premier npm ci. Ne pas ouvrir index.html par double-clic.

Propriété de Julien Grade
