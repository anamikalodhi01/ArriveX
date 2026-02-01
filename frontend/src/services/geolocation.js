class GeolocationService {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          resolve(this.currentPosition);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  startWatching(callback) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        callback(this.currentPosition);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return this.watchId;
  }

  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Simulate the location for testing
  simulateMovement(destination, steps = 10) {
    if (!this.currentPosition) {
      throw new Error('No current position set');
    }

    const positions = [];
    const latDiff = (destination.latitude - this.currentPosition.latitude) / steps;
    const lngDiff = (destination.longitude - this.currentPosition.longitude) / steps;

    for (let i = 0; i <= steps; i++) {
      positions.push({
        latitude: this.currentPosition.latitude + (latDiff * i),
        longitude: this.currentPosition.longitude + (lngDiff * i),
        accuracy: 10
      });
    }

    return positions;
  }
}

export default new GeolocationService();