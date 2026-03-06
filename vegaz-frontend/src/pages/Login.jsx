import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5001/api/login', {
                email,
                password
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userName', response.data.name);
            // Dispatch a custom event to update navbar dynamically
            window.dispatchEvent(new Event("storage"));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center bg-light py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: 'calc(100vh - 70px)' }}>
            <div className="card shadow-lg border-0 rounded-4 w-100 mx-3" style={{ maxWidth: '450px', overflow: 'hidden' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary">Welcome Back</h2>
                        <p className="text-muted">Sign in to book your dream stay.</p>
                    </div>

                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="form-group mb-3">
                            <label className="form-label fw-semibold text-secondary small">Email Address</label>
                            <input
                                type="email"
                                className="form-control form-control-lg bg-light border-0"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label fw-semibold text-secondary small">Password</label>
                            <input
                                type="password"
                                className="form-control form-control-lg bg-light border-0"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold mb-3 shadow-sm" style={{ background: 'linear-gradient(to right, #0052D4, #4364F7)' }}>
                            Sign In
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-muted mb-0">Don't have an account? <Link to="/signup" className="text-primary text-decoration-none fw-bold">Sign Up</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
