import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import geolocationService from '../../services/geolocation';

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    destinationName: '',
    destinationLat: '',
    destinationLng: '',
    alertType: 'distance',
    distanceKm: 5,
    minutesBefore: 10,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const position = await geolocationService.getCurrentPosition();
      setCurrentLocation(position);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setFormData({
        ...formData,
        destinationLat: currentLocation.latitude,
        destinationLng: currentLocation.longitude
      });
    }
  };

  // Sample destinations for quick selection
  const sampleDestinations = [
    { name: 'New Delhi Railway Station', lat: 28.6428, lng: 77.2197 },
    { name: 'Mumbai Central', lat: 18.9681, lng: 72.8196 },
    { name: 'Bengaluru City Junction', lat: 12.9776, lng: 77.5718 },
    { name: 'Chennai Central', lat: 13.0827, lng: 80.2751 }
  ];

  const selectSampleDestination = (dest) => {
    setFormData({
      ...formData,
      destinationName: dest.name,
      destinationLat: dest.lat,
      destinationLng: dest.lng
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.destinationName || !formData.destinationLat || !formData.destinationLng) {
      setError('Please provide complete destination details');
      return;
    }

    setLoading(true);

    try {
      const tripData = {
        destination: {
          name: formData.destinationName,
          coordinates: {
            latitude: parseFloat(formData.destinationLat),
            longitude: parseFloat(formData.destinationLng)
          }
        },
        alertType: formData.alertType,
        alertConfig: {
          distanceKm: parseInt(formData.distanceKm),
          minutesBefore: parseInt(formData.minutesBefore)
        },
        notes: formData.notes
      };

      const response = await api.post('/trips', tripData);
      navigate(`/trip/${response.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h2>Create New Trip</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Destination Name *</label>
            <input
              type="text"
              name="destinationName"
              value={formData.destinationName}
              onChange={handleChange}
              placeholder="e.g., Connaught Place, Delhi"
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.5rem', color: '#666' }}>Quick Select:</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {sampleDestinations.map((dest, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => selectSampleDestination(dest)}
                >
                  {dest.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Destination Latitude *</label>
            <input
              type="number"
              step="any"
              name="destinationLat"
              value={formData.destinationLat}
              onChange={handleChange}
              placeholder="28.6139"
              required
            />
          </div>

          <div className="form-group">
            <label>Destination Longitude *</label>
            <input
              type="number"
              step="any"
              name="destinationLng"
              value={formData.destinationLng}
              onChange={handleChange}
              placeholder="77.2090"
              required
            />
            {currentLocation && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem', width: '100%' }}
                onClick={useCurrentLocation}
              >
                Use Current Location
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Alert Type *</label>
            <select
              name="alertType"
              value={formData.alertType}
              onChange={handleChange}
              required
            >
              <option value="distance">Distance-Based Alert</option>
              <option value="route">Route-Based Alert</option>
              <option value="eta">ETA-Based Alert</option>
            </select>
          </div>

          {(formData.alertType === 'distance' || formData.alertType === 'route') && (
            <div className="form-group">
              <label>Alert Distance (km)</label>
              <input
                type="number"
                name="distanceKm"
                value={formData.distanceKm}
                onChange={handleChange}
                min="1"
                max="50"
              />
              <small style={{ color: '#666' }}>
                Alert when you are within {formData.distanceKm} km of destination
              </small>
            </div>
          )}

          {formData.alertType === 'eta' && (
            <div className="form-group">
              <label>Alert Before (minutes)</label>
              <input
                type="number"
                name="minutesBefore"
                value={formData.minutesBefore}
                onChange={handleChange}
                min="1"
                max="60"
              />
              <small style={{ color: '#666' }}>
                Alert {formData.minutesBefore} minutes before arrival
              </small>
            </div>
          )}

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this trip..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;




// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../../services/api';
// import geolocationService from '../../services/geolocation';
// import TripMap from '../Map/TripMap';

// const CreateTrip = () => {
//   const [formData, setFormData] = useState({
//     destinationName: '',
//     destinationLat: '',
//     destinationLng: '',
//     alertType: 'distance',
//     distanceKm: 5,
//     minutesBefore: 10,
//     notes: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [selectedDestination, setSelectedDestination] = useState(null);

//   const navigate = useNavigate();

//   useEffect(() => {
//     getCurrentLocation();
//   }, []);

//   const getCurrentLocation = async () => {
//     try {
//       const position = await geolocationService.getCurrentPosition();
//       setCurrentLocation(position);
//     } catch (error) {
//       console.error('Error getting location:', error);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const useCurrentLocation = () => {
//     if (currentLocation) {
//       setFormData({
//         ...formData,
//         destinationLat: currentLocation.latitude,
//         destinationLng: currentLocation.longitude
//       });
//       setSelectedDestination({
//         coordinates: {
//           latitude: currentLocation.latitude,
//           longitude: currentLocation.longitude
//         }
//       });
//     }
//   };

//   // Handle map click to select destination
//   const handleMapClick = (position) => {
//     setFormData({
//       ...formData,
//       destinationLat: position.latitude,
//       destinationLng: position.longitude
//     });
//     setSelectedDestination({
//       coordinates: {
//         latitude: position.latitude,
//         longitude: position.longitude
//       }
//     });
//   };

//   // Sample destinations for quick selection
//   const sampleDestinations = [
//     { name: 'New Delhi Railway Station', lat: 28.6428, lng: 77.2197 },
//     { name: 'Mumbai Central', lat: 18.9681, lng: 72.8196 },
//     { name: 'Bengaluru City Junction', lat: 12.9776, lng: 77.5718 },
//     { name: 'Chennai Central', lat: 13.0827, lng: 80.2751 }
//   ];

//   const selectSampleDestination = (dest) => {
//     setFormData({
//       ...formData,
//       destinationName: dest.name,
//       destinationLat: dest.lat,
//       destinationLng: dest.lng
//     });
//     setSelectedDestination({
//       name: dest.name,
//       coordinates: {
//         latitude: dest.lat,
//         longitude: dest.lng
//       }
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (!formData.destinationName || !formData.destinationLat || !formData.destinationLng) {
//       setError('Please provide complete destination details');
//       return;
//     }

//     setLoading(true);

//     try {
//       const tripData = {
//         destination: {
//           name: formData.destinationName,
//           coordinates: {
//             latitude: parseFloat(formData.destinationLat),
//             longitude: parseFloat(formData.destinationLng)
//           }
//         },
//         alertType: formData.alertType,
//         alertConfig: {
//           distanceKm: parseInt(formData.distanceKm),
//           minutesBefore: parseInt(formData.minutesBefore)
//         },
//         notes: formData.notes
//       };

//       const response = await api.post('/trips', tripData);
//       navigate(`/trip/${response.data._id}`);
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to create trip');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container">
//       <div className="auth-card" style={{ maxWidth: '900px', margin: '2rem auto' }}>
//         <h2>Create New Trip</h2>
//         {error && <div className="error-message">{error}</div>}

//         {/* MAP SECTION - NEW! */}
//         <div style={{ marginBottom: '2rem' }}>
//           <h3 style={{ marginBottom: '1rem' }}>🗺️ Select Destination on Map</h3>
//           <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
//             Click on the map to select your destination, or use the form below
//           </p>
//           <TripMap 
//             currentPosition={currentLocation}
//             destination={selectedDestination}
//             onMapClick={handleMapClick}
//             height="350px"
//           />
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Destination Name *</label>
//             <input
//               type="text"
//               name="destinationName"
//               value={formData.destinationName}
//               onChange={handleChange}
//               placeholder="e.g., Connaught Place, Delhi"
//               required
//             />
//           </div>

//           <div style={{ marginBottom: '1rem' }}>
//             <p style={{ marginBottom: '0.5rem', color: '#666' }}>Quick Select:</p>
//             <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
//               {sampleDestinations.map((dest, idx) => (
//                 <button
//                   key={idx}
//                   type="button"
//                   className="btn btn-secondary"
//                   style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
//                   onClick={() => selectSampleDestination(dest)}
//                 >
//                   {dest.name}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
//             <div className="form-group">
//               <label>Destination Latitude *</label>
//               <input
//                 type="number"
//                 step="any"
//                 name="destinationLat"
//                 value={formData.destinationLat}
//                 onChange={handleChange}
//                 placeholder="28.6139"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label>Destination Longitude *</label>
//               <input
//                 type="number"
//                 step="any"
//                 name="destinationLng"
//                 value={formData.destinationLng}
//                 onChange={handleChange}
//                 placeholder="77.2090"
//                 required
//               />
//             </div>
//           </div>

//           {currentLocation && (
//             <button
//               type="button"
//               className="btn btn-secondary"
//               style={{ marginBottom: '1rem', width: '100%' }}
//               onClick={useCurrentLocation}
//             >
//               📍 Use My Current Location as Destination
//             </button>
//           )}

//           <div className="form-group">
//             <label>Alert Type *</label>
//             <select
//               name="alertType"
//               value={formData.alertType}
//               onChange={handleChange}
//               required
//             >
//               <option value="distance">Distance-Based Alert</option>
//               <option value="route">Route-Based Alert</option>
//               <option value="eta">ETA-Based Alert</option>
//             </select>
//           </div>

//           {(formData.alertType === 'distance' || formData.alertType === 'route') && (
//             <div className="form-group">
//               <label>Alert Distance (km)</label>
//               <input
//                 type="number"
//                 name="distanceKm"
//                 value={formData.distanceKm}
//                 onChange={handleChange}
//                 min="1"
//                 max="50"
//               />
//               <small style={{ color: '#666' }}>
//                 Alert when you are within {formData.distanceKm} km of destination
//               </small>
//             </div>
//           )}

//           {formData.alertType === 'eta' && (
//             <div className="form-group">
//               <label>Alert Before (minutes)</label>
//               <input
//                 type="number"
//                 name="minutesBefore"
//                 value={formData.minutesBefore}
//                 onChange={handleChange}
//                 min="1"
//                 max="60"
//               />
//               <small style={{ color: '#666' }}>
//                 Alert {formData.minutesBefore} minutes before arrival
//               </small>
//             </div>
//           )}

//           <div className="form-group">
//             <label>Notes (Optional)</label>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               placeholder="Add any notes about this trip..."
//             />
//           </div>

//           <div style={{ display: 'flex', gap: '1rem' }}>
//             <button
//               type="button"
//               className="btn btn-secondary"
//               onClick={() => navigate('/')}
//               style={{ flex: 1 }}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="btn btn-primary"
//               disabled={loading}
//               style={{ flex: 1 }}
//             >
//               {loading ? 'Creating...' : 'Create Trip'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateTrip;