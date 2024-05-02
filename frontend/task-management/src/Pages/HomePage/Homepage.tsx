import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../Components/Navbar/PublicNavbar';
import './Homepage.css';

// Redux
import { useDispatch } from 'react-redux';
import { resetAuthStates, setResetCode } from '../../redux/reducers/authSlice';
import { resetAppStates } from '../../redux/reducers/appSlice';

const HomePage: React.FC = () => {
    // State management
    const dispatch = useDispatch();

    let navigate = useNavigate();

    useEffect(() => {
        dispatch(resetAppStates(), resetAuthStates());
        dispatch(setResetCode(''));
    }, [dispatch]);

    const handleSignupRedirect = (): void => {
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
                    <button
                        onClick={handleSignupRedirect}
                        className="btn signup-button"
                        type="button"
                    >
                        Sign up - it's free!
                    </button>
                </div>
                <div className="right-content">
                    {/* Placeholder for image */}
                    <img src="image-path.jpg" alt="placeholderimage" />
                </div>
            </div>
            {/* Bottom shape */}
            <div className="bottom-shape"></div>
        </div>
    );
};

export default HomePage;
