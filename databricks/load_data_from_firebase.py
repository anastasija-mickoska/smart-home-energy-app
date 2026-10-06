import os
import firebase_admin
import pandas as pd
from firebase_admin import credentials, firestore

OUT_PATH_APPLIANCES = "../data/appliances.csv" 
OUT_PATH_ENERGY = "../data/energy-prices.csv" 

firebase_admin.initialize_app(credentials.Certificate("../householdenergymonitoringapp-firebase-adminsdk-fbsvc-b7ab9cb89b.json"))
db = firestore.client()

rows_a = []
for doc in db.collection("Appliance Consumption").stream(): 
    row = doc.to_dict()
    row["_id"] = doc.id
    rows_a.append(row)

rows_e = []
for doc in db.collection("Electricity Prices").stream(): 
    row = doc.to_dict()
    row["_id"] = doc.id
    rows_e.append(row)

df_a = pd.DataFrame(rows_a)
os.makedirs(os.path.dirname(OUT_PATH_APPLIANCES), exist_ok=True)
df_a.to_csv(OUT_PATH_APPLIANCES, index=False)
print(f"{len(df_a)} documents written to {OUT_PATH_APPLIANCES}")
print(df_a.head())

df_e = pd.DataFrame(rows_e)
os.makedirs(os.path.dirname(OUT_PATH_ENERGY), exist_ok=True)
df_e.to_csv(OUT_PATH_ENERGY, index=False)
print(f"{len(df_e)} documents written to {OUT_PATH_ENERGY}")
print(df_e.head())