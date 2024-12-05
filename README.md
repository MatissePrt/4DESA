# Link Up - Headless Social Media Platform

## Description

**Link Up** est une plateforme de médias sociaux sans interface (headless) destinée aux créateurs de contenu. Elle fournit une API robuste et flexible permettant une gestion fluide des contenus et une intégration facile avec différents front-end. Ce projet est conçu pour répondre à la demande croissante de solutions personnalisables et évolutives dans le domaine des contenus numériques.

## Objectif du Projet

Le projet vise à :

- Développer un backend performant et évolutif.
- Utiliser les services cloud de **Microsoft Azure** pour assurer la scalabilité, la sécurité et la haute disponibilité.
- Fournir des APIs permettant la création, la gestion et la distribution de contenu.

## Fonctionnalités

- **Création et gestion de contenu** : Permet aux utilisateurs de créer, modifier et supprimer du contenu.
- **Gestion des utilisateurs** : Système d'authentification et autorisation.
- **API Documentée** : Accès à la documentation via Swagger.
- **Support de stockage** : Intégration avec Azure Blob Storage pour le stockage de fichiers multimédias.

## Architecture

Le projet utilise les services suivants sur Azure :

- **Azure Web App** : Hébergement de l'API.
- **Azure SQL Database** : Base de données relationnelle pour stocker les données de l'application.
- **Azure Blob Storage** : Stockage des fichiers (images, vidéos).
- **Azure Key Vault** : Gestion des secrets (clés, mots de passe).

## Comment tester ce Projet ?

- Ce projet n'est pas testable en local car l'application récupere les secrets via le Azure Key Vault uniquement.
- Pour le tester il faut requeter via l'url azure : https://linkup-app-f8guebe2dfddaggt.francecentral-01.azurewebsites.net/api
