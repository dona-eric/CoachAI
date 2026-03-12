# frontend/pages/2_plan.py
import streamlit as st
import requests
from datetime import date
import os
import dotenv


dotenv.load_dotenv()
st.set_page_config(page_title="Plan — CoachIA", page_icon="📋", layout="wide")
st.title("📋 Mon Plan d'Entraînement")

#  Vérification profil
if not st.session_state.get("user_profile"):
    st.warning("⚠️ Définis d'abord ton profil dans la page **👤 Profil**")
    st.stop()

p = st.session_state.user_profile
st.success(f"✅ Profil : **{p['name']}** | {p['current_weight']}kg → {p['target_weight']}kg")

# ─── Options du plan ──────────────────────────────────
st.subheader("⚙️ Options du plan")
col1, col2 = st.columns(2)
with col1:
    start_date = st.date_input("Date de début", value=date.today())
with col2:
    st.info(
        f"📅 **{p['available_days']} séances/semaine** "
        f"détectées depuis ton profil"
    )

#  Génération plan 
if st.button("🚀 Générer mon plan personnalisé", type="primary", use_container_width=True):
    with st.spinner("🤖 L'agent CoachIA génère ton plan... (30-60 sec)"):
        try:
            response = requests.post(
                f"{os.getenv('API_URL')}/plan/generate",
                json={
                    "profile":    p,
                    "start_date": str(start_date),
                },
                timeout=120
            )
            if response.status_code == 200:
                result = response.json()
                st.session_state.plan_result   = result["plan"]
                st.session_state.plan_session  = result["session_id"]
                st.success("✅ Plan généré !")
            else:
                st.error(f" Erreur : {response.json().get('detail')}")

        except requests.exceptions.ConnectionError:
            st.error(" Backend non accessible.")
        except Exception as e:
            st.error(f" {e}")

# ─── Affichage plan ───────────────────────────────────
if st.session_state.get("plan_result"):
    st.divider()
    st.subheader("📋 Ton Plan d'Entraînement")
    st.markdown(st.session_state.plan_result)

    col1, col2 = st.columns(2)
    with col1:
        if st.button("📅 Exporter vers Google Calendar", use_container_width=True):
            st.switch_page("pages/4_calendar.py")
    with col2:
        if st.button("🎥 Voir les exercices en détail", use_container_width=True):
            st.switch_page("pages/3_exercises.py")

#  Chat avec CoachIA 
st.divider()
st.subheader("💬 Parle avec CoachIA")

for msg in st.session_state.get("chat_history", []):
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

if prompt := st.chat_input("Pose une question sur ton plan..."):
    st.session_state.chat_history.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.write(prompt)

    with st.chat_message("assistant"):
        with st.spinner("🤔 CoachIA réfléchit..."):
            try:
                response = requests.post(
                    f"{os.getenv("API_URL")}/chat",
                    json={
                        "message":    prompt,
                        "session_id": st.session_state.session_id,
                        "profile":    p,
                    },
                    timeout=60
                )
                if response.status_code == 200:
                    answer = response.json()["response"]
                    st.write(answer)
                    st.session_state.chat_history.append(
                        {"role": "assistant", "content": answer}
                    )
            except Exception as e:
                st.error(f"❌ {e}")