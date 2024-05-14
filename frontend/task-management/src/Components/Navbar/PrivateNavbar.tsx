import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Redux
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, resetAuthStates } from '../../redux/reducers/authSlice';
import { resetAppStates } from '../../redux/reducers/appSlice';
import {
    updateCreateBoardModal,
    updateCreateWorkspaceModal,
} from '../../redux/reducers/modalSlice';
import { RootState } from '../../redux/store';
// API
import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { verifyAccessToken } from '../../utils/apiUtils';
// Styling
import taskrize from '../../images/taskrize.png';
import { SlMagnifier } from 'react-icons/sl';
import { MdAccountCircle } from 'react-icons/md';
import { IoExitOutline } from 'react-icons/io5';
import { IoMdPerson } from 'react-icons/io';
import { FaRegBell, FaBell } from 'react-icons/fa';
import './PrivateNavbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import {
    setNewNotifications,
    setNotifications,
    setNotificationsFetched,
} from '../../redux/reducers/notificationSlice';
import { Button } from 'react-bootstrap';
import { setWorkspaces } from '../../redux/reducers/workspaceSlice';
import { setBoards, setFavoriteBoards } from '../../redux/reducers/boardSlice';

// Lazy loading Modal imports
const CreateBoardModal = lazy(
    () => import('../Modals/Create/CreateBoardModal'),
);
const CreateWorkspaceModal = lazy(
    () => import('../Modals/Create/CreateWorkspaceModal'),
);

const PrivateNavbar: React.FC = () => {
    // UseState
    const [accessToken, setAccessToken] = useState<string | undefined>(
        undefined,
    );

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const favoriteBoards = useSelector(
        (state: RootState) => state.board.favoriteBoards,
    );
    const boards = useSelector((state: RootState) => state.board.boards);
    const workspaces = useSelector(
        (state: RootState) => state.workspace.workspaces,
    );
    const newNotifications = useSelector(
        (state: RootState) => state.notification.newNotifications,
    );
    const notifications = useSelector(
        (state: RootState) => state.notification.notifications,
    );
    const notificationsFetched = useSelector(
        (state: RootState) => state.notification.notificationsFetched,
    );

    // Preload the image
    useEffect(() => {
        const img = new Image();
        img.src = taskrize;
    }, []);

    // Fetch boards and workspaces
    const fetchData = async (
        url: string,
        accessToken: string,
    ): Promise<any> => {
        try {
            const response: AxiosResponse = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    // Fetch the boards and workspaces for the user
    const getBoardsAndWorkspaces = useCallback(
        async (accessToken: string): Promise<void> => {
            const boardsUrl =
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/boards/';
            const workspacesUrl =
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/workspaces/';

            try {
                const [boardsResponse, workspacesResponse] = await Promise.all([
                    fetchData(boardsUrl, accessToken),
                    fetchData(workspacesUrl, accessToken),
                ]);

                if (boardsResponse && workspacesResponse) {
                    // Process boards data
                    const fetchedBoards = boardsResponse.map((board: any) => ({
                        ...board,
                        starFilled: board.favorite.includes(userId),
                    }));
                    dispatch(setBoards(fetchedBoards));

                    // Filter favorite boards
                    const initialFavoriteBoards = fetchedBoards.filter(
                        (board: any) => board.starFilled,
                    );
                    setFavoriteBoards(initialFavoriteBoards);

                    // Process workspaces data
                    const updatedWorkspaces = await Promise.all(
                        workspacesResponse.map(async (workspace: any) => {
                            const boardsData = await fetchData(
                                `${workspacesUrl}${workspace.id}/boards`,
                                accessToken,
                            );

                            // Merge the fetched boards data with the workspace object
                            return {
                                ...workspace,
                                boards: boardsData,
                            };
                        }),
                    );
                    dispatch(setWorkspaces(updatedWorkspaces));
                    // setWorkspaces(updatedWorkspaces);
                } else {
                    console.error('Error fetching boards or workspaces.');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        [dispatch, userId],
    );

    // Fetch the data on component mount
    useEffect(() => {
        const fetchDataAndInitialize = async () => {
            try {
                await verifyAccessToken();
                const token = Cookies.get('access_token');
                if (token) {
                    setAccessToken(token);
                    await getBoardsAndWorkspaces(token);
                    dispatch(resetAppStates());
                } else {
                    console.error('Access token is undefined');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setAccessToken(undefined);
            }
        };

        fetchDataAndInitialize();
    }, [dispatch, getBoardsAndWorkspaces]);

    // Fetch notifications on mount
    useEffect(() => {
        if (!notificationsFetched && accessToken) {
            fetchNotifications(accessToken);
            dispatch(setNotificationsFetched(true));
        }
    }, [notificationsFetched, accessToken]);

    // Fetch notifications for the user
    const fetchNotifications = async (accessToken: string): Promise<void> => {
        try {
            const response = await axios.get(
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/notifications',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            const unreadNotifications = response.data.filter(
                (notification: any) => !notification.read,
            );
            // Update the state based on unread notifications
            dispatch(setNewNotifications(unreadNotifications.length > 0));

            // Update state with notifications
            dispatch(setNotifications(unreadNotifications));
        } catch (error) {
            console.error('Error fetching notifications');
        }
    };

    // Accept the workspace invitation in notifications
    const acceptWorkspaceInvitation = async (
        invitationId: number,
        notificationId: number,
    ): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.put(
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/workspaces/members/accept-invite',
                {
                    invitation_id: invitationId,
                    notification_id: notificationId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            if (response.status === 200) {
                window.location.reload();
            } else {
                console.error(response.data);
            }
        } catch (error) {
            console.error('Error accepting invite: ', error);
        }
    };

    // Reject workspace invitation in notifications
    const rejectWorkspaceInvitation = async (
        invitationId: number,
        notificationId: number,
    ): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.put(
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/workspaces/members/reject-invite',
                {
                    invitation_id: invitationId,
                    notification_id: notificationId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            if (response.status === 200) {
                console.log('Invitation rejected successfully');
            } else {
                console.log(response.data);
            }
        } catch (error) {
            console.error('Error rejecting invitation: ', error);
        }
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await verifyAccessToken();

            // Get the access token and refresh token from cookies
            const accessToken = Cookies.get('access_token') as string;

            // Once the token has been validated, log the user out
            await axios.post(
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/user/logout',
                {},
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                },
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
            console.error(
                'Error encountered when logging out. Please try again.',
                error,
            );
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
                    <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdownWorkspacesButton"
                    >
                        {workspaces &&
                            workspaces.map(workspace => {
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
                    <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdownBoardsButton"
                    >
                        {boards &&
                            boards.map(board => {
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
                    <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton1"
                    >
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
                    <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton2"
                    >
                        {favoriteBoards &&
                            favoriteBoards.map(favoriteBoard => {
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
                                onClick={() =>
                                    dispatch(updateCreateBoardModal())
                                }
                            >
                                {' '}
                                <p className="create-title"> Create Board</p>
                                <p className="create-description">
                                    Start a new board to visually organize
                                    tasks, track progress, and collaborate with
                                    team members efficiently. Boards serve as
                                    flexible workspaces where you can customize
                                    columns, add cards, and prioritize tasks
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
                            <a
                                className="dropdown-item"
                                onClick={() =>
                                    dispatch(updateCreateWorkspaceModal())
                                }
                            >
                                <p className="create-title">
                                    Create a Workspace
                                </p>
                                <p className="create-description">
                                    Set up a dedicated workspace to organize
                                    boards, share resources, and collaborate
                                    seamlessly with your team. Workspaces
                                    provide a centralized hub for team
                                    communication, file sharing, and project
                                    management
                                </p>
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item disabled" href="#">
                                <p className="create-title">
                                    Start from a template
                                </p>
                                <p className="create-description">
                                    Under development
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
                <div className="dropdown notifications">
                    <button
                        className="dropdown-btn dropdown-notifications dropdown-toggle no-arrow"
                        type="button"
                        id="notificationsDropdownMenu"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        {newNotifications ? (
                            <FaBell style={{ color: 'red' }} />
                        ) : (
                            <FaRegBell style={{ color: 'white' }} />
                        )}
                    </button>
                    {notifications.length === 0 && (
                        <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="notificationsDropdownMenu"
                        >
                            <li>
                                <div className="notification-container">
                                    <p className="dropdown-item notifications-dropdown-item">
                                        You don't have any notifications.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    )}
                    {notifications && notifications.length > 0 && (
                        <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="notificationsDropdownMenu"
                        >
                            {notifications.map(notification => (
                                <li key={notification.id}>
                                    <div className="notification-container">
                                        <a
                                            className="dropdown-item notifications-dropdown-item"
                                            href="#"
                                        >
                                            {notification.content}
                                        </a>
                                        <div className="button-container">
                                            <Button
                                                variant="success"
                                                onClick={() =>
                                                    acceptWorkspaceInvitation(
                                                        notification.invitation,
                                                        notification.id,
                                                    )
                                                }
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() =>
                                                    rejectWorkspaceInvitation(
                                                        notification.invitation,
                                                        notification.id,
                                                    )
                                                }
                                            >
                                                Refuse
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="search-container mr-3">
                    {/* <div className="search-icon-container">
                        <SlMagnifier className="magnifier" />
                    </div>
                    <input className="search" placeholder="Search" /> */}
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
