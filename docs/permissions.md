| Action                | ADMIN | ENSEIGNANT                    | ETUDIANT   |
|-----------------------|-------|-------------------------------|------------|
| Lister les étudiants  | Oui   | Oui                           | Ses données|
| Créer un étudiant     | Oui   | Non                           | Non        |
| Modifier un étudiant  | Oui   | Seulement filiere et moyenne  | Non        |
| Supprimer un étudiant | Oui   | Non                           | Non        |
| Consulter son profil  | Oui   | Oui                           | Oui        |

Politique IDOR : accès au profil d'un autre étudiant -> 404.