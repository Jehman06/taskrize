import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './Homepage.css';

const HomePage: React.FC = () => {
  let navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="homepage-container">
      {/* Navbar */}
      <Navbar />
      {/* Main content */}
      <div className="main-content">
        <div className="content">
          <h1>TaskRize brings together your tasks, teammates, and tools</h1>
          <p>With TaskRize, collaborating is easy.</p>
          <button onClick={handleLoginRedirect} className="btn" type="button">
            Sign up - it's free!
          </button>
        </div>
        {/* Add your image here */}
        <div className="right-content">
          {/* Placeholder for image */}
          <img src="your-image-path.jpg" alt="Your image" />
        </div>
      </div>
      {/* Bottom shape */}
      <div className="bottom-shape"></div>
    </div>
  );
};

export default HomePage;
