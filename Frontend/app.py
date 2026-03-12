import streamlit as st

st.set_page_config(
    page_title="CoachIA",
    page_icon="🏋️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── CSS Global ───────────────────────────────────────
st.markdown("""
<style>
    .main-title {
        font-size: 3rem;
        font-weight: 800;
        background: linear-gradient(90deg, #FF6B35, #F7931E);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 0.5rem;
    }
    .subtitle {
        text-align: center;
        color: #888;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: #1E1E1E;
        border-radius: 12px;
        padding: 1.2rem;
        border-left: 4px solid #FF6B35;
        margin-bottom: 1rem;
    }
    .step-badge {
        background: #FF6B35;
        color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 8px;
    }
</style>
""", unsafe_allow_html=True)

# ─── Session State ────────────────────────────────────
if "user_profile"   not in st.session_state:
    st.session_state.user_profile   = None
if "plan_result"    not in st.session_state:
    st.session_state.plan_result    = None
if "session_id"     not in st.session_state:
    st.session_state.session_id     = "default"
if "chat_history"   not in st.session_state:
    st.session_state.chat_history   = []
if "calendar_token" not in st.session_state:
    st.session_state.calendar_token = None

# ─── Page d'accueil ───────────────────────────────────
st.markdown('<h1 class="main-title">🏋️ CoachIA</h1>', unsafe_allow_html=True)
st.markdown(
    '<p class="subtitle">Ton coach sportif IA personnalisé</p>',
    unsafe_allow_html=True
)

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.markdown("""
    <div class="metric-card">
        <h3>👤 1. Profil</h3>
        <p>Définis ton profil,<br>tes objectifs et restrictions</p>
    </div>
    """, unsafe_allow_html=True)
with col2:
    st.markdown("""
    <div class="metric-card">
        <h3>📋 2. Plan</h3>
        <p>Génère ton plan<br>d'entraînement personnalisé</p>
    </div>
    """, unsafe_allow_html=True)
with col3:
    st.markdown("""
    <div class="metric-card">
        <h3>🎥 3. Exercices</h3>
        <p>Explore les exercices<br>avec GIFs animés</p>
    </div>
    """, unsafe_allow_html=True)
with col4:
    st.markdown("""
    <div class="metric-card">
        <h3>📅 4. Calendar</h3>
        <p>Planifie tes séances<br>sur Google Calendar</p>
    </div>
    """, unsafe_allow_html=True)

# ─── Statut profil ────────────────────────────────────
st.divider()
if st.session_state.user_profile:
    p = st.session_state.user_profile
    st.success(
        f"✅ Profil actif : **{p['name']}** | "
        f"{p['current_weight']}kg → {p['target_weight']}kg | "
        f"Niveau : {p['level']}"
    )
else:
    st.info("👈 Commence par définir ton profil dans la page **Profil**")