import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle } from 'react-icons/fi';

const AlertNotification = ({ destination, onClose }) => {
  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {/* Backdrop Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Alert Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md"
        >
          {/* Main Alert Container */}
          <div className="glass-card rounded-3xl p-8 shadow-2xl border-4 border-red-500">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
            >
              <FiX className="text-red-600" size={20} />
            </button>

            {/* Animated Alert Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl"
              >
                <FiAlertCircle className="text-white text-5xl" />
              </motion.div>
            </div>

            {/* Alert Content */}
            <div className="text-center space-y-4">
              {/* Main Heading */}
              <motion.h2
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                className="text-3xl font-bold text-red-600"
              >
                DESTINATION ALERT!
              </motion.h2>

              {/* Message */}
              <div className="space-y-2">
                <p className="text-lg text-gray-700 font-medium">
                  You are approaching
                </p>
                
                {/* Destination Box */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border-2 border-red-200">
                  <p className="text-2xl font-bold text-gray-900 flex items-center justify-center space-x-2">
                    <span></span>
                    <span>{destination}</span>
                  </p>
                </div>
              </div>

              {/* Warning Text */}
              <motion.div
                animate={{
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity
                }}
                className="pt-4"
              >
                <p className="text-lg font-semibold text-red-600">
                  Please prepare to get off!
                </p>
              </motion.div>
            </div>

            {/* Dismiss Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Got it! Dismiss Alert
            </motion.button>

            {/* Auto-dismiss Progress Bar */}
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 10, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
              />
            </div>
          </div>

          {/* Decorative Ripple Circles */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
            className="absolute inset-0 bg-red-500/20 rounded-3xl -z-10"
          />
          <motion.div
            animate={{
              scale: [1, 2, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5
            }}
            className="absolute inset-0 bg-red-500/10 rounded-3xl -z-20"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertNotification;