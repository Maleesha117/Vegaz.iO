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

    // Add Hotel State
    const [hotelData, setHotelData] = useState({
        name: '', location: '', desc: '', rating: '5.0', images: '',
        price_agoda: '', price_official: '', price_booking: ''
    });
    const [addHotelMessage, setAddHotelMessage] = useState('');
    const [customHotels, setCustomHotels] = useState([]);
    const [editingHotelId, setEditingHotelId] = useState(null);

    // AI Prediction Test State
    const [testPrice, setTestPrice] = useState('');
    const [predictionResult, setPredictionResult] = useState(null);

    const fetchAdminData = () => {
        axios.get('http://127.0.0.1:5001/api/admin/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error("Error fetching stats:", err));

        axios.get('http://127.0.0.1:5001/api/admin/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error fetching users:", err));

        axios.get('http://127.0.0.1:5001/api/admin/hotels')
            .then(res => setCustomHotels(res.data))
            .catch(err => console.error("Error fetching hotels:", err));
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
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('user');
            fetchAdminData();
            setTimeout(() => setAddUserMessage(''), 3000);
        } catch (err) {
            setAddUserMessage(err.response?.data?.error || 'Failed to add user');
        }
    };

    const handleAddHotel = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', hotelData.name);
            formData.append('location', hotelData.location);
            formData.append('desc', hotelData.desc);
            formData.append('rating', hotelData.rating);
            formData.append('price_agoda', hotelData.price_agoda);
            formData.append('price_official', hotelData.price_official);
            formData.append('price_booking', hotelData.price_booking);

            if (hotelData.images && hotelData.images.length > 0) {
                Array.from(hotelData.images).forEach(file => {
                    formData.append('images', file);
                });
            }

            if (editingHotelId) {
                await axios.put(`http://127.0.0.1:5001/api/admin/edit_hotel/${editingHotelId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setAddHotelMessage('🏨 Proprietary Hotel updated successfully!');
            } else {
                await axios.post('http://127.0.0.1:5001/api/admin/add_hotel', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setAddHotelMessage('🏨 Proprietary Hotel added and images uploaded fully!');
            }

            setHotelData({
                name: '', location: '', desc: '', rating: '5.0', images: '',
                price_agoda: '', price_official: '', price_booking: ''
            });
            setEditingHotelId(null);

            const fileInput = document.getElementById('hotelImagesUpload');
            if (fileInput) fileInput.value = '';

            fetchAdminData();
            setTimeout(() => setAddHotelMessage(''), 4000);
        } catch (err) {
            setAddHotelMessage(err.response?.data?.error || 'Failed to process hotel');
            setTimeout(() => setAddHotelMessage(''), 4000);
        }
    };

    const handleEditClick = (hotel) => {
        setEditingHotelId(hotel.id);
        setHotelData({
            name: hotel.name || '',
            location: hotel.location || '',
            desc: hotel.desc || '',
            rating: hotel.rating || '5.0',
            images: '', // Cannot securely pre-fill file inputs natively. Kept blank for re-upload if needed.
            price_agoda: hotel.price_list?.find(p => p.site === 'Agoda')?.price || '',
            price_official: hotel.price_list?.find(p => p.site === 'Official')?.price || '',
            price_booking: hotel.price_list?.find(p => p.site === 'Booking.com')?.price || ''
        });
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingHotelId(null);
        setHotelData({
            name: '', location: '', desc: '', rating: '5.0', images: '',
            price_agoda: '', price_official: '', price_booking: ''
        });
        const fileInput = document.getElementById('hotelImagesUpload');
        if (fileInput) fileInput.value = '';
    };

    const handleAITest = async (e) => {
        e.preventDefault();
        if (!testPrice) return;
        try {
            const res = await axios.post('http://127.0.0.1:5001/api/predict', {
                current_price: parseFloat(testPrice), lead_time: 30, month: 3
            });
            setPredictionResult(res.data);
        } catch (err) {
            console.error("AI test error", err);
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

            {/* Add/Edit Proprietary Hotel Section */}
            <h4 className="mb-3 mt-5">{editingHotelId ? '✏️ Edit Proprietary Hotel' : '🏨 Add Proprietary Hotel'}</h4>
            <div className="card shadow border-0 mb-5">
                <div className="card-body bg-light rounded">
                    {addHotelMessage && (
                        <div className={`alert py-2 ${addHotelMessage.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                            {addHotelMessage}
                        </div>
                    )}

                    <form onSubmit={handleAddHotel}>
                        {/* Basic Overview Row */}
                        <div className="row g-3 mb-3">
                            <div className="col-md-5">
                                <label className="form-label fw-bold small">Hotel Name</label>
                                <input type="text" className="form-control" value={hotelData.name} onChange={e => setHotelData({ ...hotelData, name: e.target.value })} placeholder="e.g. The Grand Palace" required />
                            </div>
                            <div className="col-md-5">
                                <label className="form-label fw-bold small">Location (City, Country)</label>
                                <input type="text" className="form-control" value={hotelData.location} onChange={e => setHotelData({ ...hotelData, location: e.target.value })} placeholder="e.g. Dubai, UAE" required />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label fw-bold small">Star Rating</label>
                                <input type="number" step="0.1" max="5" className="form-control" value={hotelData.rating} onChange={e => setHotelData({ ...hotelData, rating: e.target.value })} required />
                            </div>
                        </div>

                        {/* Description & Media */}
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Marketing Description</label>
                                <textarea className="form-control" rows="3" value={hotelData.desc} onChange={e => setHotelData({ ...hotelData, desc: e.target.value })} placeholder="Describe the luxury details..."></textarea>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Upload Hotel Images</label>
                                <input
                                    type="file"
                                    id="hotelImagesUpload"
                                    className="form-control"
                                    multiple
                                    accept="image/*"
                                    onChange={e => setHotelData({ ...hotelData, images: e.target.files })}
                                />
                                <small className="text-muted d-block mt-1">
                                    {editingHotelId ? 'Selecting new images will replace existing ones. Leave blank to keep current photos.' : 'Select multiple images to populate the premium gallery.'}
                                </small>
                            </div>
                        </div>

                        {/* Pricing & AI Test Section */}
                        <div className="row g-3 align-items-end mb-4">
                            <div className="col-md-3">
                                <label className="form-label fw-bold small text-primary">Agoda Price (LKR)</label>
                                <input type="number" className="form-control" value={hotelData.price_agoda} onChange={e => setHotelData({ ...hotelData, price_agoda: e.target.value })} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold small text-primary">Official Site Price (LKR)</label>
                                <input type="number" className="form-control" value={hotelData.price_official} onChange={e => setHotelData({ ...hotelData, price_official: e.target.value })} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold small text-primary">Booking.com Price (LKR)</label>
                                <input type="number" className="form-control" value={hotelData.price_booking} onChange={e => setHotelData({ ...hotelData, price_booking: e.target.value })} required />
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded border mb-4 shadow-sm">
                            <div className="d-flex gap-3 align-items-center w-50">
                                <div>
                                    <label className="form-label fw-bold small mb-0 text-muted">Test AI Forecast Prediction</label>
                                    <div className="input-group">
                                        <input type="number" className="form-control form-control-sm" placeholder="Enter previous LKR price..." value={testPrice} onChange={e => setTestPrice(e.target.value)} />
                                        <button className="btn btn-outline-info btn-sm fw-bold" type="button" onClick={handleAITest}>Test AI ✨</button>
                                    </div>
                                </div>
                                {predictionResult && (
                                    <div className={`mt-4 mb-0 alert py-1 px-3 fw-bold small ${predictionResult.color === 'red' ? 'alert-danger' : 'alert-success'}`}>
                                        {predictionResult.advice}
                                    </div>
                                )}
                            </div>

                            <div className="d-flex gap-2">
                                {editingHotelId && (
                                    <button type="button" className="btn btn-secondary btn-lg fw-bold px-4 shadow-sm" onClick={handleCancelEdit}>Cancel</button>
                                )}
                                <button type="submit" className={`btn ${editingHotelId ? 'btn-success' : 'btn-primary'} btn-lg fw-bold px-5 shadow`}>
                                    {editingHotelId ? 'Update Hotel in Database' : 'Publish Hotel to Database'}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>

            {/* Custom Hotels Database List */}
            <h4 className="mb-3 mt-5">📋 Registered Proprietary Hotels</h4>
            <div className="card shadow border-0 mb-5">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4 py-3">Hotel Name</th>
                                    <th className="py-3">Location</th>
                                    <th className="py-3 text-center">Images</th>
                                    <th className="py-3 text-center">Rating</th>
                                    <th className="px-4 py-3 text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customHotels.map(hotel => (
                                    <tr key={hotel.id}>
                                        <td className="px-4 py-3 fw-bold">{hotel.name}</td>
                                        <td className="py-3 text-muted">{hotel.location}</td>
                                        <td className="py-3 text-center"><span className="badge bg-secondary">{hotel.image?.length || 0} Photos</span></td>
                                        <td className="py-3 text-center text-warning fw-bold">★ {hotel.rating}</td>
                                        <td className="px-4 py-3 text-end">
                                            <button
                                                className="btn btn-sm btn-outline-primary fw-bold px-3 py-1"
                                                onClick={() => handleEditClick(hotel)}
                                            >
                                                Edit Data
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {customHotels.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            No proprietary hotels added yet. Add one above!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
