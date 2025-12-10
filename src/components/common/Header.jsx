import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-500">FAST LOAN</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-neutral-700 hover:text-primary-500 transition-colors">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-neutral-700 hover:text-primary-500 transition-colors">
                  Dashboard
                </Link>
                {/* Removed Apply Loan from navigation as requested */}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-neutral-700 hover:text-primary-500 transition-colors">
                    Admin
                  </Link>
                )}
              </>
            )}
            <Link to="/contact" className="text-neutral-700 hover:text-primary-500 transition-colors">
              Contact
            </Link>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 text-neutral-700 hover:text-primary-500">
                  <FaUser />
                  <span>{user?.full_name || user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-2 btn-primary">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden text-2xl text-neutral-700">
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-neutral-200">
            <div className="flex flex-col space-y-4 mt-4">
              <Link to="/" onClick={toggleMenu} className="text-neutral-700 hover:text-primary-500">
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" onClick={toggleMenu} className="text-neutral-700 hover:text-primary-500">
                    Dashboard
                  </Link>
                  {/* Removed Apply Loan from mobile navigation */}
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={toggleMenu} className="text-neutral-700 hover:text-primary-500">
                      Admin
                    </Link>
                  )}
                  <Link to="/profile" onClick={toggleMenu} className="text-neutral-700 hover:text-primary-500">
                    Profile
                  </Link>
                </>
              )}
              <Link to="/contact" onClick={toggleMenu} className="text-neutral-700 hover:text-primary-500">
                Contact
              </Link>

              {isAuthenticated ? (
                <button onClick={() => { handleLogout(); toggleMenu(); }} className="btn-primary text-left">
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={toggleMenu} className="btn-outline">
                    Login
                  </Link>
                  <Link to="/register" onClick={toggleMenu} className="btn-primary">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
