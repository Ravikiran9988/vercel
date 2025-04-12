import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const fetchUser = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      fetch('https://railway-production-0187.up.railway.app/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.username) setUser(data);
        })
        .catch((err) => console.error('User fetch error:', err));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser(); // initial load

    // Listen for profile updates from Profile.jsx or cross-tab logout
    const handleProfileUpdate = () => fetchUser();
    window.addEventListener('storage', handleProfileUpdate);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleProfileUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    window.dispatchEvent(new Event('storage')); // for sync
    navigate('/login');
  };

  return (
    <nav className="navbar shadow-md">
      <div className="navbar-container">
        <div className="logo">
          <Link to="/" className="brand-name">
            Radiant<span>Skincare</span>
          </Link>
        </div>

        <div className="menu-icon" onClick={toggleMenu}>
          <div className={isOpen ? 'bar rotate' : 'bar'}></div>
          <div className={isOpen ? 'bar hide' : 'bar'}></div>
          <div className={isOpen ? 'bar rotate-reverse' : 'bar'}></div>
        </div>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link to="/">Home</Link>
          <Link to="/consultation">Consultation</Link>
          <Link to="/products">Products</Link>
          <Link to="/about">About</Link>

          <div className="nav-buttons">
            {isLoggedIn ? (
              <>
                <span className="welcome-text">Welcome, {user?.username || 'User'}</span>
                <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn login-btn">Login</Link>
                <Link to="/register" className="btn register-btn">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
