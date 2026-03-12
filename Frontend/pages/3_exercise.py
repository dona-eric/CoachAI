# frontend/pages/3_exercises.py
import streamlit as st
import requests
import os
import dotenv

dotenv.load_dotenv()

API_URL = os.getenv('API_URL')

st.set_page_config(page_title="Exercices — CoachIA", page_icon="🎥", layout="wide")
st.title("🎥 Bibliothèque d'Exercices")

#  Filtres de recherche 
st.subheader("🔍 Rechercher des exercices")
col1, col2, col3 = st.columns(3)

with col1:
    query = st.text_input("Recherche libre", placeholder="Ex: exercice poitrine")
with col2:
    muscle = st.selectbox("Muscle ciblé", [
        "", "biceps", "triceps", "pectorals", "lats", "glutes",
        "quads", "hamstrings", "calves", "abs", "delts",
        "traps", "forearms", "upper back", "spine",
        "cardiovascular system",
    ])
with col3:
    equipment = st.selectbox("Équipement", [
        "", "body weight", "barbell", "dumbbell",
        "resistance band", "cable", "machine",
        "kettlebell", "leverage machine",
    ])

k = st.slider("Nombre de résultats", min_value=3, max_value=20, value=6)

search_clicked = st.button("🔍 Rechercher", type="primary", use_container_width=True)

#  Résultats 
if search_clicked:
    if not query and not muscle and not equipment:
        st.warning("⚠️ Renseigne au moins un critère de recherche")
        st.stop()

    with st.spinner("🔄 Recherche en cours..."):
        try:
            response = requests.post(
                f"{API_URL}/exercises/search",
                json={
                    "query":     query     or None,
                    "muscle":    muscle    or None,
                    "equipment": equipment or None,
                    "k":         k,
                },
                timeout=30
            )
            if response.status_code == 200:
                data    = response.json()
                results = data["results"]

                st.success(f"✅ {data['total']} exercices trouvés pour : **{data['query']}**")
                st.divider()

                # Affichage en grille 3 colonnes
                for i in range(0, len(results), 3):
                    cols = st.columns(3)
                    for j, col in enumerate(cols):
                        if i + j < len(results):
                            ex = results[i + j]
                            with col:
                                with st.container(border=True):
                                    st.subheader(ex["name"])
                                    # GIF animé
                                    if ex.get("gif_medium"):
                                        st.image(
                                            ex["gif_medium"],
                                            caption=ex["name"],
                                            use_column_width=True,
                                        )
                                    elif ex.get("gif_small"):
                                        st.image(ex["gif_small"], use_column_width=True)
                                    else:
                                        st.info("🎥 GIF non disponible")

                                    st.write(f"💪 **Muscles** : {ex['muscles']}")
                                    st.write(f"🏋️ **Équipement** : {ex['equipment']}")
                                    st.write(f"📍 **Corps** : {ex['body_part']}")

                                    if ex.get("instructions"):
                                        with st.expander("📖 Instructions"):
                                            st.write(ex["instructions"])

                                    st.caption(f"Source : {ex['source']}")
            else:
                st.error(f"❌ {response.json().get('detail')}")

        except requests.exceptions.ConnectionError:
            st.error("❌ Backend non accessible.")
        except Exception as e:
            st.error(f"❌ {e}")