## How to generate static website from WordPress for deployment

### Getting started: Cloning and updating the repository

This repository pulls from HabitatSeven’s excellent https://github.com/OpenDRR/h7-riskprofiler and https://github.com/OpenDRR/h7-framework as submodules.
To fetch these submodules during clone, use:

```bash
git clone --recurse-submodules https://github.com/OpenDRR/riskprofiler.git
```

To pull latest changes including the submodules, use:

```bash
git pull --recurse-submodules
```

### Launch RiskProfiler WordPress instance

```bash
( cd wp-app && git restore site/assets/themes/fw-child ; git clean -fdx; git clean -fdX ) ; \
export DOCKER_WP_UID_GID="$(id -u):$(id -g)" ; \
docker compose down -v ;
KEEP_WPCLI_RUNNING=true OPTIONS_GIT_DESCRIBE=$(git describe --long --tags) docker compose up --abort-on-container-exit --exit-code-from wpcli
```

For experimentation:

1. Start the stack using:

    `docker compose up`
    
2. Log into WordPress at http://127.0.0.1 using the default username/password (i.e. admin/password)
3. Make edits to the site and publish
4. Configure the Simply Static plugin
   - Set *Destination URLs* to **Save for offline use**
   - Set *Delivery Method* to **ZIP Archive**
5. Generate the site using the Simply Static plugin (i.e. Click the *Generate* button)

### Deploy on GitHub Pages

The static site can be deployed on GitHub Pages by extracting ZIP Archive created by the Simply Static plugin into your repository's *docs* folder. Enable GitHub pages as usual ensuring that it points to the *docs* folder. 

Example: <https://opendrr.github.io/riskprofiler/>

---

## Comment générer un site web statique à partir de WordPress pour le déploiement

### Flux de travail

1. Démarrer la pile en utilisant :

    `docker compose up`
    
2. Connectez-vous à WordPress à l'adresse http://127.0.0.1 en utilisant le nom d'utilisateur et le mot de passe par défaut (c'est-à-dire admin/password).
3. Faites des modifications sur le site et publiez
4. Configurez le plugin Simply Static
   - Définissez *Destination URLs* sur **Save for offline use**.
   - Définissez *Delivery Methond* sur **ZIP Archive**.
5. Générez le site en utilisant le plugin Simply Static (c'est-à-dire cliquez sur le bouton *Generate*).

### Déployer sur les pages GitHub

Le site statique peut être déployé sur les pages GitHub en extrayant l'archive ZIP créée par le plugin Simply Static dans le dossier *docs* de votre dépôt. Activez les pages GitHub comme d'habitude en vous assurant qu'elles pointent vers le dossier *docs*. 

Exemple : <https://opendrr.github.io/riskprofiler>
