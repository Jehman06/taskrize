import { Route, Routes } from 'react-router-dom';
import HomePage from './Home/Homepage'; // Logged off Home Page
import Home from './Home/Home'; // Logged on Home Page
import SignupPage from './authentication/Signup';
import LoginPage from './authentication/Login';
import ForgotPassword from './authentication/ForgotPassword';
import ResetPassword from './authentication/ResetPassword';
import useAuth from './Hooks/useAuth';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/resetpassword/:user_id/:reset_code" element={<ResetPassword />} />
            <Route path="home" element={<Home />} />
        </Routes>
    );
}

export default App;
