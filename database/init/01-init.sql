-- Script d'initialisation pour PostgreSQL
-- Ce script est exécuté automatiquement au démarrage du conteneur PostgreSQL

-- Créer la base de données si elle n'existe pas
SELECT 'CREATE DATABASE ecotask'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecotask')\gexec

-- Se connecter à la base de données ecotask
\c ecotask;

-- Créer l'extension pour les UUID si elle n'existe pas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer l'extension pour les fonctions de texte si elle n'existe pas
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Afficher les informations de la base de données
SELECT 
    'Base de données EcoTask initialisée avec succès' as message,
    current_database() as database_name,
    current_user as user_name,
    version() as postgresql_version;
