import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiMapPin, FiNavigation, FiSave, FiX, FiClock, 
  FiMap, FiFileText, FiAlertCircle 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
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
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const position = await geolocationService.getCurrentPosition();
      setCurrentLocation(position);
      toast.success('Location detected! ');
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Could not get your location');
    } finally {
      setLoadingLocation(false);
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
      toast.success('Current location set as destination');
    }
  };

  // Sample destinations for quick selection
  const sampleDestinations = [
    { name: 'New Delhi Railway Station', lat: 28.6428, lng: 77.2197},
    { name: 'Mumbai Central', lat: 18.9681, lng: 72.8196},
    { name: 'Bengaluru City Junction', lat: 12.9776, lng: 77.5718},
    { name: 'Chennai Central', lat: 13.0827, lng: 80.2751}
  ];

  const selectSampleDestination = (dest) => {
    setFormData({
      ...formData,
      destinationName: dest.name,
      destinationLat: dest.lat,
      destinationLng: dest.lng
    });
    toast.success(`Selected ${dest.name} ${dest.emoji}`);
  };

  const alertTypes = [
    {
      value: 'distance',
      icon: FiNavigation,
      label: 'Distance-Based Alert',
      description: 'Alert when you are within X km of destination'
    },
    {
      value: 'route',
      icon: FiMap,
      label: 'Route-Based Alert',
      description: 'Alert based on actual travel route'
    },
    {
      value: 'eta',
      icon: FiClock,
      label: 'ETA-Based Alert',
      description: 'Alert X minutes before arrival'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.destinationName || !formData.destinationLat || !formData.destinationLng) {
      toast.error('Please provide complete destination details');
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
      toast.success('Trip created successfully! ');
      navigate(`/trip/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-xl mb-4">
            <FiMapPin className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Trip
          </h1>
          <p className="text-gray-600">Set up your destination and alert preferences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 shadow-xl space-y-6">
            {/* Destination Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Destination Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMapPin className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="destinationName"
                  value={formData.destinationName}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none"
                  placeholder="e.g., Connaught Place, Delhi"
                />
              </div>
            </div>

            {/* Quick Select Destinations */}
            <div className="glass-card rounded-xl p-4 bg-gradient-to-br from-purple-50 to-blue-50">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <FiNavigation className="text-purple-600" />
                <span>Quick Select Destinations:</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {sampleDestinations.map((dest, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => selectSampleDestination(dest)}
                    className="p-3 bg-white rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all text-left shadow-sm"
                  >
                    <div className="text-xl mb-1">{dest.emoji}</div>
                    <div className="text-xs font-semibold text-gray-900 line-clamp-2">
                      {dest.name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="destinationLat"
                  value={formData.destinationLat}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none"
                  placeholder="28.6139"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="destinationLng"
                  value={formData.destinationLng}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none"
                  placeholder="77.2090"
                />
              </div>
            </div>

            {currentLocation && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={useCurrentLocation}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <FiNavigation />
                <span>Use My Current Location</span>
              </motion.button>
            )}

            {/* Alert Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Alert Type *
              </label>
              <div className="space-y-3">
                {alertTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <motion.div
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.alertType === type.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-purple-200'
                      }`}
                      onClick={() => setFormData({ ...formData, alertType: type.value })}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          formData.alertType === type.value
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">{type.label}</span>
                            <span className="text-lg">{type.emoji}</span>
                          </div>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        <input
                          type="radio"
                          name="alertType"
                          value={type.value}
                          checked={formData.alertType === type.value}
                          onChange={handleChange}
                          className="mt-1"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Alert Configuration */}
            {(formData.alertType === 'distance' || formData.alertType === 'route') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alert Distance (km)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    name="distanceKm"
                    value={formData.distanceKm}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold min-w-[80px] text-center">
                    {formData.distanceKm} km
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Alert when you are within {formData.distanceKm} km of destination
                </p>
              </motion.div>
            )}

            {formData.alertType === 'eta' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alert Before (minutes)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    name="minutesBefore"
                    value={formData.minutesBefore}
                    onChange={handleChange}
                    min="1"
                    max="60"
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold min-w-[80px] text-center">
                    {formData.minutesBefore} min
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Alert {formData.minutesBefore} minutes before arrival
                </p>
              </motion.div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-4 pointer-events-none">
                  <FiFileText className="text-gray-400" />
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none resize-none"
                  placeholder="Add any notes about this trip..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
              >
                <FiX />
                <span>Cancel</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-primary text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <FiSave />
                    <span>Create Trip</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateTrip;