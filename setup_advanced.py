import pandas as pd
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer

print("--- 🚀 INITIALIZING ADVANCED AI & LOCAL IMAGES ---")

# 1. GENERATE DATA (Pointing to your local 'uploads' folder)
hotels_data = [
    {
        "id": 1, 
        "name": "Shangri-La Colombo", 
        "location": "Colombo, Sri Lanka", 
        "rating": 9.1,
        "desc": "Luxury 5-star hotel with stunning ocean views, infinity pool, and high-end shopping mall nearby.",
        # MATCH THIS FILENAME TO THE FILE IN YOUR 'uploads' FOLDER
        "image":  [
            "http://127.0.0.1:5001/uploads/ShangriLa1.jpg",
            "http://127.0.0.1:5001/uploads/ShangriLa2.jpg",
            "http://127.0.0.1:5001/uploads/ShangriLa3.jpg",
            "http://127.0.0.1:5001/uploads/ShangriLa4.jpg",
            "http://127.0.0.1:5001/uploads/ShangriLa5.jpg"
        ], 
        "price_list": [{"site": "Agoda", "price": 68500}, {"site": "Booking.com", "price": 72000}, {"site": "Official", "price": 71200}]
    },
    {
        "id": 2, 
        "name": "Cinnamon Grand", 
        "location": "Colombo, Sri Lanka", 
        "rating": 8.8,
        "desc": "Premium business hotel in the heart of the city, famous for fine dining restaurants and grand ballrooms.",
        "image": [
            "http://127.0.0.1:5001/uploads/CinnamonGrand1.jpg",
            "http://127.0.0.1:5001/uploads/CinnamonGrand2.jpg",
            "http://127.0.0.1:5001/uploads/CinnamonGrand3.jpg",
            "http://127.0.0.1:5001/uploads/CinnamonGrand4.jpg",
            "http://127.0.0.1:5001/uploads/CinnamonGrand5.jpg"
        ],
        "price_list": [{"site": "Agoda", "price": 55000}, {"site": "Booking.com", "price": 54500}, {"site": "Official", "price": 58000}]
    },
    {
        "id": 3, 
        "name": "The Ritz London", 
        "location": "London, UK", 
        "rating": 9.5,
        "desc": "Iconic historic luxury hotel, classic British afternoon tea, elegant rooms, and royalty treatment.",
        "image": [
            "http://127.0.0.1:5001/uploads/TheRitz1.jpg",
            "http://127.0.0.1:5001/uploads/TheRitz2.jpg",
            "http://127.0.0.1:5001/uploads/TheRitz3.jpg",
            "http://127.0.0.1:5001/uploads/TheRitz4.jpg",
            "http://127.0.0.1:5001/uploads/TheRitz5.jpg"
        ],
        "price_list": [{"site": "Agoda", "price": 360000}, {"site": "Expedia", "price": 350000}, {"site": "Official", "price": 355000}]
    },
    {
        "id": 4, 
        "name": "Holiday Inn Express", 
        "location": "London, UK", 
        "rating": 7.9,
        "desc": "Budget-friendly, clean and modern rooms. Perfect for backpackers and quick business trips.",
        "image": [
     "http://127.0.0.1:5001/uploads/Holiday1.jpg",
            "http://127.0.0.1:5001/uploads/Holiday2.jpg",
            "http://127.0.0.1:5001/uploads/Holiday3.jpg",
            "http://127.0.0.1:5001/uploads/Holiday4.jpg",
            "http://127.0.0.1:5001/uploads/Holiday5.jpg"
        ],
        "price_list": [{"site": "Agoda", "price": 42000}, {"site": "Booking.com", "price": 45000}, {"site": "Official", "price": 44000}]
    },
    {
        "id": 5, 
        "name": "Burj Al Arab", 
        "location": "Dubai, UAE", 
        "rating": 9.9,
        "desc": "The world's only 7-star hotel. Ultra-luxury suites, private butler service, and helicopter landing pad.",
        "image": [
            "http://127.0.0.1:5001/uploads/BurjAlArab1.jpg",
            "http://127.0.0.1:5001/uploads/BurjAlArab2.jpg",
            "http://127.0.0.1:5001/uploads/BurjAlArab3.jpg",
            "http://127.0.0.1:5001/uploads/BurjAlArab4.jpg",
            "http://127.0.0.1:5001/uploads/BurjAlArab5.jpg"
        ],
        "price_list": [{"site": "Agoda", "price": 810000}, {"site": "Hotels.com", "price": 795000}, {"site": "Official", "price": 800000}]
    },
    {
        "id": 6, 
        "name": "Atlantis The Palm", 
        "location": "Dubai, UAE", 
        "rating": 9.2,
        "desc": "Massive resort on a man-made island with a giant water park, aquarium, and underwater suites.",
        "image": [
           "http://127.0.0.1:5001/uploads/Palm1.jpg",
            "http://127.0.0.1:5001/uploads/Palm2.jpg",
            "http://127.0.0.1:5001/uploads/Palm3.jpg",
            "http://127.0.0.1:5001/uploads/Palm4.jpg",
            "http://127.0.0.1:5001/uploads/Palm5.jpg"
        ],
        "price_list": [{"site": "Agoda", "price": 115000}, {"site": "Booking.com", "price": 120000}, {"site": "Official", "price": 125000}]
    }
]

df = pd.DataFrame(hotels_data)
print(f"✅ Created Database with {len(df)} hotels.")

# 2. LOAD BERT MODEL
print("⏳ Loading BERT AI Model...")
bert_model = SentenceTransformer('all-MiniLM-L6-v2')

# 3. EMBED DESCRIPTIONS
print("🧠 AI is reading hotel descriptions...")
df['combined_text'] = df['name'] + " " + df['location'] + " " + df['desc']
embeddings = bert_model.encode(df['combined_text'].tolist())

# 4. SAVE
with open('advanced_data.pkl', 'wb') as f:
    pickle.dump({'df': df, 'embeddings': embeddings, 'model': bert_model}, f)

print("✅ Advanced AI System Saved. Please restart your 'app.py' server.")