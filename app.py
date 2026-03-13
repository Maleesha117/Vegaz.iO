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
    hotels_collection = db['custom_hotels'] # Custom hotels database for Admin
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

# --- SYNC DATABASE CUSTOM HOTELS TO IN-MEMORY DATAFRAME ---
# So the AI smart search works instantly for newly added hotels
def sync_custom_hotels():
    global hotels_df, hotel_embeddings
    try:
        custom_hotels = list(hotels_collection.find({}, {'_id': 0}))
        if custom_hotels and len(custom_hotels) > 0:
            custom_df = pd.DataFrame(custom_hotels)
            if 'combined_text' not in custom_df.columns:
                custom_df['combined_text'] = custom_df['name'] + " " + custom_df['location'] + " " + custom_df['desc']
            
            custom_embeddings = search_model.encode(custom_df['combined_text'].tolist())
            
            # Append custom hotels to the existing pandas dataframe and np array
            hotels_df = pd.concat([hotels_df, custom_df], ignore_index=True)
            import numpy as np
            hotel_embeddings = np.vstack((hotel_embeddings, custom_embeddings))
            print(f"✅ Synced {len(custom_hotels)} custom hotels to search memory!")
    except Exception as e:
        print(f"⚠️ Error syncing custom hotels: {e}")

sync_custom_hotels()

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

@app.route('/api/hotels/<hotel_id>', methods=['GET'])
def get_hotel(hotel_id):
    try:
        hotel_data = hotels_df[hotels_df['id'].astype(str) == str(hotel_id)]
        if hotel_data.empty:
            return jsonify({'error': 'Hotel not found'}), 404
        return jsonify(process_hotels(hotel_data)[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

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

@app.route('/api/admin/add_hotel', methods=['POST'])
def add_custom_hotel():
    data = request.json
    global hotels_df, hotel_embeddings
    
    try:
        # Create new ID
        new_id = f"custom_{int(datetime.datetime.utcnow().timestamp())}"
        
        # Structure payload to match our existing DB requirements exactly
        price_list = [
            {'site': 'Agoda', 'price': int(data.get('price_agoda', 0))},
            {'site': 'Official', 'price': int(data.get('price_official', 0))},
            {'site': 'Booking.com', 'price': int(data.get('price_booking', 0))}
        ]
        
        # Make sure images are a list
        raw_images = data.get('images', '')
        image_list = [img.strip() for img in raw_images.split(',')] if raw_images else []
        
        combined_text = f"{data.get('name', '')} {data.get('location', '')} {data.get('desc', '')}"
        
        new_hotel = {
            'id': new_id,
            'name': data.get('name'),
            'location': data.get('location'),
            'desc': data.get('desc'),
            'rating': float(data.get('rating', 0.0)),
            'image': image_list,
            'price_list': price_list,
            'combined_text': combined_text
        }
        
        # 1. Save to MongoDB natively
        hotels_collection.insert_one(new_hotel.copy())
        
        # 2. Add into system memory for AI Smart Search
        new_df = pd.DataFrame([new_hotel])
        new_emb = search_model.encode([combined_text])
        
        hotels_df = pd.concat([hotels_df, new_df], ignore_index=True)
        import numpy as np
        hotel_embeddings = np.vstack((hotel_embeddings, new_emb))
        
        return jsonify({'message': 'Hotel added successfully!', 'hotel_id': new_id}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'uploads'), filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)