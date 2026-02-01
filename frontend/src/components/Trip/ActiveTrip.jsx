import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import geolocationService from '../../services/geolocation';
import alertService from '../../services/alertService';
import { calculateDistance, calculateETA, formatDistance, formatTime, shouldTriggerAlert } from '../../utils/calculations';
import AlertNotification from '../Alert/AlertNotification';

const ActiveTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [simulationMode, setSimulationMode] = useState(false);
  
  const watchIdRef = useRef(null);
  const alertTriggeredRef = useRef(false);
  const simulationIndexRef = useRef(0);
  const simulationIntervalRef = useRef(null);

  useEffect(() => {
    fetchTrip();
    return () => {
      stopTracking();
    };
  }, [id]);

  useEffect(() => {
    if (trip && currentPosition) {
      updateDistanceAndETA();
      checkAlert();
    }
  }, [currentPosition, trip]);

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
      
      // Auto-start tracking if trip is active
      if (response.data.status === 'active') {
        startTracking();
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      alert('Trip not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const updateDistanceAndETA = () => {
    if (!currentPosition || !trip) return;

    const dist = calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      trip.destination.coordinates.latitude,
      trip.destination.coordinates.longitude
    );

    const etaMinutes = calculateETA(dist);

    setDistance(dist);
    setEta(etaMinutes);
  };

  const checkAlert = () => {
    if (!currentPosition || !trip || alertTriggeredRef.current) return;

    const shouldAlert = shouldTriggerAlert(
      currentPosition,
      trip.destination,
      trip.alertType,
      trip.alertConfig
    );

    if (shouldAlert) {
      triggerAlert();
    }
  };

  const triggerAlert = async () => {
    if (alertTriggeredRef.current) return;

    alertTriggeredRef.current = true;
    setShowAlert(true);
    alertService.triggerAlert(trip.destination.name);

    try {
      await api.put(`/trips/${trip._id}/alert`);
    } catch (error) {
      console.error('Error marking alert:', error);
    }
  };

  const startTracking = async () => {
    try {
      const position = await geolocationService.getCurrentPosition();
      setCurrentPosition(position);
      setIsTracking(true);

      // Start watching position
      watchIdRef.current = geolocationService.startWatching((newPosition) => {
        setCurrentPosition(newPosition);
      });

      // Start trip if pending
      if (trip.status === 'pending') {
        await api.put(`/trips/${trip._id}/start`);
        setTrip({ ...trip, status: 'active' });
      }
    } catch (error) {
      console.error('Error starting tracking:', error);
      alert('Failed to get location. Please enable location services.');
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      geolocationService.stopWatching();
      watchIdRef.current = null;
    }
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    
    setIsTracking(false);
    setSimulationMode(false);
  };

  const completeTrip = async () => {
    try {
      await api.put(`/trips/${trip._id}/complete`);
      stopTracking();
      alert('Trip completed successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error completing trip:', error);
      alert('Failed to complete trip');
    }
  };

  const startSimulation = async () => {
    try {
      // Get current position or use a default
      let startPos = currentPosition;
      if (!startPos) {
        startPos = await geolocationService.getCurrentPosition();
        setCurrentPosition(startPos);
      }

      // Generate simulated positions moving towards destination
      const positions = geolocationService.simulateMovement(
        trip.destination.coordinates,
        20
      );

      setSimulationMode(true);
      setIsTracking(true);
      simulationIndexRef.current = 0;

      // Update position every 2 seconds
      simulationIntervalRef.current = setInterval(() => {
        if (simulationIndexRef.current < positions.length) {
          setCurrentPosition(positions[simulationIndexRef.current]);
          simulationIndexRef.current++;
        } else {
          clearInterval(simulationIntervalRef.current);
          setSimulationMode(false);
        }
      }, 2000);

      // Start trip if pending
      if (trip.status === 'pending') {
        await api.put(`/trips/${trip._id}/start`);
        setTrip({ ...trip, status: 'active' });
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
      alert('Failed to start simulation');
    }
  };

  if (loading) {
    return <div className="loading">Loading trip details...</div>;
  }

  if (!trip) {
    return <div className="loading">Trip not found</div>;
  }

  return (
    <div className="container">
      <div className="active-trip">
        <div className="trip-detail-card">
          <h2>📍 {trip.destination.name}</h2>
          
          <div className="trip-info">
            <div className="trip-info-item">
              <strong>Status:</strong>
              <span className={`trip-badge badge-${trip.status}`}>
                {trip.status.toUpperCase()}
              </span>
            </div>
            
            <div className="trip-info-item">
              <strong>Alert Type:</strong> {trip.alertType}
            </div>

            {trip.alertType === 'distance' && (
              <div className="trip-info-item">
                <strong>Alert Distance:</strong> {trip.alertConfig.distanceKm} km
              </div>
            )}

            {trip.alertType === 'eta' && (
              <div className="trip-info-item">
                <strong>Alert Before:</strong> {trip.alertConfig.minutesBefore} min
              </div>
            )}

            <div className="trip-info-item">
              <strong>Coordinates:</strong> {trip.destination.coordinates.latitude.toFixed(4)}, {trip.destination.coordinates.longitude.toFixed(4)}
            </div>

            {trip.notes && (
              <div className="trip-info-item">
                <strong>Notes:</strong> {trip.notes}
              </div>
            )}
          </div>

          {isTracking && currentPosition && (
            <div className="tracking-info">
              <h3>📡 Live Tracking</h3>
              <div className="tracking-stats">
                <div className="stat-item">
                  <div className="stat-value">{distance !== null ? formatDistance(distance) : '--'}</div>
                  <div className="stat-label">Distance to Destination</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{eta !== null ? formatTime(eta) : '--'}</div>
                  <div className="stat-label">Estimated Time</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {currentPosition.latitude.toFixed(4)}, {currentPosition.longitude.toFixed(4)}
                  </div>
                  <div className="stat-label">Current Position</div>
                </div>
              </div>
              {simulationMode && (
                <div style={{ textAlign: 'center', marginTop: '1rem', color: '#667eea' }}>
                  🎮 Simulation Mode Active
                </div>
              )}
            </div>
          )}

          <div className="control-buttons">
            {!isTracking ? (
              <>
                <button className="btn btn-success" onClick={startTracking}>
                  🎯 Start Tracking
                </button>
                <button className="btn btn-primary" onClick={startSimulation}>
                  🎮 Test with Simulation
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-danger" onClick={stopTracking}>
                  ⏹️ Stop Tracking
                </button>
                <button className="btn btn-success" onClick={completeTrip}>
                  ✅ Complete Trip
                </button>
              </>
            )}
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              🏠 Back to Dashboard
            </button>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>ℹ️ How it works:</h4>
            <ul style={{ marginLeft: '1.5rem', color: '#666' }}>
              <li>Click "Start Tracking" to use real GPS location</li>
              <li>Or click "Test with Simulation" to simulate movement towards destination</li>
              <li>You'll receive an alert when you reach the configured distance/time</li>
              <li>Alert includes sound, notification, and visual popup</li>
              <li>Complete the trip when you reach your destination</li>
            </ul>
          </div>
        </div>
      </div>

      {showAlert && (
        <AlertNotification 
          destination={trip.destination.name}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default ActiveTrip;












// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import api from '../../services/api';
// import geolocationService from '../../services/geolocation';
// import alertService from '../../services/alertService';
// import { calculateDistance, calculateETA, formatDistance, formatTime, shouldTriggerAlert } from '../../utils/calculations';
// import AlertNotification from '../Alert/AlertNotification';
// import TripMap from '../Map/TripMap';

// const ActiveTrip = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [trip, setTrip] = useState(null);
//   const [currentPosition, setCurrentPosition] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [eta, setEta] = useState(null);
//   const [isTracking, setIsTracking] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [simulationMode, setSimulationMode] = useState(false);
  
//   const watchIdRef = useRef(null);
//   const alertTriggeredRef = useRef(false);
//   const simulationIndexRef = useRef(0);
//   const simulationIntervalRef = useRef(null);

//   useEffect(() => {
//     fetchTrip();
//     return () => {
//       stopTracking();
//     };
//   }, [id]);

//   useEffect(() => {
//     if (trip && currentPosition) {
//       updateDistanceAndETA();
//       checkAlert();
//     }
//   }, [currentPosition, trip]);

//   const fetchTrip = async () => {
//     try {
//       const response = await api.get(`/trips/${id}`);
//       setTrip(response.data);
      
//       // Auto-start tracking if trip is active
//       if (response.data.status === 'active') {
//         startTracking();
//       }
//     } catch (error) {
//       console.error('Error fetching trip:', error);
//       alert('Trip not found');
//       navigate('/');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateDistanceAndETA = () => {
//     if (!currentPosition || !trip) return;

//     const dist = calculateDistance(
//       currentPosition.latitude,
//       currentPosition.longitude,
//       trip.destination.coordinates.latitude,
//       trip.destination.coordinates.longitude
//     );

//     const etaMinutes = calculateETA(dist);

//     setDistance(dist);
//     setEta(etaMinutes);
//   };

//   const checkAlert = () => {
//     if (!currentPosition || !trip || alertTriggeredRef.current) return;

//     const shouldAlert = shouldTriggerAlert(
//       currentPosition,
//       trip.destination,
//       trip.alertType,
//       trip.alertConfig
//     );

//     if (shouldAlert) {
//       triggerAlert();
//     }
//   };

//   const triggerAlert = async () => {
//     if (alertTriggeredRef.current) return;

//     alertTriggeredRef.current = true;
//     setShowAlert(true);
//     alertService.triggerAlert(trip.destination.name);

//     try {
//       await api.put(`/trips/${trip._id}/alert`);
//     } catch (error) {
//       console.error('Error marking alert:', error);
//     }
//   };

//   const startTracking = async () => {
//     try {
//       const position = await geolocationService.getCurrentPosition();
//       setCurrentPosition(position);
//       setIsTracking(true);

//       // Start watching position
//       watchIdRef.current = geolocationService.startWatching((newPosition) => {
//         setCurrentPosition(newPosition);
//       });

//       // Start trip if pending
//       if (trip.status === 'pending') {
//         await api.put(`/trips/${trip._id}/start`);
//         setTrip({ ...trip, status: 'active' });
//       }
//     } catch (error) {
//       console.error('Error starting tracking:', error);
//       alert('Failed to get location. Please enable location services.');
//     }
//   };

//   const stopTracking = () => {
//     if (watchIdRef.current !== null) {
//       geolocationService.stopWatching();
//       watchIdRef.current = null;
//     }
    
//     if (simulationIntervalRef.current) {
//       clearInterval(simulationIntervalRef.current);
//       simulationIntervalRef.current = null;
//     }
    
//     setIsTracking(false);
//     setSimulationMode(false);
//   };

//   const completeTrip = async () => {
//     try {
//       await api.put(`/trips/${trip._id}/complete`);
//       stopTracking();
//       alert('Trip completed successfully!');
//       navigate('/');
//     } catch (error) {
//       console.error('Error completing trip:', error);
//       alert('Failed to complete trip');
//     }
//   };

//   const startSimulation = async () => {
//     try {
//       // Get current position or use a default
//       let startPos = currentPosition;
//       if (!startPos) {
//         startPos = await geolocationService.getCurrentPosition();
//         setCurrentPosition(startPos);
//       }

//       // Generate simulated positions moving towards destination
//       const positions = geolocationService.simulateMovement(
//         trip.destination.coordinates,
//         20
//       );

//       setSimulationMode(true);
//       setIsTracking(true);
//       simulationIndexRef.current = 0;

//       // Update position every 2 seconds
//       simulationIntervalRef.current = setInterval(() => {
//         if (simulationIndexRef.current < positions.length) {
//           setCurrentPosition(positions[simulationIndexRef.current]);
//           simulationIndexRef.current++;
//         } else {
//           clearInterval(simulationIntervalRef.current);
//           setSimulationMode(false);
//         }
//       }, 2000);

//       // Start trip if pending
//       if (trip.status === 'pending') {
//         await api.put(`/trips/${trip._id}/start`);
//         setTrip({ ...trip, status: 'active' });
//       }
//     } catch (error) {
//       console.error('Error starting simulation:', error);
//       alert('Failed to start simulation');
//     }
//   };

//   if (loading) {
//     return <div className="loading">Loading trip details...</div>;
//   }

//   if (!trip) {
//     return <div className="loading">Trip not found</div>;
//   }

//   return (
//     <div className="container">
//       <div className="active-trip">
//         {/* MAP SECTION - NEW! */}
//         <div className="trip-detail-card">
//           <h3 style={{ marginBottom: '1rem' }}>🗺️ Live Map View</h3>
//           <TripMap 
//             currentPosition={currentPosition}
//             destination={trip.destination}
//             height="500px"
//           />
//         </div>

//         <div className="trip-detail-card">
//           <h2>📍 {trip.destination.name}</h2>
          
//           <div className="trip-info">
//             <div className="trip-info-item">
//               <strong>Status:</strong>
//               <span className={`trip-badge badge-${trip.status}`}>
//                 {trip.status.toUpperCase()}
//               </span>
//             </div>
            
//             <div className="trip-info-item">
//               <strong>Alert Type:</strong> {trip.alertType}
//             </div>

//             {trip.alertType === 'distance' && (
//               <div className="trip-info-item">
//                 <strong>Alert Distance:</strong> {trip.alertConfig.distanceKm} km
//               </div>
//             )}

//             {trip.alertType === 'eta' && (
//               <div className="trip-info-item">
//                 <strong>Alert Before:</strong> {trip.alertConfig.minutesBefore} min
//               </div>
//             )}

//             <div className="trip-info-item">
//               <strong>Coordinates:</strong> {trip.destination.coordinates.latitude.toFixed(4)}, {trip.destination.coordinates.longitude.toFixed(4)}
//             </div>

//             {trip.notes && (
//               <div className="trip-info-item">
//                 <strong>Notes:</strong> {trip.notes}
//               </div>
//             )}
//           </div>

//           {isTracking && currentPosition && (
//             <div className="tracking-info">
//               <h3>📡 Live Tracking Stats</h3>
//               <div className="tracking-stats">
//                 <div className="stat-item">
//                   <div className="stat-value">{distance !== null ? formatDistance(distance) : '--'}</div>
//                   <div className="stat-label">Distance to Destination</div>
//                 </div>
//                 <div className="stat-item">
//                   <div className="stat-value">{eta !== null ? formatTime(eta) : '--'}</div>
//                   <div className="stat-label">Estimated Time</div>
//                 </div>
//                 <div className="stat-item">
//                   <div className="stat-value">
//                     {currentPosition.latitude.toFixed(4)}, {currentPosition.longitude.toFixed(4)}
//                   </div>
//                   <div className="stat-label">Current Position</div>
//                 </div>
//               </div>
//               {simulationMode && (
//                 <div style={{ textAlign: 'center', marginTop: '1rem', color: '#667eea', fontWeight: 'bold' }}>
//                   🎮 Simulation Mode Active - Watch the map!
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="control-buttons">
//             {!isTracking ? (
//               <>
//                 <button className="btn btn-success" onClick={startTracking}>
//                   🎯 Start GPS Tracking
//                 </button>
//                 <button className="btn btn-primary" onClick={startSimulation}>
//                   🎮 Test with Simulation
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button className="btn btn-danger" onClick={stopTracking}>
//                   ⏹️ Stop Tracking
//                 </button>
//                 <button className="btn btn-success" onClick={completeTrip}>
//                   ✅ Complete Trip
//                 </button>
//               </>
//             )}
//             <button className="btn btn-secondary" onClick={() => navigate('/')}>
//               🏠 Back to Dashboard
//             </button>
//           </div>

//           <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
//             <h4 style={{ marginBottom: '0.5rem' }}>🗺️ Map Features:</h4>
//             <ul style={{ marginLeft: '1.5rem', color: '#666' }}>
//               <li><strong>Blue dot</strong> - Your current location (updates in real-time)</li>
//               <li><strong>Red marker 🎯</strong> - Your destination</li>
//               <li><strong>Purple line</strong> - Direct route to destination</li>
//               <li><strong>Click "Simulation"</strong> - Watch your position move on the map!</li>
//               <li>Map auto-centers and zooms to show both locations</li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {showAlert && (
//         <AlertNotification 
//           destination={trip.destination.name}
//           onClose={() => setShowAlert(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default ActiveTrip;