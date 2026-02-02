import { Link } from 'react-router-dom';
import api from '../../services/api';

const TripCard = ({ trip, onDelete, onRefresh }) => {
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      active: 'badge-active',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled'
    };
    return badges[status] || 'badge-pending';
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      distance: 'Distance Alert',
      route: 'Route Alert',
      eta: 'ETA Alert'
    };
    return labels[type] || type;
  };

  const handleStart = async () => {
    try {
      await api.put(`/trips/${trip._id}/start`);
      onRefresh();
    } catch (error) {
      console.error('Error starting trip:', error);
      alert('Failed to start trip');
    }
  };

  const handleComplete = async () => {
    try {
      await api.put(`/trips/${trip._id}/complete`);
      onRefresh();
    } catch (error) {
      console.error('Error completing trip:', error);
      alert('Failed to complete trip');
    }
  };

  return (
    <div className="trip-card">
      <h3> {trip.destination.name}</h3>
      
      <div className="trip-info">
        <div className="trip-info-item">
          <strong>Status:</strong>
          <span className={`trip-badge ${getStatusBadge(trip.status)}`}>
            {trip.status.toUpperCase()}
          </span>
        </div>
        
        <div className="trip-info-item">
          <strong>Alert Type:</strong> {getAlertTypeLabel(trip.alertType)}
        </div>

        {trip.alertType === 'distance' && (
          <div className="trip-info-item">
            <strong>Alert at:</strong> {trip.alertConfig.distanceKm} km
          </div>
        )}

        {trip.alertType === 'eta' && (
          <div className="trip-info-item">
            <strong>Alert before:</strong> {trip.alertConfig.minutesBefore} min
          </div>
        )}

        {trip.alertTriggered && (
          <div className="trip-info-item" style={{ color: '#ef4444' }}>
            <strong> Alert Triggered!</strong>
          </div>
        )}

        {trip.notes && (
          <div className="trip-info-item">
            <strong>Notes:</strong> {trip.notes}
          </div>
        )}

        <div className="trip-info-item" style={{ fontSize: '0.85rem', color: '#888' }}>
          Created: {new Date(trip.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="trip-actions">
        {trip.status === 'pending' && (
          <>
            <button className="btn btn-success" onClick={handleStart}>
              Start Trip
            </button>
            <Link to={`/trip/${trip._id}`} className="btn btn-primary">
              View
            </Link>
          </>
        )}

        {trip.status === 'active' && (
          <>
            <Link to={`/trip/${trip._id}`} className="btn btn-primary">
              Track
            </Link>
            <button className="btn btn-success" onClick={handleComplete}>
              Complete
            </button>
          </>
        )}

        {trip.status === 'completed' && (
          <Link to={`/trip/${trip._id}`} className="btn btn-secondary">
            View Details
          </Link>
        )}

        <button className="btn btn-danger" onClick={() => onDelete(trip._id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TripCard;