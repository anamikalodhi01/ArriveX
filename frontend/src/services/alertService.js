class AlertService {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
  }

  playAlertSound() {
    if (this.isPlaying) return;

    try {
      // Create audio context for alarm sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      this.isPlaying = true;

      // Play beeping pattern
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        this.isPlaying = false;
      }, 3000);

      // Also play multiple beeps
      this.playBeepPattern();
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  }

  playBeepPattern() {
    const beep = () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1000;
      oscillator.type = 'square';
      gainNode.gain.value = 0.2;

      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    };

    // Beep 5 times
    for (let i = 0; i < 5; i++) {
      setTimeout(beep, i * 500);
    }
  }

  stopAlert() {
    this.isPlaying = false;
  }

  sendNotification(title, message) {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Request permission if not granted
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icon.png',
        vibrate: [200, 100, 200]
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/icon.png',
            vibrate: [200, 100, 200]
          });
        }
      });
    }
  }

  triggerAlert(destination) {
    this.playAlertSound();
    this.sendNotification(
      ' Destination Alert!',
      `You are approaching ${destination}. Please prepare to get off!`
    );
    
    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  }
}

export default new AlertService();