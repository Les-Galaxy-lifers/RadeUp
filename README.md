# RadeUp

De Plouzané à Plougastel-Daoulas, rejoins le mouvement. Transforme chaque balade en mission pour l'océan. Repère les déchets, crée ton équipe, et nettoie le littoral brestois.

Lien du site : [RadeUp](https://les-galaxy-lifers.github.io/RadeUp/)

### Séance 1 : Création de "User Stories" afin de cibler les éléments à implémenter

Dans un premier temps, l'objectif a été de définir les objectifs du projet. Ceux-ci étants quasiment fixer dans le contexte de l'exercice, la majorité de notre Story Mapping s'est centré sur : *Comment rendre notre application*, ici web, *aussi accessible que possible ?*

Afin de faciliter le développement, nous avons recherché un template BootStrap. Pour respecter notre critère d'accessibilité, nous avons opté pour une page à navigation interne (ou one-page) pour que tous les éléments essentiels soient facilement atteignable.

En plus, nous avons rajouter une page de connexion/création de compte de sorte à implémenter une "gamification". En se créant un compte, un bénévole pourra suivre sa participation au sein de l'association RadeUp et gagner des badges de contribution.

Avec cette idée en tête, nous avons pu dégager 5 personas : 

| Persona                                    | Profil                           | Motivations                                                                  | Compétences numériques | Objectifs liés aux User Stories | Comportement                                                                                                     |
| ------------------------------------------ | -------------------------------- | ---------------------------------------------------------------------------- | ---------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Camille – Bénévole occasionnelle**       | 28 ans, chargée de communication | Participer ponctuellement à des actions locales                              | Moyennes               | US3, US4, US5, US11             | Utilise surtout son téléphone, cherche une action proche, s’inscrit rapidement, apprécie les interfaces simples. |
| **Thomas – Ambassadeur du littoral**       | 42 ans, enseignant en biologie   | Organiser des collectes avec ses élèves, sensibiliser à l’environnement      | Bonnes                 | US7, US8, US9, US10             | Planifie des sorties pédagogiques, suit l’impact environnemental, valorise l’implication de son groupe.          |
| **Sarah – Nouvelle utilisatrice curieuse** | 19 ans, étudiante en géographie  | Découvrir les actions locales, comprendre le fonctionnement de la plateforme | Très bonnes            | US1, US2, US12                  | Explore le site, lit les informations, s’inscrit rapidement, sensible à la clarté des explications.              |
| **Malik – Bénévole régulier**              | 35 ans, technicien portuaire     | Participer régulièrement et suivre ses engagements                           | Moyennes               | US5, US6, US11                  | Consulte souvent le site, s’inscrit à plusieurs actions, aime suivre son historique de participation.            |
| **Léa – Coordinatrice associative**        | 31 ans, coordinatrice ONG        | Suivre les actions, mobiliser des bénévoles, analyser les résultats          | Très bonnes            | US3, US9, US10, US12            | Utilise RadeUp comme outil de suivi, analyse les données, oriente les nouveaux bénévoles.                        |

Ainsi qu'à la création de ce tableau détaillant les User Stories à implémenter dans notre planning :

| Epic                               | User Story | Description                       | Objectif utilisateur                                                                   |
| ---------------------------------- | ---------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| EPIC 1 – Authentification & Profil | US1        | Inscription utilisateur           | En tant que nouvel utilisateur, je veux créer un compte afin de participer.            |
| EPIC 1 – Authentification & Profil | US2        | Connexion utilisateur             | En tant qu'utilisateur, je veux me connecter pour accéder à mon espace.                |
| EPIC 2 – Consultation des actions  | US3        | Afficher la liste des actions     | En tant que bénévole, je veux consulter les actions.                                   |
| EPIC 2 – Consultation des actions  | US4        | Carte interactive                 | En tant que bénévole, je veux voir une carte interactive.                              |
| EPIC 3 – Participation aux actions | US5        | Participer à une action           | En tant qu'utilisateur, je veux m'inscrire à une action.                               |
| EPIC 3 – Participation aux actions | US6        | Espace personnel                  | En tant qu'utilisateur, je veux voir mes actions.                                      |
| EPIC 3 – Participation aux actions | US12       | FAQ                               | En tant que potentiel bénévole, je veux me renseigner sur le fonctionnement de RadeUp. |
| EPIC 4 – Gestion des actions       | US7        | Créer une action                  | En tant qu'ambassadeur, je veux créer une action.                                      |
| EPIC 4 – Gestion des actions       | US8        | Modifier ou supprimer une action  | En tant qu'ambassadeur, je veux modifier une action.                                   |
| EPIC 5 – Suivi environnemental     | US9        | Enregistrer les déchets collectés | En tant qu'ambassadeur, je veux saisir les quantités.                                  |
| EPIC 5 – Suivi environnemental     | US10       | Tableau de bord                   | En tant qu'ambassadeur, je veux voir les statistiques.                                 |
| EPIC 6 – Gamification              | US11       | Système de badges                 | En tant que bénévole, je veux gagner des badges.                                       |


### Séances 2-3 : Implémentation des fonctionnalités

**Méthodologie**

Nous avons utilisé GitHub Projects comme outil central de pilotage. Le tableau Kanban (To Do, In Progress, Done, Limited) nous a permis de :

* Découper le projet en tâches claires via les "issues";
* Répartir efficacement le travail entre les membres;
* Suivre l’avancement en temps réel à chaque sprint pour modifier l'état de chaque tâche;
* Documenter nos décisions techniques et fonctionnelles.

Cette organisation agile, basée sur des itérations d'environ 2h, nous a aidés à avancer régulièrement, à tester rapidement et à ajuster le développement selon les besoins.

Les tâches dont la réalisation a été affectée par nos choix techniques se trouvent dans la colonne "Limited". 

[Lien du Backlog / Kanban sur GitHub Projects](https://github.com/orgs/Les-Galaxy-lifers/projects/1/views/1) 

**Démarche Technique**

RadeUp est une application web statique hébergée sur GitHub Pages. Dû à la courte durée du projet, ce choix simple nous a permis de mettre en place une solution rapidement. Cependant, ce choix apporte des limitations en termes d'interactivité avec le fichier JSON.

Nous avons structuré le site autour d'une page principale en utilisant :

* HTML5 pour le squelette;
* CSS3 pour le style;
* JavaScript pour l’interactivité,
* Des fichiers JSON pour simuler les données (actions, bénévoles).

Cette architecture légère nous a permis de séparer clairement contenu en accord avec les User Stories définies en début de projet. L’affichage dynamique des actions et des bénévoles a été réalisé en chargeant les JSON côté client, ce qui nous a permis de tester rapidement les fonctionnalités.

### Auteurs / Equipe

* CORNEN Paul : Développeur Front-end
* BODENNEC Mathys : Développeur Back-end
* D'HEM Romain : Scrum Master
* PORCHER Jeanne : Product Owner
* POURCHASSE Lana : Développeur Back-end

### Sources - Copyright

**Template** Name: Nexa

**Template URL**: https://bootstrapmade.com/nexa-bootstrap-agency-template/

**Author**: BootstrapMade.com

**License**: https://bootstrapmade.com/license/