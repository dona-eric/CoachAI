import os, sys, dotenv, pathlib, glob
import pandas as pd




class Preprocess_CSV:
    def __init__(self, path:pathlib.Path()):
        super(PROCESS_CSV, self).__init__()

        self.path = path
    

    def load_csv_all(self):

        data_path =glob.glob(os.path.join(os.))
