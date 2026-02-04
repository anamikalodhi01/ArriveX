import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.message || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-xl mb-4 floating"
          >
            <FiMapPin className="text-white text-3xl" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Sign in to continue your journey</p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Create one now
            </Link>
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="glass-card rounded-xl p-3">
            <div className="text-2xl mb-1"></div>
            <p className="text-xs text-gray-600">Smart Alerts</p>
          </div>
          <div className="glass-card rounded-xl p-3">
            <div className="text-2xl mb-1"></div>
            <p className="text-xs text-gray-600">GPS Tracking</p>
          </div>
          <div className="glass-card rounded-xl p-3">
            <div className="text-2xl mb-1"></div>
            <p className="text-xs text-gray-600">Never Miss</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;