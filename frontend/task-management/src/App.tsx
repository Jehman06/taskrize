import { Route, Routes } from 'react-router-dom';
import HomePage from './Pages/HomePage/Homepage'; // Logged off Home Page
import Home from './Pages/Dashboard/Home'; // Logged on Home Page
import SignupPage from './authentication/Signup';
import LoginPage from './authentication/Login';
import ForgotPassword from './authentication/ForgotPassword';
import ResetPassword from './authentication/ResetPassword';
import ProfilePage from './Pages/Profile/Profile';
import BoardPage from './Pages/Board/BoardPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/resetpassword/:user_id/:reset_code" element={<ResetPassword />} />
            <Route path="home" element={<Home />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="/board/:id" element={<BoardPage />} />
        </Routes>
    );
}

export default App;
