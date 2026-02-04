import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiNavigation, FiPlay, FiSquare, FiCheckCircle, 
  FiHome, FiActivity, FiMapPin, FiClock, FiTrendingUp 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
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
      
      if (response.data.status === 'active') {
        startTracking();
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('Trip not found');
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
      toast.success('Destination alert triggered!');
    } catch (error) {
      console.error('Error marking alert:', error);
    }
  };

  const startTracking = async () => {
    try {
      const position = await geolocationService.getCurrentPosition();
      setCurrentPosition(position);
      setIsTracking(true);

      watchIdRef.current = geolocationService.startWatching((newPosition) => {
        setCurrentPosition(newPosition);
      });

      if (trip.status === 'pending') {
        await api.put(`/trips/${trip._id}/start`);
        setTrip({ ...trip, status: 'active' });
      }

      toast.success('GPS tracking started!');
    } catch (error) {
      console.error('Error starting tracking:', error);
      toast.error('Failed to get location. Please enable location services.');
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
    toast.success('Tracking stopped');
  };

  const completeTrip = async () => {
    try {
      await api.put(`/trips/${trip._id}/complete`);
      stopTracking();
      toast.success('Trip completed!');
      navigate('/');
    } catch (error) {
      console.error('Error completing trip:', error);
      toast.error('Failed to complete trip');
    }
  };

  const startSimulation = async () => {
    try {
      let startPos = currentPosition;
      if (!startPos) {
        startPos = await geolocationService.getCurrentPosition();
        setCurrentPosition(startPos);
      }

      const positions = geolocationService.simulateMovement(
        trip.destination.coordinates,
        20
      );

      setSimulationMode(true);
      setIsTracking(true);
      simulationIndexRef.current = 0;

      simulationIntervalRef.current = setInterval(() => {
        if (simulationIndexRef.current < positions.length) {
          setCurrentPosition(positions[simulationIndexRef.current]);
          simulationIndexRef.current++;
        } else {
          clearInterval(simulationIntervalRef.current);
          setSimulationMode(false);
        }
      }, 2000);

      if (trip.status === 'pending') {
        await api.put(`/trips/${trip._id}/start`);
        setTrip({ ...trip, status: 'active' });
      }

      toast.success('Simulation started! ');
    } catch (error) {
      console.error('Error starting simulation:', error);
      toast.error('Failed to start simulation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mb-6 shadow-xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
                <FiMapPin className="text-purple-600" />
                <span>{trip.destination.name}</span>
              </h1>
              <div className="flex items-center space-x-3">
                <StatusBadge status={trip.status} />
                {trip.alertTriggered && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold"
                  >
                     Alert Triggered
                  </motion.div>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="bg-gray-100 text-gray-700 p-3 rounded-xl hover:bg-gray-200 transition-all"
            >
              <FiHome size={20} />
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Stats */}
            {isTracking && currentPosition && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 shadow-xl"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FiActivity className="text-purple-600" />
                  <span>Live Tracking Data</span>
                  {simulationMode && (
                    <span className="text-sm text-purple-600 font-normal">(Simulation Mode )</span>
                  )}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard 
                    icon={FiTrendingUp}
                    label="Distance"
                    value={distance !== null ? formatDistance(distance) : '--'}
                    color="purple"
                  />
                  <StatCard 
                    icon={FiClock}
                    label="ETA"
                    value={eta !== null ? formatTime(eta) : '--'}
                    color="blue"
                  />
                  <StatCard 
                    icon={FiMapPin}
                    label="Position"
                    value={`${currentPosition.latitude.toFixed(2)}, ${currentPosition.longitude.toFixed(2)}`}
                    color="green"
                    small
                  />
                </div>
              </motion.div>
            )}

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3"> How it works</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span><strong>GPS Tracking:</strong> Uses your real location</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span><strong>Simulation:</strong> Test without moving</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>You'll receive an alert when you reach the configured distance/time</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Alert includes sound, notification, and visual popup</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Complete the trip when you reach your destination</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Right Column - Trip Details & Controls */}
          <div className="space-y-6">
            {/* Trip Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Details</h3>
              <div className="space-y-4">
                <DetailItem label="Alert Type" value={getAlertTypeLabel(trip.alertType)} />
                
                {trip.alertType === 'distance' && (
                  <DetailItem 
                    label="Alert Distance" 
                    value={`${trip.alertConfig.distanceKm} km`}
                    highlight
                  />
                )}
                
                {trip.alertType === 'eta' && (
                  <DetailItem 
                    label="Alert Before" 
                    value={`${trip.alertConfig.minutesBefore} minutes`}
                    highlight
                  />
                )}
                
                <DetailItem 
                  label="Coordinates" 
                  value={`${trip.destination.coordinates.latitude.toFixed(4)}, ${trip.destination.coordinates.longitude.toFixed(4)}`}
                />
                
                {trip.notes && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Notes:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {trip.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Control Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Controls</h3>
              <div className="space-y-3">
                {!isTracking ? (
                  <>
                    <ControlButton
                      icon={FiPlay}
                      label="Start GPS Tracking"
                      onClick={startTracking}
                      variant="success"
                    />
                    <ControlButton
                      icon={FiActivity}
                      label="Test with Simulation"
                      onClick={startSimulation}
                      variant="primary"
                    />
                  </>
                ) : (
                  <>
                    <ControlButton
                      icon={FiSquare}
                      label="Stop Tracking"
                      onClick={stopTracking}
                      variant="danger"
                    />
                    <ControlButton
                      icon={FiCheckCircle}
                      label="Complete Trip"
                      onClick={completeTrip}
                      variant="success"
                    />
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAlert && (
          <AlertNotification 
            destination={trip.destination.name}
            onClose={() => setShowAlert(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Components
const StatusBadge = ({ status }) => {
  const configs = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
    active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  };
  
  const config = configs[status] || configs.pending;
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color, small }) => {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${colors[color]} mb-2`}>
        <Icon className="text-white" size={18} />
      </div>
      <p className={`font-bold text-gray-900 ${small ? 'text-sm' : 'text-xl'} mb-1`}>{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
};

const DetailItem = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-medium text-gray-600">{label}:</span>
    <span className={`text-sm font-semibold ${
      highlight 
        ? 'px-3 py-1 bg-purple-100 text-purple-700 rounded-lg' 
        : 'text-gray-900'
    }`}>
      {value}
    </span>
  </div>
);

const ControlButton = ({ icon: Icon, label, onClick, variant }) => {
  const variants = {
    primary: 'bg-gradient-primary text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full ${variants[variant]} py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2`}
    >
      <Icon />
      <span>{label}</span>
    </motion.button>
  );
};

const getAlertTypeLabel = (type) => {
  const labels = {
    distance: ' Distance Alert',
    route: 'Route Alert',
    eta: 'ETA Alert'
  };
  return labels[type] || type;
};

export default ActiveTrip;














