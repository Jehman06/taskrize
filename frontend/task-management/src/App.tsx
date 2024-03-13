import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './Homepage'; // Logged off Home Page
import Home from './Home'; // Logged on Home Page
import SignupPage from './authentication/Signup';
import LoginPage from './authentication/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
