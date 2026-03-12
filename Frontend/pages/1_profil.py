# frontend/pages/1_profil.py
import streamlit as st
import requests
import uuid

API_URL = "http://localhost:8000"

st.set_page_config(page_title="Profil-CoachIA", page_icon="👤", layout="wide")
st.title("👤 Mon Profil")
st.caption("Renseigne vos informations pour un coaching 100% personnalisé")

# Formulaire profil
with st.form("profile_form"):
    st.subheader("📋 Informations personnelles")
    col1, col2, col3 = st.columns(3)

    with col1:
        name   = st.text_input("Prénom *", placeholder="Ex: Mick")
        gender = st.selectbox("Sexe *", ["masculin", "féminin"])
        age    = st.number_input("Âge *", min_value=10, max_value=100, value=25)

    with col2:
        height         = st.number_input("Taille (cm) *", min_value=100, max_value=250, value=175)
        current_weight = st.number_input("Poids actuel (kg) *", min_value=30.0, max_value=300.0, value=90.0, step=0.5)
        target_weight  = st.number_input("Poids objectif (kg) *", min_value=30.0, max_value=300.0, value=70.0, step=0.5)

    with col3:
        level          = st.selectbox("Niveau sportif *", ["débutant", "intermédiaire", "avancé"])
        available_days = st.slider("Jours disponibles/semaine *", min_value=1, max_value=7, value=3)
        preferred_time = st.time_input("Heure préférée d'entraînement", value=None)

    st.subheader("🏋️ Équipement & Restrictions")
    col4, col5 = st.columns(2)

    with col4:
        equipment_options = [
            "body weight",
            "haltères",
            "barre + haltères",
            "machine salle de sport",
            "bande élastique",
            "kettlebell",
            "tout équipement",
        ]
        equipment = st.multiselect(
            "Équipement disponible *",
            equipment_options,
            default=["body weight"]
        )

    with col5:
        restrictions = st.text_area(
            "Restrictions médicales",
            placeholder="Ex: douleur genou droit, hernie discale...",
            height=100,
        )

    submitted = st.form_submit_button(
        "💾 Enregistrer et analyser mon profil",
        use_container_width=True,
        type="primary"
        )

# Traitement formulaire
if submitted:
    # Validations
    if not name:
        st.error("❌ Le prénom est obligatoire")
        st.stop()
    if target_weight >= current_weight:
        st.error("❌ Le poids objectif doit être inférieur au poids actuel")
        st.stop()
    if not equipment:
        st.error("❌ Sélectionne au moins un équipement")
        st.stop()

    profile_data = {
        "name":           name,
        "gender":         gender,
        "age":            age,
        "height":         height,
        "current_weight": current_weight,
        "target_weight":  target_weight,
        "level":          level,
        "equipment":      ", ".join(equipment),
        "available_days": available_days,
        "restrictions":   restrictions or "aucune",
        "preferred_time": str(preferred_time) if preferred_time else "07:00",
    }

    with st.spinner("🔄 Analyse de ton profil en cours..."):
        try:
            response = requests.post(
                f"{API_URL}/profile/analyze",
                json=profile_data,
                timeout=30
            )
            if response.status_code == 200:
                result = response.json()

                # Sauvegarder en session
                st.session_state.user_profile = profile_data
                st.session_state.session_id   = str(uuid.uuid4())

                st.success("✅ Profil enregistré avec succès !")
                st.balloons()

                # Affichage résultats
                st.divider()
                st.subheader("📊 Analyse de ton profil")

                col1, col2, col3, col4 = st.columns(4)
                col1.metric("IMC",           f"{result['bmi']}", result['bmi_category'])
                col2.metric("À perdre",      f"{result['weight_to_lose']} kg")
                col3.metric("Durée estimée", f"{result['estimated_weeks']} semaines")
                col4.metric("Durée séance",  f"{result['session_duration_min']} min")

                st.info(f"💪 {result['motivational_message']}")

                st.subheader("🎯 Muscles prioritaires")
                cols = st.columns(len(result['priority_muscles']))
                for i, muscle in enumerate(result['priority_muscles']):
                    cols[i].success(f"💪 {muscle}")

                st.subheader("⚡ Intensité recommandée")
                st.write(f"**{result['intensity_level'].title()}**")

            else:
                st.error(f"❌ Erreur API : {response.json().get('detail')}")

        except requests.exceptions.ConnectionError:
            st.error("Error: No accessible. ")
        except Exception as e:
            st.error(f" Erreur : {e}")

# Afficher profil actuel 
if st.session_state.user_profile and not submitted:
    st.divider()
    st.subheader("✅ Profil actuel")
    p = st.session_state.user_profile
    col1, col2 = st.columns(2)
    with col1:
        st.write(f"**Nom** : {p['name']}")
        st.write(f"**Poids** : {p['current_weight']} kg → {p['target_weight']} kg")
        st.write(f"**Niveau** : {p['level']}")
    with col2:
        st.write(f"**Équipement** : {p['equipment']}")
        st.write(f"**Jours/semaine** : {p['available_days']}")
        st.write(f"**Restrictions** : {p['restrictions']}")

    if st.button("🗑️ Réinitialiser le profil"):
        st.session_state.user_profile = None
        st.rerun()