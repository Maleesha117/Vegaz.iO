from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pickle
import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import bcrypt
import jwt
import datetime
from pymongo import MongoClient

app = Flask(__name__)
CORS(app) 

# --- PATHS & CONFIGS ---
BASE_DIR = '/Users/maleeshamaduwantha/Desktop/VegaZ.IO'
DATA_PATH = os.path.join(BASE_DIR, 'advanced_data.pkl')
PRICE_MODEL_PATH = os.path.join(BASE_DIR, 'my_model.pkl')
JWT_SECRET = "super-secret-key-change-in-production"

# --- MONGODB CONNECTION ---
# Compass eke hadapu database eka methanata connect karanawa
MONGO_URI = "mongodb://localhost:27017/"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client['vegaz']              # Api compass eke hadapu database eka
    users_collection = db['users']    # Api compass eke hadapu collection eka
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")

# LOAD RESOURCES
if os.path.exists(DATA_PATH):
    with open(DATA_PATH, 'rb') as f:
        data = pickle.load(f)
        hotels_df = data['df']
        hotel_embeddings = data['embeddings']
        search_model = data['model']
else:
    print("❌ Error: Run 'setup_advanced.py' first!")

if os.path.exists(PRICE_MODEL_PATH):
    with open(PRICE_MODEL_PATH, 'rb') as f:
        price_model = pickle.load(f)
else:
    price_model = None

# --- HELPER: RANKING ALGORITHM ---
def process_hotels(df_subset):
    """
    Takes a dataframe of hotels and sorts their price_list 
    from Lowest to Highest for each hotel.
    """
    results = df_subset.to_dict(orient='records')
    for hotel in results:
        hotel['price_list'] = sorted(hotel['price_list'], key=lambda x: x['price'])
        hotel['best_price'] = hotel['price_list'][0]['price']
    return results

@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    query = request.args.get('query')
    
    if not query:
        return jsonify(process_hotels(hotels_df.head(10)))
    
    query_embedding = search_model.encode([query])
    scores = cosine_similarity(query_embedding, hotel_embeddings)[0]
    
    search_df = hotels_df.copy()
    search_df['score'] = scores
    
    top_results = search_df.sort_values(by='score', ascending=False).head(5)
    
    return jsonify(process_hotels(top_results))

@app.route('/api/predict', methods=['POST'])
def predict_price():
    if not price_model: return jsonify({'error': 'No model'}), 500
    data = request.json
    try:
        current = float(data.get('current_price'))
        features = [[int(data.get('lead_time', 30)), int(data.get('month', 3)), current]]
        prediction = price_model.predict(features)[0]
        
        if prediction > current:
            advice = "Price likely to RISE 🔺. Book Now!"
            color = "red"
        else:
            advice = "Price likely to DROP 🔻. Wait a bit."
            color = "green"
        return jsonify({'predicted_price': round(prediction, 2), 'advice': advice, 'color': color})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    # 1. Database eke email eka thiyenawada check karanawa
    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 400

    # 2. Password eka hash karanawa
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    # 3. MongoDB ekata data save karanawa
    user_doc = {
        'name': name,
        'email': email,
        'password': hashed_password,
        'role': 'user',
        'created_at': datetime.datetime.utcnow()
    }
    users_collection.insert_one(user_doc)
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': 'Missing email or password'}), 400

    # 1. MongoDB eken user wa hoyanawa
    user = users_collection.find_one({'email': email})
    
    # 2. User innawanm saha password hari nam JWT token eka denawa
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'email': user['email'],
            'name': user['name'],
            'role': user.get('role', 'user'),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, JWT_SECRET, algorithm="HS256")
        
        return jsonify({'token': token, 'name': user['name'], 'role': user.get('role', 'user')}), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username == "Admin" and password == "Password":
        token = jwt.encode({
            'user_id': 'admin_root',
            'username': 'Admin',
            'role': 'admin',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, JWT_SECRET, algorithm="HS256")
        return jsonify({'token': token, 'name': 'Super Admin', 'role': 'admin'}), 200
    
    return jsonify({'error': 'Invalid Admin credentials'}), 401

@app.route('/api/admin/add_user', methods=['POST'])
def admin_add_user():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user') # allow admin to set role

    if not all([name, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 400

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    user_doc = {
        'name': name,
        'email': email,
        'password': hashed_password,
        'role': role,
        'created_at': datetime.datetime.utcnow()
    }
    users_collection.insert_one(user_doc)
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    total_users = users_collection.count_documents({})
    # Count total hotels in your dataset
    total_hotels = len(hotels_df) if 'hotels_df' in globals() else 0
    
    return jsonify({
        'total_users': total_users,
        'total_hotels': total_hotels
    })

@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    users = list(users_collection.find({}, {'password': 0}))
    for user in users:
        user['_id'] = str(user['_id'])
    return jsonify(users)

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'uploads'), filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)