"""
api/main.py — Application FastAPI principale

Point d'entrée de l'API backend CoachIA.
Gère CORS pour React, monte les routes, et initialise les services.
"""

import os
import sys
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from setup.loging import logging_setup
from setup.config import get_config

load_dotenv()
logging_setup()
logger = logging.getLogger(__name__)
config = get_config()

# App FastAPI
app = FastAPI(
    title="CoachIA API",
    description="""API backend pour CoachIA,
                fournissant des endpoints pour la gestion de profils, 
                plans d'entraînement, exercices, et calendriers. 
                Intègre un agent de conversation intelligent pour des interactions personnalisées.
            """,
    version="2.0.0"
    )

# CORS pour React
app.add_middleware(CORSMiddleware,
                   allow_origins=config.CORS_ORIGINS,
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"]
                   )
