# Version V2 de CoachAI 
---

### Datasets utilisées

- 1. ExerciseDB

- 2. All Muscle Training Exercises Dataset

Cet ensemble de données contient une collection structurée d'exercices de fitness et d'entraînement organisés par groupes musculaires cibles.

Les données ont été collectées à l'aide de l'API ExerciseDB via RapidAPI et traitées à l'aide de Python et Pandas.

📌 Contenu du jeu de données :
• Un jeu de données principal contenant tous les exercices
• Des fichiers CSV séparés pour chaque groupe musculaire (abdominaux, biceps, quadriceps, triceps, etc.)

**Structure du jeu de données**
Les jeux de données en .csv sont constitués de :

- *Nom* : Nom de l'exercice
- *cible* : Groupe musculaire cible
- *Partie du corps* : Partie du corps concernée
- *matériel* : Équipement nécessaire à l'exercice





### EMBEDDING MODEL

Pour bien traiter les données et s'assurer d'une grande rélations semantiques entre les données, nous avons utilisé deux models d'intégration spécifique:

-   **1.intfloat/multilingual-e5-large* : un modèle de huggingface qui comporte 24 couches et la taille d'intégration est de 1024(dimension_embeddings).Ce modèle initialisé à partir de xlm-roberta-large et entraîné en continu sur un ensemble de données multilingues variées. Il prend en charge 100 langues de xlm-roberta, mais les performances peuvent être dégradées pour les langues disposant de peu de ressources.

-   **2.BAAI/bge-m3*:Il peut exécuter simultanément les trois fonctionnalités de recherche courantes des modèles d'intégration : recherche dense, recherche multivectorielle et recherche éparse.Il peut prendre en charge plus de 100 langues de travail et est capable de traiter des entrées de granularités différentes, allant de courtes phrases à de longs documents contenant jusqu'à **8192 jetons*.






## 🔄 Flow utilisateur complet
```
ÉTAPE 1 — Profil
   L'utilisateur remplit :
   • Poids actuel : 90kg  →  Objectif : 60kg
   • Niveau : débutant
   • Équipement : haltères + tapis
   • Disponibilité : Lundi, Mercredi, Vendredi
   • Restrictions : douleur genou droit
         ↓ sauvegardé dans Supabase

ÉTAPE 2 — Génération du plan
   L'agent IA :
   • Calcule la durée estimée (90kg→60kg ≈ 16 semaines)
   • Interroge Qdrant → exercices adaptés
   • Génère un plan semaine par semaine avec Groq
         ↓

ÉTAPE 3 — Affichage exercices + GIFs
   Pour chaque exercice du plan :
   • Nom + muscles ciblés
   • GIF animé (360x360)
   • Instructions étape par étape
   • Nombre de sets/reps recommandé
         ↓

ÉTAPE 4 — Export Google Calendar
   • 3 séances/semaine sur 16 semaines
   • Chaque événement contient :
     - Titre : "CoachIA — Séance Cardio + Jambes"
     - Description : liste des exercices du jour
     - Durée : 45-60 min
     - Rappel : 30 min avant











┌─────────────────────────────────────────────────────┐
│                 STREAMLIT (Frontend)                 │
│  1. Formulaire profil utilisateur                   │
│  2. Affichage plan d'entraînement                   │
│  3. Galerie exercices + GIFs animés                 │
│  4. Bouton → Export Google Calendar                 │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP (REST)
┌─────────────────▼───────────────────────────────────┐
│                 FASTAPI (Backend)                    │
│                                                     │
│  /profile     → Créer/sauvegarder profil            │
│  /plan        → Générer plan d'entraînement         │
│  /exercises   → Rechercher exercices + GIFs         │
│  /calendar    → Exporter vers Google Calendar       │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
┌──────▼───┐  ┌───────▼──────┐ ┌────▼──────────────┐
│ Supabase │  │ Qdrant Cloud │ │  Google Calendar  │
│(profils) │  │  (RAG RAG)   │ │     (OAuth2)      │
└──────────┘  └──────────────┘ └───────────────────┘
                     │
              ┌──────▼──────┐
              │  Groq LLM   │
              │ gemma2-9b   │
              └─────────────┘