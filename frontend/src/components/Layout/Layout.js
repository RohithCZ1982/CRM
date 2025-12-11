import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>CRM System</h2>
          <p className="user-info">Welcome, {user?.username}</p>
        </div>
        <ul className="nav-menu">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              <span className="icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/customers" className={location.pathname === '/customers' ? 'active' : ''}>
              <span className="icon">👥</span>
              Customers
            </Link>
          </li>
          <li>
            <Link to="/contacts" className={location.pathname === '/contacts' ? 'active' : ''}>
              <span className="icon">📇</span>
              Contacts
            </Link>
          </li>
          <li>
            <Link to="/deals" className={location.pathname === '/deals' ? 'active' : ''}>
              <span className="icon">💼</span>
              Deals
            </Link>
          </li>
          <li>
            <Link to="/activities" className={location.pathname === '/activities' ? 'active' : ''}>
              <span className="icon">📅</span>
              Activities
            </Link>
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

