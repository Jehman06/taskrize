import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../Components/Navbar/PublicNavbar';
import './Homepage.css';

// Redux
import { useDispatch } from 'react-redux';
import { resetAuthStates, setResetCode } from '../../redux/reducers/authSlice';
import { resetAppStates } from '../../redux/reducers/appSlice';
import homepage from '../../images/taskrize-home.png';

import { SlOrganization } from 'react-icons/sl';
import { LuCalendarClock } from 'react-icons/lu';
import {
    FaLinkedin,
    FaGithub,
    FaMailBulk,
    FaPeopleCarry,
} from 'react-icons/fa';
import { FaPerson } from 'react-icons/fa6';

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
                    <h1>
                        TaskRize brings together your tasks, teammates, and
                        tools
                    </h1>
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
                    <img src={homepage} alt="placeholderimage" />
                </div>
            </div>
            <div className="bottom-section">
                <div className="bottom-wrapper">
                    <div className="bottom-shape"></div>
                    <div className="bottom-content">
                        <div className="bottom-item">
                            <SlOrganization className="bottom-icon" />
                            <h2>Organize your work</h2>
                            <p>
                                Streamline your workflow by organizing tasks
                                within projects, ensuring each task is in its
                                rightful place.
                            </p>
                        </div>
                        <div className="bottom-item">
                            <FaPeopleCarry className="bottom-icon" />
                            <h2>Collaborate with your team</h2>
                            <p>
                                Create workspaces and invite your teammates to
                                collaborate and reach your goals!
                            </p>
                        </div>
                        <div className="bottom-item">
                            <LuCalendarClock className="bottom-icon" />
                            <h2>Meet deadlines</h2>
                            <p>
                                Boost your efficiency and project adherence by
                                setting deadlines for your tasks in line with
                                project timelines.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space"></div>
            <div className="footer">
                <a
                    href="https://linkedin.com/in/jeremy-lehmann/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaLinkedin className="footer-icon" />
                </a>
                <a
                    href="https://github.com/Jehman06"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaGithub className="footer-icon" />
                </a>
                <a
                    href="mailto:jeremy.lehmann06@icloud.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaMailBulk className="footer-icon" />
                </a>
                <a
                    href="https://www.jeremy-lehmann.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaPerson className="footer-icon" />
                </a>
            </div>
        </div>
    );
};

export default HomePage;
