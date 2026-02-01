// import { useEffect, useRef, useState } from 'react';

// const TripMap = ({ 
//   currentPosition, 
//   destination, 
//   onMapClick,
//   height = '400px',
//   showControls = true 
// }) => {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const currentMarkerRef = useRef(null);
//   const destinationMarkerRef = useRef(null);
//   const polylineRef = useRef(null);
//   const [isLoaded, setIsLoaded] = useState(false);

//   // Load Google Maps script
//   useEffect(() => {
//     const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
//     if (!apiKey) {
//       console.warn('Google Maps API key not found. Map will not be displayed.');
//       return;
//     }

//     // Check if script already loaded
//     if (window.google && window.google.maps) {
//       setIsLoaded(true);
//       return;
//     }

//     // Load Google Maps script
//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
//     script.async = true;
//     script.defer = true;
//     script.onload = () => setIsLoaded(true);
//     script.onerror = () => console.error('Failed to load Google Maps');
//     document.head.appendChild(script);

//     return () => {
//       // Cleanup if needed
//     };
//   }, []);

//   // Initialize map
//   useEffect(() => {
//     if (!isLoaded || !mapRef.current) return;

//     const center = currentPosition || destination?.coordinates || { latitude: 28.6139, longitude: 77.2090 };

//     mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
//       center: { lat: center.latitude, lng: center.longitude },
//       zoom: 13,
//       mapTypeControl: showControls,
//       streetViewControl: showControls,
//       fullscreenControl: showControls,
//       zoomControl: showControls,
//       styles: [
//         {
//           featureType: 'poi',
//           elementType: 'labels',
//           stylers: [{ visibility: 'off' }]
//         }
//       ]
//     });

//     // Add click listener for selecting destination
//     if (onMapClick) {
//       mapInstanceRef.current.addListener('click', (event) => {
//         const lat = event.latLng.lat();
//         const lng = event.latLng.lng();
//         onMapClick({ latitude: lat, longitude: lng });
//       });
//     }
//   }, [isLoaded, showControls, onMapClick]);

//   // Update current position marker
//   useEffect(() => {
//     if (!isLoaded || !mapInstanceRef.current || !currentPosition) return;

//     // Remove old marker
//     if (currentMarkerRef.current) {
//       currentMarkerRef.current.setMap(null);
//     }

//     // Create current position marker (blue dot)
//     currentMarkerRef.current = new window.google.maps.Marker({
//       position: { lat: currentPosition.latitude, lng: currentPosition.longitude },
//       map: mapInstanceRef.current,
//       title: 'Your Location',
//       icon: {
//         path: window.google.maps.SymbolPath.CIRCLE,
//         scale: 10,
//         fillColor: '#4285F4',
//         fillOpacity: 1,
//         strokeColor: '#ffffff',
//         strokeWeight: 3,
//       },
//       animation: window.google.maps.Animation.DROP
//     });

//     // Center map on current position
//     mapInstanceRef.current.panTo({ 
//       lat: currentPosition.latitude, 
//       lng: currentPosition.longitude 
//     });
//   }, [isLoaded, currentPosition]);

//   // Update destination marker
//   useEffect(() => {
//     if (!isLoaded || !mapInstanceRef.current || !destination?.coordinates) return;

//     // Remove old marker
//     if (destinationMarkerRef.current) {
//       destinationMarkerRef.current.setMap(null);
//     }

//     // Create destination marker (red pin)
//     destinationMarkerRef.current = new window.google.maps.Marker({
//       position: { 
//         lat: destination.coordinates.latitude, 
//         lng: destination.coordinates.longitude 
//       },
//       map: mapInstanceRef.current,
//       title: destination.name || 'Destination',
//       label: {
//         text: '🎯',
//         fontSize: '24px',
//       },
//       animation: window.google.maps.Animation.BOUNCE
//     });

//     // Stop bouncing after 2 seconds
//     setTimeout(() => {
//       if (destinationMarkerRef.current) {
//         destinationMarkerRef.current.setAnimation(null);
//       }
//     }, 2000);

//     // Add info window
//     const infoWindow = new window.google.maps.InfoWindow({
//       content: `<div style="padding: 8px;">
//         <strong>${destination.name || 'Destination'}</strong><br/>
//         <small>${destination.coordinates.latitude.toFixed(4)}, ${destination.coordinates.longitude.toFixed(4)}</small>
//       </div>`
//     });

//     destinationMarkerRef.current.addListener('click', () => {
//       infoWindow.open(mapInstanceRef.current, destinationMarkerRef.current);
//     });
//   }, [isLoaded, destination]);

//   // Draw route line
//   useEffect(() => {
//     if (!isLoaded || !mapInstanceRef.current || !currentPosition || !destination?.coordinates) return;

//     // Remove old polyline
//     if (polylineRef.current) {
//       polylineRef.current.setMap(null);
//     }

//     // Draw line from current position to destination
//     const path = [
//       { lat: currentPosition.latitude, lng: currentPosition.longitude },
//       { lat: destination.coordinates.latitude, lng: destination.coordinates.longitude }
//     ];

//     polylineRef.current = new window.google.maps.Polyline({
//       path: path,
//       geodesic: true,
//       strokeColor: '#667eea',
//       strokeOpacity: 0.8,
//       strokeWeight: 4,
//       map: mapInstanceRef.current
//     });

//     // Fit bounds to show both markers
//     const bounds = new window.google.maps.LatLngBounds();
//     bounds.extend({ lat: currentPosition.latitude, lng: currentPosition.longitude });
//     bounds.extend({ lat: destination.coordinates.latitude, lng: destination.coordinates.longitude });
//     mapInstanceRef.current.fitBounds(bounds);

//     // Add some padding
//     setTimeout(() => {
//       if (mapInstanceRef.current) {
//         const zoom = mapInstanceRef.current.getZoom();
//         mapInstanceRef.current.setZoom(zoom - 1);
//       }
//     }, 100);
//   }, [isLoaded, currentPosition, destination]);

//   const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

//   if (!apiKey) {
//     return (
//       <div style={{
//         height,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         background: '#f0f0f0',
//         borderRadius: '8px',
//         padding: '2rem',
//         textAlign: 'center'
//       }}>
//         <div>
//           <p style={{ marginBottom: '0.5rem', color: '#666' }}>
//             📍 Map view not available
//           </p>
//           <small style={{ color: '#999' }}>
//             Add VITE_GOOGLE_MAPS_API_KEY to .env to enable maps
//           </small>
//         </div>
//       </div>
//     );
//   }

//   if (!isLoaded) {
//     return (
//       <div style={{
//         height,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         background: '#f9fafb',
//         borderRadius: '8px'
//       }}>
//         <p>Loading map...</p>
//       </div>
//     );
//   }

//   return (
//     <div 
//       ref={mapRef} 
//       style={{ 
//         height, 
//         width: '100%', 
//         borderRadius: '8px',
//         boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//       }} 
//     />
//   );
// };

// export default TripMap;