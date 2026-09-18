import requests
import os
import re, json



API_BASE_URL="https://wger.de/api/v2/"
"""

Function to pull up all the dataset of the endpoint /exercises and exercises info
"""


def exercises_function_list_info(api_url: str):
    # initialize the dictionary to storage the list of exercises
    exercises_lists = {}
    r = requests.get(url=api_url / "exercise")
    if r.status_code =="200":
        resultts_lists = r.json()
    