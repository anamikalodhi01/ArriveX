import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMapPin, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import TripCard from '../Trip/TripCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await api.delete(`/trips/${tripId}`);
        setTrips(trips.filter(trip => trip._id !== tripId));
        toast.success('Trip deleted successfully');
      } catch (error) {
        console.error('Error deleting trip:', error);
        toast.error('Failed to delete trip');
      }
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    return trip.status === filter;
  });

  const stats = {
    total: trips.length,
    active: trips.filter(t => t.status === 'active').length,
    completed: trips.filter(t => t.status === 'completed').length,
    pending: trips.filter(t => t.status === 'pending').length,
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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 mb-8 shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{user?.name}!</span> 
              </h1>
              <p className="text-gray-600">Manage your trips and never miss a destination</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/create-trip"
                className="mt-4 md:mt-0 inline-flex items-center space-x-2 bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <FiPlus />
                <span>Create New Trip</span>
              </Link>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard icon={FiMapPin} label="Total Trips" value={stats.total} color="purple" />
            <StatCard icon={FiTrendingUp} label="Active" value={stats.active} color="blue" />
            <StatCard icon={FiCheckCircle} label="Completed" value={stats.completed} color="green" />
            <StatCard icon={FiClock} label="Pending" value={stats.pending} color="amber" />
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {['all', 'active', 'pending', 'completed'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                filter === status
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white shadow'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-12 text-center shadow-xl"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-600 mb-6">Start your journey by creating your first trip!</p>
            <Link
              to="/create-trip"
              className="inline-flex items-center space-x-2 bg-gradient-primary text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <FiPlus />
              <span>Create Your First Trip</span>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredTrips.map((trip, index) => (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TripCard 
                    trip={trip} 
                    onDelete={handleDelete}
                    onRefresh={fetchTrips}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${colors[color]} mb-2`}>
        <Icon className="text-white" size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
};

export default Dashboard;