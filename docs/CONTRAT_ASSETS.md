# Contrat des assets

Le fichier `assets/outpost.blend` est le modèle source original. `assets/outpost.glb` est son export glTF 2.0. Les deux sont utilisables et modifiables pour ce projet.

| Objet | Rôle |
| --- | --- |
| Outpost | Racine du décor |
| Relay_01, Relay_02, Relay_03 | Groupes interactifs |
| Relay_01_Core, Relay_02_Core, Relay_03_Core | Meshes lumineux |
| Pivot_Antenna | Pivot autour de Y dans Three.js |
| Habitat | Bâtiment principal |
| Solar_-1, Solar_1 | Panneaux solaires |

Blender utilise Z vers le haut. L'export convertit le décor vers Y vers le haut. L'échelle est conservée à 1 dans l'application. Aucun besoin de Draco, de textures externes ou de CDN. Les matériaux sont des Principled BSDF simples, convertis en matériaux glTF.

Le modèle exporté possède 93 meshes et environ 8 788 triangles. Les lumières et la caméra d'atelier du `.blend` sont exclues du GLB. Le script `blender/create_outpost.py` permet de reproduire le modèle. Il écrase les deux assets générés.

Blender 4.3.2 a été utilisé pour produire le `.blend` ; le script choisit le moteur Eevee selon la version. Une version récente compatible est conseillée pour ouvrir le fichier.
