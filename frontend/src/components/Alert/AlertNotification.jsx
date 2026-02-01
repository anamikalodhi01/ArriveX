import { useEffect } from 'react';

const AlertNotification = ({ destination, onClose }) => {
  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <div className="alert-overlay" onClick={onClose} />
      <div className="alert-notification">
        <h2>🚨 DESTINATION ALERT!</h2>
        <p style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
          You are approaching
        </p>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
          📍 {destination}
        </p>
        <p style={{ marginTop: '1rem' }}>
          Please prepare to get off!
        </p>
        <button 
          className="btn btn-primary" 
          onClick={onClose}
          style={{ marginTop: '1.5rem', width: '100%' }}
        >
          Dismiss Alert
        </button>
      </div>
    </>
  );
};

export default AlertNotification;