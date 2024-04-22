import React, { Suspense, lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Redux
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, resetAuthStates } from '../redux/reducers/authSlice';
import { resetAppStates } from '../redux/reducers/appSlice';
import { updateCreateBoardModal, updateCreateWorkspaceModal } from '../redux/reducers/modalSlice';
import { RootState } from '../redux/store';
// API
import axios from 'axios';
import Cookies from 'js-cookie';
import { verifyAccessToken } from '../utils/apiUtils';
// Styling
import taskrize from '../images/taskrize.png';
import { SlMagnifier } from 'react-icons/sl';
import { MdAccountCircle } from 'react-icons/md';
import { IoExitOutline } from 'react-icons/io5';
import { IoMdPerson } from 'react-icons/io';
import './PrivateNavbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// Lazy loading Modal imports
const CreateBoardModal = lazy(() => import('../Components/Modals/Create/CreateBoardModal'));
const CreateWorkspaceModal = lazy(() => import('../Components/Modals/Create/CreateWorkspaceModal'));

const PrivateNavbar: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const favoriteBoards = useSelector((state: RootState) => state.board.favoriteBoards);
    const boards = useSelector((state: RootState) => state.board.boards);
    const workspaces = useSelector((state: RootState) => state.workspace.workspaces);

    // Preload the image
    useEffect(() => {
        const img = new Image();
        img.src = taskrize;
    }, []);

    const handleLogout = async (): Promise<void> => {
        try {
            await verifyAccessToken();

            // Get the access token and refresh token from cookies
            const accessToken = Cookies.get('access_token') as string;

            // Once the token has been validated, log the user out
            await axios.post(
                'http://127.0.0.1:8000/api/user/logout',
                {},
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
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
            console.error('Error encountered when logging out. Please try again.', error);
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
                    alt="TaskRize logo"
                    className="mr-3 private-logo"
                    onClick={handleLogoClick}
                />

                <div className="dropdown">
                    <button
                        className="dropdown-btn dropdown-toggle"
                        type="button"
                        id="dropdownBoardsButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Workspaces
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownWorkspacesButton">
                        {workspaces &&
                            workspaces.map((workspace) => {
                                return (
                                    <li key={workspace.id}>
                                        <a className="dropdown-item" href="#">
                                            {workspace.name}
                                        </a>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
                <div className="dropdown">
                    <button
                        className="dropdown-btn dropdown-toggle"
                        type="button"
                        id="dropdownBoardsButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Boards
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownBoardsButton">
                        {boards &&
                            boards.map((board) => {
                                return (
                                    <li key={board.id}>
                                        <a className="dropdown-item" href="#">
                                            {board.title}
                                            <div className="dropdown-item-name">
                                                {board.workspace_name}
                                            </div>
                                        </a>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
                <div className="dropdown">
                    <button
                        className="dropdown-btn dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton1"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Recents
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        {/* Dropdown items for Recent */}
                    </ul>
                </div>
                <div className="dropdown">
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
                        {favoriteBoards &&
                            favoriteBoards.map((favoriteBoard) => {
                                return (
                                    <li key={favoriteBoard.id}>
                                        <a className="dropdown-item" href="#">
                                            {favoriteBoard.title}
                                            <div className="dropdown-item-name">
                                                {favoriteBoard.workspace_name}
                                            </div>
                                        </a>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
                <div className="dropdown">
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
                            <a
                                className="dropdown-item"
                                onClick={() => dispatch(updateCreateBoardModal())}
                            >
                                {' '}
                                <p className="create-title"> Create Board</p>
                                <p className="create-description">
                                    Start a new board to visually organize tasks, track progress,
                                    and collaborate with team members efficiently. Boards serve as
                                    flexible workspaces where you can customize columns, add cards,
                                    and prioritize tasks
                                </p>
                            </a>
                        </li>
                        <Suspense
                            fallback={
                                <div className="text-center mt-5 mb-5">
                                    <l-spiral size="30" color="teal"></l-spiral>
                                </div>
                            }
                        >
                            <CreateBoardModal />
                        </Suspense>
                        <li>
                            <a className="dropdown-item" href="#">
                                <p className="create-title">Start from a template</p>
                                <p className="create-description">Under development</p>
                            </a>
                        </li>
                        <li>
                            <a
                                className="dropdown-item"
                                onClick={() => dispatch(updateCreateWorkspaceModal())}
                            >
                                <p className="create-title">Create a Workspace</p>
                                <p className="create-description">
                                    Set up a dedicated workspace to organize boards, share
                                    resources, and collaborate seamlessly with your team. Workspaces
                                    provide a centralized hub for team communication, file sharing,
                                    and project management
                                </p>
                            </a>
                        </li>
                        <Suspense
                            fallback={
                                <div className="text-center mt-5 mb-5">
                                    <l-spiral size="30" color="teal"></l-spiral>
                                </div>
                            }
                        >
                            <CreateWorkspaceModal />
                        </Suspense>
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
                            <a className="dropdown-item" href="/profile">
                                <IoMdPerson className="settings-dropdown-icons" />
                                Profile
                            </a>
                        </li>
                        <li>
                            <a
                                className="dropdown-item profile-dropdown-item"
                                onClick={handleLogout}
                            >
                                <IoExitOutline className="settings-dropdown-icons" />
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
