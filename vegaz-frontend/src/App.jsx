import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [predictions, setPredictions] = useState({});

  const fetchHotels = (query = '') => {
    const url = query
      ? `http://127.0.0.1:5001/api/hotels?query=${query}`
      : 'http://127.0.0.1:5001/api/hotels';

    axios.get(url)
      .then(response => { setHotels(response.data); })
      .catch(error => console.error("Error:", error));
  };

  useEffect(() => { fetchHotels(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchHotels(searchTerm); };

  const checkPricePrediction = (hotelId, currentPrice) => {
    axios.post('http://127.0.0.1:5001/api/predict', {
      current_price: currentPrice, lead_time: 30, month: 3
    }).then(res => {
      setPredictions(prev => ({ ...prev, [hotelId]: res.data }));
    });
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* HEADER */}
      <div className="bg-primary text-white py-5 mb-5 shadow" style={{ background: 'linear-gradient(to right, #0052D4, #4364F7, #6FB1FC)' }}>
        <div className="container text-center">
          <h1 className="display-4 fw-bold">VEGAZ.io</h1>
          <p className="lead mb-4">Find the Perfect Hotel at the Best Value with AI</p>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <form onSubmit={handleSearch} className="input-group input-group-lg shadow-sm">
                <input type="text" className="form-control" placeholder="Describe your dream stay (e.g., 'Luxury with pool' or 'London')"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button className="btn btn-warning fw-bold px-4" type="submit">AI Search</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          {hotels.map(hotel => (
            <div className="col-lg-6 mb-5" key={hotel.id}>
              <div className="card shadow-sm border-0 h-100 overflow-hidden hover-shadow">

                {/* IMAGE DISPLAY (Clean, no buttons) */}
                <div style={{ height: '250px', overflow: 'hidden', position: 'relative' }}>
                  <img src={hotel.image} alt={hotel.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className="badge bg-white text-dark fs-6 shadow-sm">⭐ {hotel.rating}</span>
                  </div>
                </div>

                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className="card-title h4 mb-0">{hotel.name}</h3>
                    <small className="text-muted">📍 {hotel.location}</small>
                  </div>
                  <p className="card-text text-secondary small flex-grow-1">{hotel.desc}</p>

                  {/* PRICE COMPARISON */}
                  <div className="bg-light p-3 rounded mb-3 border">
                    <h6 className="text-uppercase text-muted small fw-bold mb-2">🏷️ Price Comparison</h6>
                    <table className="table table-sm table-borderless mb-0 small">
                      <tbody>
                        {hotel.price_list.map((offer, index) => (
                          <tr key={index}>
                            <td>{offer.site}</td>
                            <td className="text-end fw-bold">LKR {offer.price.toLocaleString()}</td>
                            <td className="text-end" style={{ width: '20px' }}>{index === 0 && <span className="badge bg-success">BEST</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="row g-2 align-items-center">
                    <div className="col-6">
                      <h4 className="text-success fw-bold mb-0">LKR {hotel.best_price.toLocaleString()}</h4>
                      <small className="text-muted">per night</small>
                    </div>
                    <div className="col-6 text-end">
                      {!predictions[hotel.id] ? (
                        <button className="btn btn-outline-primary w-100 btn-sm" onClick={() => checkPricePrediction(hotel.id, hotel.best_price)}>
                          🔮 AI Forecast
                        </button>
                      ) : (
                        <div className={`alert ${predictions[hotel.id].color === 'red' ? 'alert-danger' : 'alert-success'} p-1 m-0 text-center small`}>
                          <strong>{predictions[hotel.id].advice}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="btn btn-dark w-100 mt-3 fw-bold">View Deal ➔</button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;