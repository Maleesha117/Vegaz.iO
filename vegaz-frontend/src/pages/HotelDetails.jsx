import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function HotelDetails() {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`http://127.0.0.1:5001/api/hotels/${id}`)
            .then(res => {
                setHotel(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to fetch hotel details.');
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!hotel) return <div className="text-center mt-5">Hotel not found.</div>;

    // Ensure we have 5 images for the premium gallery layout
    let images = Array.isArray(hotel.image) ? hotel.image : [hotel.image];
    // Pad array to 5 images by repeating
    while (images.length < 5) {
        images = [...images, ...images];
    }
    images = images.slice(0, 5);

    return (
        <div className="bg-light min-vh-100 pb-5">
            {/* Nav & Breadcrumbs */}
            <div className="container pt-3 pb-2">
                <nav aria-label="breadcrumb" className="d-flex justify-content-between align-items-center mb-1">
                    <ol className="breadcrumb mb-0 small" style={{ fontSize: '0.85rem' }}>
                        <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
                        <li className="breadcrumb-item"><a href="#" className="text-decoration-none text-secondary">Sri Lanka Hotels</a></li>
                        <li className="breadcrumb-item"><a href="#" className="text-decoration-none text-secondary">{hotel.location} Hotels</a></li>
                        <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Book {hotel.name}</li>
                    </ol>
                    <a href="#" className="text-primary text-decoration-none small fw-semibold">See all properties in {hotel.location}</a>
                </nav>
            </div>

            {/* Premium Image Gallery */}
            <div className="container mb-4">
                <div className="row g-2" style={{ height: '400px' }}>
                    {/* Large Main Image */}
                    <div className="col-md-6 h-100 position-relative">
                        <img src={images[0]} alt={hotel.name} className="w-100 h-100 object-fit-cover rounded-start shadow-sm" style={{ cursor: 'pointer' }} />
                        <button className="btn btn-light btn-sm position-absolute bottom-0 end-0 m-3 shadow d-flex align-items-center gap-2 fw-semibold">
                            📷 See all photos
                        </button>
                    </div>
                    {/* 4 Small Images Grid */}
                    <div className="col-md-6 h-100">
                        <div className="row g-2 h-100">
                            {images.slice(1, 5).map((imgUrl, idx) => (
                                <div className="col-6 h-50" key={idx}>
                                    <img
                                        src={imgUrl}
                                        alt={`Gallery ${idx + 1}`}
                                        className={`w-100 h-100 object-fit-cover shadow-sm ${idx === 1 ? 'rounded-top-end' : ''} ${idx === 3 ? 'rounded-bottom-end' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="container mb-4">
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        <ul className="nav nav-tabs border-0 px-3 pt-3 gap-3 d-flex flex-nowrap overflow-auto" style={{ borderBottom: '1px solid #e9ecef' }}>
                            {['Overview', 'Rooms', 'Trip recommendations', 'Facilities', 'Reviews', 'Location', 'Policies'].map((tab, i) => (
                                <li className="nav-item" key={tab}>
                                    <a
                                        className={`nav-link border-0 text-dark fw-semibold pb-3 ${i === 0 ? 'border-bottom border-primary border-3 active' : 'text-muted'}`}
                                        href="#"
                                        style={{ background: 'transparent', cursor: 'pointer' }}
                                    >
                                        {tab}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row g-4">
                    {/* Left Column: Details & Highlights */}
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h1 className="h3 fw-bold mb-0 d-flex align-items-center gap-2">
                                        {hotel.name}
                                        <span className="text-warning fs-5">
                                            {Array.from({ length: Math.round(parseFloat(hotel.rating || 0)) }).map((_, i) => '★').join('')}
                                        </span>
                                    </h1>
                                </div>
                                <p className="text-muted mb-3 d-flex align-items-center gap-2">
                                    📍 {hotel.location} - <a href="#" className="text-primary text-decoration-none fw-semibold">SEE MAP</a>
                                </p>
                                <p className="text-secondary" style={{ lineHeight: '1.6' }}>{hotel.desc}</p>
                            </div>
                        </div>

                        {/* Highlights Panel */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-4">Highlights</h4>
                                <div className="d-flex align-items-start mb-3">
                                    <div className="bg-light rounded p-2 me-3 fs-4">✨</div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Sparkling clean</h6>
                                        <p className="text-muted small mb-0">Guests have rated this property 9.3/10 on cleanliness</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start">
                                    <div className="bg-light rounded p-2 me-3 fs-4">🚌</div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Close to public transportation</h6>
                                        <p className="text-muted small mb-0">Transit stations are short distance away</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Reviews Summary */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-primary text-white rounded px-2 py-1 fw-bold fs-5 shadow-sm">
                                            {hotel.rating}
                                        </div>
                                        <div>
                                            <div className="fw-bold fs-5">Exceptional</div>
                                            <div className="text-secondary small">Based on reviews</div>
                                        </div>
                                    </div>
                                    <a href="#" className="text-primary text-decoration-none small fw-semibold">Read all reviews</a>
                                </div>

                                {/* Review Sub-scores */}
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {['Cleanliness 9.4', 'Location 9.4', 'Service 9.3', 'Facilities 9.2'].map(badge => (
                                        <span key={badge} className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1">
                                            {badge}
                                        </span>
                                    ))}
                                </div>

                                {/* Quotes */}
                                <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                                    {['"Facilities and breakfast was good too!"', '"The spa experience was really special..."'].map((quote, i) => (
                                        <div key={i} className="border rounded p-3 text-secondary small" style={{ minWidth: '80%' }}>
                                            {quote}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Card */}
                        <div className="card shadow-sm border-0 bg-primary text-white">
                            <div className="card-body p-4 text-center">
                                <h5>Starts at LKR {hotel.best_price?.toLocaleString()}</h5>
                                <button className="btn btn-light w-100 fw-bold text-primary mt-2">See Available Rooms</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rooms & Prices Section */}
                <h3 className="fw-bold mt-2 mb-4">Available Deals & Rooms</h3>
                <div className="card shadow-sm border-0 overflow-hidden mb-5">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="py-3 px-4">Provider / Room Type</th>
                                <th className="py-3 px-4 text-center">Inclusions</th>
                                <th className="py-3 px-4 text-end">Price per night</th>
                                <th className="py-3 px-4 w-25"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {hotel.price_list && hotel.price_list.map((offer, index) => (
                                <tr key={index}>
                                    <td className="py-3 px-4">
                                        <div className="fw-bold fs-6">{offer.site} Deal</div>
                                        <small className="text-success">✔ Free cancellation</small>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <small className="text-muted d-block">🛏️ 1 King Bed</small>
                                        <small className="text-muted d-block">☕ Breakfast included</small>
                                    </td>
                                    <td className="py-3 px-4 text-end">
                                        <h5 className="mb-0 text-dark fw-bold">LKR {offer.price.toLocaleString()}</h5>
                                        {index === 0 && <span className="badge bg-danger mt-1">Lowest Price</span>}
                                    </td>
                                    <td className="py-3 px-4 text-end">
                                        <button className="btn btn-primary fw-bold px-4">Reserve ➔</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

export default HotelDetails;
