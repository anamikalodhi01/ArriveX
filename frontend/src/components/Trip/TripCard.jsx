import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiPlay, FiCheckCircle, FiTrash2, FiAlertCircle, FiClock, FiNavigation } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const TripCard = ({ trip, onDelete, onRefresh }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: FiClock,
        label: 'Pending'
      },
      active: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: FiNavigation,
        label: 'Active'
      },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: FiCheckCircle,
        label: 'Completed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: FiAlertCircle,
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      distance: 'Distance Alert',
      route: 'Route Alert',
      eta: 'ETA Alert'
    };
    return labels[type] || type;
  };

  const statusConfig = getStatusConfig(trip.status);
  const StatusIcon = statusConfig.icon;

  const handleStart = async () => {
    try {
      await api.put(`/trips/${trip._id}/start`);
      toast.success('Trip started! ');
      onRefresh();
    } catch (error) {
      console.error('Error starting trip:', error);
      toast.error('Failed to start trip');
    }
  };

  const handleComplete = async () => {
    try {
      await api.put(`/trips/${trip._id}/complete`);
      toast.success('Trip completed! ');
      onRefresh();
    } catch (error) {
      console.error('Error completing trip:', error);
      toast.error('Failed to complete trip');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-white/20 group"
    >
      {/* Header with Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
            <FiMapPin className="text-purple-600" />
            <span className="truncate">{trip.destination.name}</span>
          </h3>
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${statusConfig.border} ${statusConfig.bg}`}>
            <StatusIcon className={`${statusConfig.text} text-sm`} />
            <span className={`text-xs font-semibold ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
        
        {trip.alertTriggered && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-2xl"
          >
            
          </motion.div>
        )}
      </div>

      {/* Trip Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-semibold mr-2">Alert Type:</span>
          <span>{getAlertTypeLabel(trip.alertType)}</span>
        </div>

        {trip.alertType === 'distance' && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-semibold mr-2">Alert at:</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium">
              {trip.alertConfig.distanceKm} km
            </span>
          </div>
        )}

        {trip.alertType === 'eta' && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-semibold mr-2">Alert before:</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium">
              {trip.alertConfig.minutesBefore} min
            </span>
          </div>
        )}

        {trip.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <span className="font-semibold block mb-1">Notes:</span>
            <p className="line-clamp-2">{trip.notes}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          Created {new Date(trip.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {trip.status === 'pending' && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <FiPlay size={16} />
              <span>Start</span>
            </motion.button>
            <Link to={`/trip/${trip._id}`} className="flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-primary text-white py-2 px-4 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                View
              </motion.button>
            </Link>
          </>
        )}

        {trip.status === 'active' && (
          <>
            <Link to={`/trip/${trip._id}`} className="flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-primary text-white py-2 px-4 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <FiNavigation size={16} />
                <span>Track</span>
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <FiCheckCircle size={16} />
              <span>Complete</span>
            </motion.button>
          </>
        )}

        {trip.status === 'completed' && (
          <Link to={`/trip/${trip._id}`} className="flex-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              View Details
            </motion.button>
          </Link>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(trip._id)}
          className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all"
        >
          <FiTrash2 size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TripCard;