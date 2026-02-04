import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiPlusCircle, FiLogOut, FiUser, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass-card border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg"
            >
              <FiMapPin className="text-white text-xl" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Smart Travel Alert
              </h1>
              <p className="text-xs text-gray-500">Never miss your destination</p>
            </div>
          </Link>

          {/* Navigation Links */}
          {user ? (
            <div className="flex items-center space-x-2">
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-2">
                <NavLink to="/" icon={FiHome} text="Dashboard" active={isActive('/')} />
                <NavLink to="/create-trip" icon={FiPlusCircle} text="New Trip" active={isActive('/create-trip')} />
                
                {/* User Menu */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <FiUser className="text-white text-sm" />
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <FiLogOut />
                    <span className="text-sm font-medium">Logout</span>
                  </motion.button>
                </div>
              </div>

              {/* Mobile Menu */}
              <div className="flex md:hidden items-center space-x-2">
                <Link to="/" className={`p-2 rounded-lg ${isActive('/') ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}>
                  <FiHome size={20} />
                </Link>
                <Link to="/create-trip" className={`p-2 rounded-lg ${isActive('/create-trip') ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}>
                  <FiPlusCircle size={20} />
                </Link>
                <button onClick={logout} className="p-2 rounded-lg text-red-600 bg-red-50">
                  <FiLogOut size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-6 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-gradient-primary text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, icon: Icon, text, active }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
        active 
          ? 'bg-gradient-primary text-white shadow-lg' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className={active ? 'text-white' : 'text-gray-500'} />
      <span>{text}</span>
    </motion.div>
  </Link>
);

export default Navbar;