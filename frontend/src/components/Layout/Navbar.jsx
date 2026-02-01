import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🚆 Smart Travel Alert
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <span className="navbar-user">Hello, {user.name}</span>
              <Link to="/">Dashboard</Link>
              <Link to="/create-trip">New Trip</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;