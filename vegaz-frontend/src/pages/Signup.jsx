import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:5001/api/signup', {
                name,
                email,
                password
            });
            // Redirect to login after successful registration
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center bg-light py-5" style={{ background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', minHeight: 'calc(100vh - 70px)' }}>
            <div className="card shadow-lg border-0 rounded-4 w-100 mx-3" style={{ maxWidth: '500px', overflow: 'hidden' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary">Create an Account</h2>
                        <p className="text-muted">Join VEGAZ.io for exclusive hotel deals.</p>
                    </div>

                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <form onSubmit={handleSignup}>
                        <div className="form-group mb-3">
                            <label className="form-label fw-semibold text-secondary small">Full Name</label>
                            <input
                                type="text"
                                className="form-control form-control-lg bg-light border-0"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

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
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold mb-3 shadow-sm" style={{ background: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)', border: 'none' }}>
                            Create Account
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-muted mb-0">Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-bold">Sign In</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
