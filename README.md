# 🏨 Vegaz.iO 

> The AI Integrated Hotel Reservation Platform for best value for your perfect stay.

Vegaz.iO is a full-stack, AI-powered hotel booking platform. It provides users with smart hotel recommendations and price predictions using advanced machine learning models. Built with a robust Flask & MongoDB backend and a responsive, dynamic React frontend.

![Frontend Preview](vegaz-frontend/public/vite.svg)

## ✨ Features

* **User Authentication**: Secure Login & Registration with JWT and bcrypt password hashing.
* **AI Price Prediction**: Intelligent forecasting of hotel prices based on seasonality and lead time.
* **Smart Recommendations**: Cosine-similarity based search for matching users with their perfect hotel.
* **Admin Dashboard**: Dedicated control panel for administrators to monitor user statistics and manually manage registered accounts.
* **Role-Based Access Control**: Secure routing ensuring only administrators can access the `Admin Control Panel`.

## 🛠️ Tech Stack

**Frontend:**
* React (Vite)
* React Router DOM
* Bootstrap 5 (Styling)
* Axios (HTTP Client)

**Backend:**
* Python (Flask)
* MongoDB (PyMongo)
* Scikit-Learn / Pandas (Machine Learning & Data Processing)
* PyJWT & Bcrypt (Security)

---

## 🚀 Getting Started

To run this project locally, you will need **Node.js**, **Python 3**, and **MongoDB Compass** installed on your machine.

### 1. Database Setup

1. Open **MongoDB Compass**.
2. Connect to local host: `mongodb://localhost:27017/`
3. Create a new database named `vegaz`.
4. Inside `vegaz`, create a collection named `users`.

### 2. Backend Setup (Flask API)

Open a terminal and navigate to the root directory `VegaZ.IO`.

```bash
# Provide the virtual environment
source .venv/bin/activate

# Install the required dependencies
pip install -r requirements.txt # (if applicable)

# Ensure ML models are generated (advanced_data.pkl & my_model.pkl)
python setup_advanced.py
python setup_project.py

# Run the Flask Server
python app.py
```

The backend server will start running on `http://127.0.0.1:5001`.

### 3. Frontend Setup (React/Vite)

Open a new terminal window and navigate to the frontend folder:

```bash
cd vegaz-frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend web app will start running on `http://localhost:5173`.

---

## 👑 Using the Admin Panel

The Admin Control Panel is accessible at `/admin`. To view it, you must either log in with SuperAdmin credentials or manually elevate a standard user.

**Default SuperAdmin Credentials:**
* Username: `Admin`
* Password: `Password`

*Alternatively, you can elevate any existing user by opening MongoDB Compass, editing the user document in the `vegaz.users` collection, and changing the `role` field from `'user'` to `'admin'`.*

---

*Developed by Maleesha117.*
