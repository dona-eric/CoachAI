import requests
import os
import dotenv

## chargement de la clé api de rapidapi depuis le fichier .env
dotenv.load_dotenv()

rapidapi_key = os.getenv("X-RapidAPI-Key")
rapidapi_url = os.getenv("rapidapi_url")
print(repr(rapidapi_key))  # doit afficher ta clé entre guillemets, PAS None
print(repr(rapidapi_url))  # doit afficher l'URL entre guillemets, PAS None


def test_rapidapi_connection():

    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com"
    }
    querystring = {"name":"Bench Press","keywords":"chest workout,barbell"}
    response = requests.get(rapidapi_url / "exercises", headers=headers, params=querystring)
    print(response)
    if response.status_code==200:
        print(response.json())
    else:
        print(f"Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_rapidapi_connection()