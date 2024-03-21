import React from 'react';
import { Link } from 'react-router-dom';
import taskrize from '../images/taskrize.png';
import './PrivateNavbar.css';

const PrivateNavbar: React.FC = () => {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light justify-content-between align-items-center"
      style={{
        backgroundColor: '#1d2125',
        position: 'relative',
        height: '40px',
        padding: '0 20px',
      }}
    >
      <div className="container d-flex align-items-center h-100">
        <img
          src={taskrize}
          alt="logo"
          style={{ height: '30px', width: '75px' }}
          className="mr-3"
        />
      </div>
    </nav>
  );
};

export default PrivateNavbar;
