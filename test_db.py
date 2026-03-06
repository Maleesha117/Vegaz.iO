import sys
from pymongo import MongoClient
import certifi

MONGO_URI = "mongodb+srv://maleesha0007_db_user:wu5v89W5rdpAK2jv@vegazio.fttgozo.mongodb.net/"
try:
    client = MongoClient(MONGO_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    db = client['vegaz']
    users_collection = db['users']
    users_collection.find_one({})
    print("Success")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
