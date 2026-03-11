import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import HotelDetails from './pages/HotelDetails';

function Navigation() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  useEffect(() => {
    const handleStorageChange = () => {
      setUserName(localStorage.getItem('userName'));
      setUserRole(localStorage.getItem('userRole'));
    };

    // Listen to custom event dispatched by Login Page and storage events
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setUserName(null);
    setUserRole(null);
    navigate('/login');
  };

  return (
    <div className="bg-primary text-white py-4 mb-5 shadow" style={{ background: 'linear-gradient(to right, #0052D4, #4364F7, #6FB1FC)' }}>
      <div className="container d-flex justify-content-between align-items-center">

        {/* Logo / Brand Name */}
        <h2 className="fw-bold m-0" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          VEGAZ.io
        </h2>

        {/* User Controls */}
        <div className="d-flex align-items-center">

          {userName ? (
            <>
              {/* 🟢 THE MAGIC CONDITIONAL BUTTON 🟢 */}
              {userRole === 'admin' && (
                <button
                  className="btn btn-sm btn-warning fw-bold me-3 shadow-sm"
                  onClick={() => navigate('/admin')}
                >
                  ⚙️ Admin Panel
                </button>
              )}

              {/* Standard User Info & Logout */}
              <span className="me-3 fs-6">👤 Hello, {userName}</span>
              <button className="btn btn-sm btn-light fw-bold text-primary shadow-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-sm btn-outline-light fw-bold me-2 px-4 shadow-sm" to="/login">Sign In</Link>
              <Link className="btn btn-sm btn-warning fw-bold me-3 px-4 shadow-sm" to="/signup">Sign Up</Link>
              <button
                className="btn btn-sm btn-light fw-bold text-primary shadow-sm"
                onClick={() => navigate('/admin')}
              >
                ⚙️ Admin
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-vh-100 d-flex flex-column">
        <Navigation />
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/hotel/:id" element={<HotelDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;