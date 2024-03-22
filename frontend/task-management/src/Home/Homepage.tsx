import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../Navbar/PublicNavbar';
import './Homepage.css';

const HomePage: React.FC = () => {
  let navigate = useNavigate();

  const handleSignupRedirect = () => {
    navigate('/signup');
  };

  return (
    <div className="homepage-container">
      {/* Navbar */}
      <PublicNavbar />
      {/* Main content */}
      <div className="main-content">
        <div className="content">
          <h1>TaskRize brings together your tasks, teammates, and tools</h1>
          <p>With TaskRize, collaborating is easy.</p>
          <button onClick={handleSignupRedirect} className="btn" type="button">
            Sign up - it's free!
          </button>
        </div>
        <div className="right-content">
          {/* Placeholder for image */}
          <img src="image-path.jpg" alt="image" />
        </div>
      </div>
      {/* Bottom shape */}
      <div className="bottom-shape"></div>
    </div>
  );
};

export default HomePage;
