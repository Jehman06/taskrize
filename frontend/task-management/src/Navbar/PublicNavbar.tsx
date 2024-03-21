import React from 'react';
import { Link } from 'react-router-dom';
import taskrize from '../images/taskrize.png';
import './PublicNavbar.css';

const PublicNavbar: React.FC = () => {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light justify-content-between align-items-center"
      style={{
        backgroundColor: 'white',
        position: 'relative',
        height: '60px',
        padding: '0 20px', // Add padding to the navbar
      }}
    >
      <div className="container d-flex align-items-center h-100">
        <Link className="navbar-brand" to="/">
          <img
            src={taskrize}
            alt="logo"
            style={{ height: '60px', width: '150px' }}
          />
        </Link>
        {/* Right-aligned content */}
        <div className="d-flex align-items-center" style={{ height: '100%' }}>
          <a href="/login" className="LoginButton">
            Log in
          </a>
          <a href="/signup" className="GetStartedButton">
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
