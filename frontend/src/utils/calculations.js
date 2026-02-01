// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // in kilometers
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

// Calculate ETA based on distance and average speed
export const calculateETA = (distanceKm, averageSpeedKmh = 40) => {
  const hours = distanceKm / averageSpeedKmh;
  const minutes = Math.round(hours * 60);
  return minutes;
};

// Format distance for display
export const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(2)} km`;
};

// Format time for display
export const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Check if alert should be triggered
export const shouldTriggerAlert = (currentPos, destination, alertType, alertConfig) => {
  const distance = calculateDistance(
    currentPos.latitude,
    currentPos.longitude,
    destination.coordinates.latitude,
    destination.coordinates.longitude
  );

  switch (alertType) {
    case 'distance':
      return distance <= (alertConfig.distanceKm || 5);
    
    case 'route':
      // For route-based, we use distance as approximation
      // In production, you'd use Google Maps Directions API
      return distance <= (alertConfig.distanceKm || 5);
    
    case 'eta':
      const eta = calculateETA(distance);
      return eta <= (alertConfig.minutesBefore || 10);
    
    default:
      return false;
  }
};

// Get bearing between two points
export const getBearing = (lat1, lon1, lat2, lon2) => {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = Math.atan2(y, x);
  return ((bearing * 180 / Math.PI) + 360) % 360; // in degrees
};