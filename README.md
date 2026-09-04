    # 🏋️ CoachIA - Chatbot de Coaching Sportif IA

---

***CoachIA*** est une application web interactive qui est basé sur l'intelligence artificielle pour fournir un **coaching sportif personnalisé**. L'application est conçue pour aider les personnels, les professeurs de sport, les coachs et les débutants à planifier leurs entraînements, apprendre des exercices, suivre leurs performances, recevoir des conseils nutritionnels et gérer leur récupération.

---
Le projet utilise **Streamlit** pour l'interface et les modèles LLM via **GroqCloud API**.

---

## ⚡ Fonctionnalités

1. **Plan d'entraînement personnalisé**
   - Génère un plan adapté au niveau de l'utilisateur, à ses objectifs, au sport pratiqué et au matériel disponible.
   - Ajuste la fréquence et la durée des séances.

2. **Banque d'exercices**
   - Fournit des explications détaillées des exercices.
   - Donne les étapes, les erreurs à éviter, les variantes et le matériel nécessaire.

3. **Suivi des performances**
   - Analyse les performances de l'utilisateur et fournit un feedback motivant.
   - Permet de visualiser les progrès au fil du temps.

4. **Nutrition & Hydratation**
   - Conseils adaptés à l'objectif sportif et au type d'entraînement.
   - Recommandations sur l'alimentation pré- et post-entraînement.

5. **Récupération & Prévention des blessures**
   - Propose des plans de récupération, étirements, sommeil et prévention.
   - Aide à identifier les signes de surentraînement.

---

## 📂 Structure du projet

``` bash
CoachIA/
├── bot_coach/
│ └── coach.py # fichier principal Streamlit
├── .streamlit/
│ └── secrets.toml # clé API Groq
├── requirements.txt # dépendances Python
├── README.md

```
---

## 🛠️ Installation et utilisation

### 1. Cloner le dépôt
```bash
git clone https://github.com/dona-eric/CoachIA.git
cd CoachIA
```
### 2. Créer un environnement virtuel et installer les dépendances

``` bash
python -m venv env
source env/bin/activate  # Linux/Mac
env\Scripts\activate     # Windows
pip install -r requirements.txt

```

### 3. Configurer les clés API

Créer un fichier .streamlit/secrets.toml avec le contenu suivant :
```bash
API_KEY_GROQ = "VOTRE_CLE_API_GROQ"
```
- L'api utilisé est disponible sur la plateforme de GroqCloud ([groq-cloud](https://console.groq.com/docs)

- Remplace "VOTRE_CLE_API_GROQ" par ta clé personnelle.

### 4. Lancer l'application
```bash
streamlit run bot_coach/app.py
``` 

 - L'application sera accessible à l'adresse affichée par Streamlit (http://localhost:8501).

### ☁️ Déploiement sur Streamlit Cloud

``` bash
1- Pousser le dépôt sur GitHub.

2- Connecter Streamlit Cloud à ton dépôt.

3- Spécifier le fichier principal : bot_coach/app.py.

4- Déployer. L'application sera accessible en ligne.

```
## 📌 5- Technologies utilisées

Streamlit
 - interface web interactive

GroqCloud API
 - modèles LLM open source

Python 3.13+

 - python-dotenv, openai, groq

### 📝 Notes

 - Tous les secrets (clé API) doivent être stockés dans .streamlit/secrets.toml.

 - L'application utilise l’historique des échanges pour permettre des conversations multi-échanges avec le chatbot.


- Vous pouvez désormais visiter le lien : (https://coach-ai.streamlit.app)  pour essayer 

#### 📧 Contact

Pour toute question ou suggestion :

#### Email : donaerickoulodji@gmail.com

#### GitHub : https://github.com/dona-eric

---

