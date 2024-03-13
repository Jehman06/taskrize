import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  let navigate = useNavigate();

  const loginRedirect = () => {
    navigate('/login');
  };

  return (
    <div>
      <h1>TASK-MANAGEMENT</h1>
      <button onClick={loginRedirect}>Login</button>
    </div>
  );
};

export default HomePage;
