import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser, resetAuthStates } from '../redux/reducers/authSlice';
import taskrize from '../images/taskrize.png';
import { SlMagnifier } from 'react-icons/sl';
import { MdAccountCircle } from 'react-icons/md';
import './PrivateNavbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';
import { resetAppStates } from '../redux/reducers/appSlice';

const PrivateNavbar: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async (): Promise<void> => {
        try {
            // Get the access token from cookies
            const accessToken = Cookies.get('access_token');

            await axios.post(
                'http://127.0.0.1:8000/api/logout',
                {},
                {
                    headers: {
                        Authorization: accessToken,
                    },
                }
            );
            // Update states and remove tokens from cookies
            dispatch(logoutUser());
            dispatch(resetAppStates());
            dispatch(resetAuthStates());
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            Cookies.remove('csrftoken');
            Cookies.remove('sessionid');
            // Navigate to the homepage
            navigate('/');
        } catch (error: any) {
            console.error('Error encountered when logging out. Please try again.');
        }
    };

    const handleLogoClick = (): void => {
        navigate('/home');
    };

    return (
        <nav className="navbar private-navbar justify-content-between align-items-center">
            {/* Left-aligned section */}
            <div className="d-flex align-items-center">
                <img
                    src={taskrize}
                    alt="logo"
                    className="mr-3 private-logo"
                    onClick={handleLogoClick}
                />
                <div className="dropdown recent">
                    <button
                        className="dropdown-btn dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton1"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Recent
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        <li>
                            <a className="dropdown-item" href="#">
                                Board 1
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                Board 2
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                Board 3
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="dropdown favorites">
                    <button
                        className="dropdown-btn dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton2"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Favorites
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton2">
                        <li>
                            <a className="dropdown-item" href="#">
                                Favorite 1
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                Favorite 2
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                Favorite 3
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="dropdown create">
                    <button
                        className="create-button dropdown-toggle no-arrow"
                        type="button"
                        id="dropdownMenuButton3"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Create
                    </button>
                    <ul
                        className="dropdown-menu dropdown-create"
                        aria-labelledby="dropdownMenuButton3"
                    >
                        <li>
                            <a className="dropdown-item" href="#">
                                <p className="create-title"> Create Board</p>
                                <p className="create-description">
                                    Start a new board to visually organize tasks, track progress,
                                    and collaborate with team members efficiently. Boards serve as
                                    flexible workspaces where you can customize columns, add cards,
                                    and prioritize tasks
                                </p>
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                <p className="create-title">Start from a template</p>
                                <p className="create-description">Under development</p>
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                <p className="create-title">Create a Workspace</p>
                                <p className="create-description">
                                    Set up a dedicated workspace to organize boards, share
                                    resources, and collaborate seamlessly with your team. Workspaces
                                    provide a centralized hub for team communication, file sharing,
                                    and project management
                                </p>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right-aligned section */}
            <div className="d-flex align-items-center">
                <div className="search-container mr-3">
                    <div className="search-icon-container">
                        <SlMagnifier className="magnifier" />
                    </div>
                    <input className="search" placeholder="Search" />
                </div>
                <div className="dropdown profile">
                    <button
                        className="dropdown-btn dropdown-profile dropdown-toggle no-arrow"
                        type="button"
                        id="dropdownMenuButton3"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <MdAccountCircle className="account-icon" />
                    </button>
                    <ul
                        className="dropdown-menu dropdown-menu-end"
                        aria-labelledby="dropdownMenuButton3"
                    >
                        <li>
                            <a className="dropdown-item" href="#">
                                Profile
                            </a>
                        </li>
                        <li>
                            <a
                                className="dropdown-item profile-dropdown-item"
                                onClick={handleLogout}
                            >
                                Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default PrivateNavbar;
