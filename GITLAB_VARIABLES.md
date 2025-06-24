# Variables GitLab CI/CD pour EcoTask

## Configuration Requise

Configurez ces variables dans GitLab : **Settings > CI/CD > Variables**

### 🔐 Variables SSH (Obligatoires)

| Variable | Type | Description | Exemple |
|----------|------|-------------|---------|
| `SSH_KEY` | **File** | Clé privée SSH pour se connecter au serveur | Contenu de `~/.ssh/id_rsa` |
| `SSH_PUB` | **Variable** | Clé publique SSH | Contenu de `~/.ssh/id_rsa.pub` |

### 🐳 Variables Docker (Automatiques)

Ces variables sont automatiquement créées par GitLab :

| Variable | Description |
|----------|-------------|
| `CI_REGISTRY` | URL du GitLab Container Registry |
| `CI_REGISTRY_USER` | Utilisateur du registry |
| `CI_REGISTRY_PASSWORD` | Token d'accès au registry |
| `CI_REGISTRY_IMAGE` | URL complète de l'image |

### 🌍 Variables d'Environnement (Optionnelles)

| Variable | Type | Description | Valeur par défaut |
|----------|------|-------------|-------------------|
| `PRODUCTION_HOST` | Variable | IP/Domaine du serveur | `51.68.233.128` |
| `PRODUCTION_USER` | Variable | Utilisateur SSH | `dev5` |
| `JWT_SECRET_PROD` | Variable (Protected) | Secret JWT pour la production | - |

## Génération des Clés SSH

### 1. Générer une nouvelle paire de clés

```bash
# Sur votre machine locale
ssh-keygen -t rsa -b 4096 -C "gitlab-ci@ecotask" -f ~/.ssh/ecotask_deploy
```

### 2. Copier la clé publique sur le serveur

```bash
# Copier la clé publique sur le serveur
ssh-copy-id -i ~/.ssh/ecotask_deploy.pub dev5@51.68.233.128

# Ou manuellement
cat ~/.ssh/ecotask_deploy.pub | ssh dev5@51.68.233.128 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Configurer les variables GitLab

#### SSH_KEY (Type: File)
```bash
# Copier le contenu de la clé privée
cat ~/.ssh/ecotask_deploy
```

#### SSH_PUB (Type: Variable)
```bash
# Copier le contenu de la clé publique
cat ~/.ssh/ecotask_deploy.pub
```

## Configuration des Variables

### Dans GitLab

1. Aller dans votre projet GitLab
2. **Settings** > **CI/CD** > **Variables**
3. Cliquer sur **Add Variable**

#### Pour SSH_KEY :
- **Key**: `SSH_KEY`
- **Value**: Contenu de la clé privée (fichier entier)
- **Type**: **File**
- **Environment scope**: `*`
- **Protect variable**: ✅ (recommandé)
- **Mask variable**: ❌ (ne fonctionne pas avec les fichiers)

#### Pour SSH_PUB :
- **Key**: `SSH_PUB`
- **Value**: Contenu de la clé publique (une ligne)
- **Type**: **Variable**
- **Environment scope**: `*`
- **Protect variable**: ✅ (recommandé)
- **Mask variable**: ❌ (contient des espaces)

## Test de Configuration

### Vérifier la connexion SSH

```bash
# Tester la connexion SSH depuis votre machine
ssh -i ~/.ssh/ecotask_deploy dev5@51.68.233.128 "echo 'Connexion SSH réussie'"
```

### Vérifier les variables GitLab

Dans un job GitLab CI, vous pouvez tester :

```yaml
test_ssh:
  stage: test
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval "$(ssh-agent -s)"
    - echo "$SSH_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - printf "%s\n" "$SSH_PUB" > ~/.ssh/id_rsa.pub
    - chmod 600 ~/.ssh/id_rsa*
    - ssh-keyscan -H 51.68.233.128 >> ~/.ssh/known_hosts
  script:
    - ssh dev5@51.68.233.128 "echo 'Test SSH depuis GitLab CI réussi'"
  when: manual
```

## Sécurité

### Bonnes Pratiques

- ✅ Utiliser des clés SSH dédiées pour CI/CD
- ✅ Protéger les variables sensibles
- ✅ Limiter les permissions sur le serveur
- ✅ Utiliser des secrets rotatifs
- ✅ Auditer les accès régulièrement

### Permissions Serveur

```bash
# Sur le serveur, créer un utilisateur dédié au déploiement
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy

# Limiter les permissions sudo (optionnel)
echo "deploy ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/local/bin/docker-compose" | sudo tee /etc/sudoers.d/deploy
```

## Dépannage

### Erreurs Communes

#### "Permission denied (publickey)"
- Vérifier que la clé publique est dans `~/.ssh/authorized_keys`
- Vérifier les permissions : `chmod 600 ~/.ssh/authorized_keys`
- Vérifier que SSH est configuré pour accepter les clés publiques

#### "Host key verification failed"
- Ajouter l'host key : `ssh-keyscan -H 51.68.233.128 >> ~/.ssh/known_hosts`
- Ou utiliser `StrictHostKeyChecking=no` (moins sécurisé)

#### Variables non trouvées
- Vérifier que les variables sont définies dans GitLab
- Vérifier l'environment scope (`*` pour tous)
- Vérifier que le job a accès aux variables protégées

### Logs de Debug

Pour déboguer les problèmes SSH dans GitLab CI :

```yaml
before_script:
  - apk add --no-cache openssh-client
  - eval "$(ssh-agent -s)"
  - echo "$SSH_KEY" | tr -d '\r' | ssh-add -
  - mkdir -p ~/.ssh
  - printf "%s\n" "$SSH_PUB" > ~/.ssh/id_rsa.pub
  - chmod 600 ~/.ssh/id_rsa*
  - ssh-keyscan -H 51.68.233.128 >> ~/.ssh/known_hosts
  # Debug
  - ssh-add -l  # Lister les clés chargées
  - ssh -T dev5@51.68.233.128  # Test de connexion
```
