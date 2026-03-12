# frontend/pages/4_calendar.py
import streamlit as st
import requests
import os
import dotenv
from datetime import date

dotenv.load_dotenv()
API_URL = os.getenv("API_URL")

st.set_page_config(page_title="Calendar — CoachIA", page_icon="📅", layout="wide")
st.title("📅 Google Calendar")
st.caption("Planifie tes séances directement dans ton Google Calendar")

# ─── Vérification profil ──────────────────────────────
if not st.session_state.get("user_profile"):
    st.warning("⚠️ Définis d'abord ton profil dans la page **👤 Profil**")
    st.stop()

p = st.session_state.user_profile

# ─── Auth Google ──────────────────────────────────────
st.subheader("🔐 Connexion Google")
col1, col2 = st.columns(2)
with col1:
    if st.button("🔗 Connecter Google Calendar", type="primary", use_container_width=True):
        st.markdown(
            f'<meta http-equiv="refresh" content="0; url={API_URL}/calendar/auth">',
            unsafe_allow_html=True,
        )
with col2:
    token_input = st.text_input(
        "Session ID (après connexion Google)",
        placeholder="Colle ton session_id ici"
    )
    if token_input:
        st.session_state.calendar_token = token_input
        st.success("✅ Session enregistrée !")

# ─── Configuration planning ───────────────────────────
st.divider()
st.subheader("⚙️ Configuration du planning")

col1, col2, col3 = st.columns(3)
with col1:
    start_date = st.date_input("Date de début *", value=date.today())
    estimated_weeks = st.number_input(
        "Durée (semaines) *", min_value=4, max_value=52, value=12
    )
with col2:
    available_days = st.multiselect(
        "Jours d'entraînement *",
        ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
        default=["Lundi", "Mercredi", "Vendredi"],
    )
    session_duration = st.number_input(
        "Durée séance (min) *", min_value=20, max_value=180, value=60
    )
with col3:
    preferred_time = st.time_input("Heure de début *")
    plan_summary   = st.text_area(
        "Résumé du plan",
        value=st.session_state.get("plan_result", "")[:200] if st.session_state.get("plan_result") else "Plan CoachIA personnalisé",
        height=100,
    )

# ─── Prévisualisation ─────────────────────────────────
if st.button("👁️ Prévisualiser les séances", use_container_width=True):
    if not available_days:
        st.error("❌ Sélectionne au moins un jour")
        st.stop()

    with st.spinner("🔄 Génération aperçu..."):
        try:
            response = requests.post(
                f"{API_URL}/calendar/preview",
                json={
                    "profile":               p,
                    "plan_summary":          plan_summary,
                    "start_date":            str(start_date),
                    "available_days":        available_days,
                    "estimated_weeks":       estimated_weeks,
                    "session_duration_min":  session_duration,
                    "preferred_time":        str(preferred_time),
                },
                timeout=30
            )
            if response.status_code == 200:
                data   = response.json()
                events = data["events"]
                st.success(f"✅ **{data['total']} séances** planifiées sur {estimated_weeks} semaines")

                st.subheader("📋 Aperçu des 10 premières séances")
                for event in events:
                    with st.expander(f"📅 {event['date']} — {event['title']}"):
                        col1, col2 = st.columns(2)
                        col1.write(f"⏰ **Heure** : {event['start_time']} → {event['end_time']}")
                        col2.write(f"🔔 **Rappel** : {event['reminder_minutes']} min avant")
                        st.write(event["description"])
        except Exception as e:
            st.error(f"❌ {e}")

st.divider()

# ─── Export Calendar ──────────────────────────────────
if st.button(
    "📅 Exporter vers Google Calendar",
    type="primary",
    use_container_width=True,
    disabled=not st.session_state.get("calendar_token")
):
    with st.spinner("📤 Export en cours..."):
        try:
            response = requests.post(
                f"{API_URL}/calendar/create",
                json={
                    "profile":              p,
                    "plan_summary":         plan_summary,
                    "start_date":           str(start_date),
                    "available_days":       available_days,
                    "estimated_weeks":      estimated_weeks,
                    "session_duration_min": session_duration,
                    "preferred_time":       str(preferred_time),
                },
                params={"session_id": st.session_state.calendar_token},
                timeout=120
            )
            if response.status_code == 200:
                result = response.json()
                st.success(result["message"])
                st.balloons()
                st.info(
                    f"📅 **{result['total_events']} séances** ajoutées à ton Google Calendar ! "
                    f"Tu recevras des rappels 30 min avant chaque séance. 💪"
                )
            else:
                st.error(f"❌ {response.json().get('detail')}")
        except Exception as e:
            st.error(f"❌ {e}")

if not st.session_state.get("calendar_token"):
    st.warning("⚠️ Connecte d'abord ton Google Calendar ci-dessus")