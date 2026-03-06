import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [stats, setStats] = useState({ total_users: 0, total_hotels: 0 });
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Fetch Admin Statistics (Total Users & Total Hotels)
        axios.get('http://127.0.0.1:5001/api/admin/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error("Error fetching stats:", err));

        // Fetch the list of all registered users
        axios.get('http://127.0.0.1:5001/api/admin/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error fetching users:", err));
    }, []);

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
