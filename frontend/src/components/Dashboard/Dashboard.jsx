import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await api.delete(`/trips/${tripId}`);
        setTrips(trips.filter(trip => trip._id !== tripId));
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip');
      }
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    return trip.status === filter;
  });

  if (loading) {
    return <div className="loading">Loading your trips...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}! </h1>
          <p>Manage your travel destinations and alerts</p>
          <div className="dashboard-actions">
            <Link to="/create-trip" className="btn btn-primary">
              + Create New Trip
            </Link>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button 
                className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>3
            </div>
          </div>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="empty-state">
            <h3>No trips found</h3>
            <p>Create your first trip to get started!</p>
            <Link to="/create-trip" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Create Trip
            </Link>
          </div>
        ) : (
          <div className="trips-grid">
            {filteredTrips.map((trip) => (
              <TripCard 
                key={trip._id} 
                trip={trip} 
                onDelete={handleDelete}
                onRefresh={fetchTrips}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;