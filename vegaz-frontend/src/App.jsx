import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';

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
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ background: 'linear-gradient(to right, #0052D4, #4364F7)' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/">VEGAZ.io</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            {userName ? (
              <>
                <li className="nav-item me-3">
                  <span className="nav-link text-white fw-medium">Welcome, {userName}!</span>
                </li>
                {userRole === "admin" && (
                  <li className="nav-item me-3">
                    <Link className="btn btn-sm btn-light fw-bold rounded-pill px-3 mt-1 text-primary" to="/admin">👑 Admin</Link>
                  </li>
                )}
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-outline-light btn-sm fw-bold rounded-pill px-4 mt-1">Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item me-2">
                  <Link className="nav-link text-white fw-medium" to="/login">Sign In</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-warning btn-sm fw-bold rounded-pill px-4" to="/signup">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;