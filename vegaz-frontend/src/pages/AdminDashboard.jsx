import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [stats, setStats] = useState({ total_users: 0, total_hotels: 0 });
    const [users, setUsers] = useState([]);

    // Admin Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('userRole') === 'admin' && localStorage.getItem('token') !== null
    );
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Add User State
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('user');
    const [addUserMessage, setAddUserMessage] = useState('');

    const fetchAdminData = () => {
        axios.get('http://127.0.0.1:5001/api/admin/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error("Error fetching stats:", err));

        axios.get('http://127.0.0.1:5001/api/admin/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error fetching users:", err));
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchAdminData();
        }
    }, [isAuthenticated]);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://127.0.0.1:5001/api/admin/login', {
                username: loginUsername,
                password: loginPassword
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userName', res.data.name);
            localStorage.setItem('userRole', res.data.role);
            window.dispatchEvent(new Event("storage"));
            setIsAuthenticated(true);
            setLoginError('');
        } catch (err) {
            setLoginError(err.response?.data?.error || 'Invalid Admin Credentials');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:5001/api/admin/add_user', {
                name: newUserName,
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole
            });
            setAddUserMessage('User added successfully!');
            // Reset form
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('user');
            // Refresh list and stats
            fetchAdminData();
            setTimeout(() => setAddUserMessage(''), 3000);
        } catch (err) {
            setAddUserMessage(err.response?.data?.error || 'Failed to add user');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="d-flex align-items-center justify-content-center bg-light" style={{ minHeight: 'calc(100vh - 70px)' }}>
                <div className="card shadow-lg border-0 rounded-4 w-100 mx-3" style={{ maxWidth: '400px' }}>
                    <div className="card-body p-5">
                        <h3 className="text-center fw-bold text-danger mb-4">Admin Access Only</h3>
                        {loginError && <div className="alert alert-danger py-2">{loginError}</div>}
                        <form onSubmit={handleAdminLogin}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">Admin Username</label>
                                <input type="text" className="form-control bg-light" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold small">Password</label>
                                <input type="password" className="form-control bg-light" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-danger w-100 fw-bold">Secure Login</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-primary fw-bold">⚙️ Admin Control Panel</h2>

            {/* Statistics Cards */}
            <div className="row mb-5">
                <div className="col-md-6">
                    <div className="card shadow border-0 bg-primary text-white h-100">
                        <div className="card-body d-flex flex-column justify-content-center text-center">
                            <h5>Total Registered Users</h5>
                            <h2 className="display-4 fw-bold">{stats.total_users}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card shadow border-0 bg-success text-white h-100">
                        <div className="card-body d-flex flex-column justify-content-center text-center">
                            <h5>Total Hotels in Database</h5>
                            <h2 className="display-4 fw-bold">{stats.total_hotels}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add User Section */}
            <h4 className="mb-3">➕ Create New User</h4>
            <div className="card shadow border-0 mb-5">
                <div className="card-body bg-light rounded">
                    {addUserMessage && (
                        <div className={`alert py-2 ${addUserMessage.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                            {addUserMessage}
                        </div>
                    )}
                    <form onSubmit={handleAddUser} className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Full Name</label>
                            <input type="text" className="form-control" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Email Address</label>
                            <input type="email" className="form-control" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Password</label>
                            <input type="password" className="form-control" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold small">Role</label>
                            <select className="form-select" value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="col-md-1 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary w-100 fw-bold">Add</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* User Management Table */}
            <h4 className="mb-3">Registered Users List</h4>
            <div className="card shadow border-0">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Account Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td className="fw-bold">{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                                            {user.role ? user.role.toUpperCase() : 'USER'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
