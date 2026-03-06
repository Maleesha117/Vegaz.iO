import pickle
import pandas as pd

try:
    with open('advanced_data.pkl', 'rb') as f:
        data = pickle.load(f)
        df = data['df']
        print("--- CONTENT OF PICKLE FILE ---")
        print(df[['name', 'image']].head(1).to_string())
        print("------------------------------")
except Exception as e:
    print(f"Error reading pickle: {e}")
