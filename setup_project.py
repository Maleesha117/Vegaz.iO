import pandas as pd
import numpy as np
import json
import pickle
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime

# ==========================================
# PART 1: MOCK API (Replacing Amadeus/MakCorps)
# ==========================================
print("--- 1. Generating Mock Hotel Database (JSON) ---")

# This list simulates the data you WOULD have gotten from an API
hotels_db = [
    {
        "id": 1,
        "name": "Shangri-La Colombo",
        "location": "Colombo, Sri Lanka",
        "base_price_lkr": 71200,
        "rating": 9.1,
        "image": "shangrila_img_url",
        "description": "Luxury hotel with ocean views."
    },
    {
        "id": 2,
        "name": "Cinnamon Grand",
        "location": "Colombo, Sri Lanka",
        "base_price_lkr": 55000,
        "rating": 8.8,
        "image": "cinnamon_img_url",
        "description": "Premium city hotel."
    },
    {
        "id": 3,
        "name": "Marino Beach Hotel",
        "location": "Colombo, Sri Lanka",
        "base_price_lkr": 32000,
        "rating": 8.5,
        "image": "marino_img_url",
        "description": "Modern hotel with infinity pool."
    },
    {
        "id": 4,
        "name": "Hilton Colombo",
        "location": "Colombo, Sri Lanka",
        "base_price_lkr": 62000,
        "rating": 8.9,
        "image": "hilton_img_url",
        "description": "Classic luxury in the heart of the city."
    }
]

# Save this to a file to act as your "Database"
with open('hotels_mock_db.json', 'w') as f:
    json.dump(hotels_db, f, indent=4)
print("✅ 'hotels_mock_db.json' created successfully.")


# ==========================================
# PART 2: TRAIN & SAVE AI MODEL (The "Brain")
# ==========================================
print("\n--- 2. Training Prediction Model ---")

# Since we don't know the inputs of your downloaded .pkl, 
# we will train a fresh one so we KNOW it works.
# Features: [Lead Time (days), Month (1-12), Current Price (LKR)]
# Target: [Predicted Future Price (LKR)]

# 1. Create fake training data (Simulating Kaggle Dataset)
data = {
    'lead_time': [1, 5, 10, 30, 60, 90, 2, 7, 15, 45, 1, 10],
    'month':     [1, 1,  1,  2,  2,  3, 5, 5,  6,  6, 12, 12],
    'current_price': [70000, 70000, 68000, 72000, 65000, 60000, 50000, 51000, 55000, 53000, 80000, 79000],
    # If price drops later, target is lower. If rises, target is higher.
    'future_price':  [75000, 72000, 68000, 65000, 60000, 58000, 52000, 53000, 60000, 58000, 90000, 85000]
}

df = pd.DataFrame(data)

# 2. Train Random Forest Model
X = df[['lead_time', 'month', 'current_price']] # Inputs
y = df['future_price']                          # Output to learn

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# 3. Save the model as a .pkl file
with open('my_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✅ 'my_model.pkl' trained and saved successfully.")


# ==========================================
# PART 3: TEST THE SYSTEM
# ==========================================
print("\n--- 3. Testing the AI Logic ---")

def get_ai_advice(hotel_price, lead_time, month):
    # Load model
    with open('my_model.pkl', 'rb') as f:
        loaded_model = pickle.load(f)
    
    # Predict future price
    # Input must match training columns: [lead_time, month, current_price]
    # Create a DataFrame for prediction to match training feature names
    input_data = pd.DataFrame([[lead_time, month, hotel_price]], 
                            columns=['lead_time', 'month', 'current_price'])
    prediction = loaded_model.predict(input_data)[0]
    
    print(f"Current Price: LKR {hotel_price}")
    print(f"AI Predicted Price: LKR {prediction:.2f}")
    
    if prediction > hotel_price:
        return "⚠️ Price likely to RISE. Advice: BUY NOW!"
    else:
        return "📉 Price likely to DROP. Advice: WAIT."

# Simulate a user checking "Shangri-La" (71200 LKR) for next month
advice = get_ai_advice(hotel_price=71200, lead_time=30, month=3)
print(f"\nAI Result: {advice}")