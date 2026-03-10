import pandas as pd
import json, os, sys,logging
import dotenv, pathlib, requests
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from setup.loging import logging_setup



# laod the dotenv
dotenv.load_dotenv()
rapid_api_key = os.getenv("RapidAPI_Key")
url_api = os.getenv("rapidapi_url")
logging_setup()

logger = logging.getLogger(__name__)
logger.info("Starting Collecting data exercisedb of fitness...")

def collect_exercisetype():
    data = None

    try:
        headers = {
            "X-RapidAPI-Key": rapid_api_key,
            "X-RapidAPI-Host": "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com",
        }
        response = requests.get(url_api + "exercisetypes", headers=headers)

        if response.status_code==200:
            data = response.json()
            pathlib.Path("datadb").mkdir(parents=True, exist_ok=True)
            with open("datadb/exercisetype.json", "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
            logger.info("Collecting data exercisetype of fitness is successful.")
        else:
            logger.error(f"Failed to collect data exercisetype of fitness. Status code: {response.status_code}")
    except Exception as e:
        logger.error(f"Error collecting data exercisetype of fitness: {e}")

    return data

if __name__ == "__main__":
    collect_exercisetype()