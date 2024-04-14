import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import PrivateNavbar from '../Navbar/PrivateNavbar';
import { spiral } from 'ldrs';
import { resetAppStates } from '../redux/reducers/appSlice';
import './Home.css';
import { FaRegClock } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa';
import { FaFlipboard } from 'react-icons/fa';
import { BsFillPeopleFill } from 'react-icons/bs';
import { IoSettingsSharp } from 'react-icons/io5';
import placeholder from '../images/placeholder.png';
import axios, { AxiosResponse } from 'axios';
import { verifyAccessToken } from '../utils/apiUtils';
import Cookies from 'js-cookie';
import Board from '../Components/Board';
import cherryBlossom from '../images/cherryblossom.jpg';
import mountainLake from '../images/mountainlake.jpg';

// Map image names to file paths
const imageMapping: { [key: string]: string } = {
    cherryBlossom: cherryBlossom,
    mountainLake: mountainLake,
    // Add more image names and file paths as needed
};

interface Board {
    id: number;
    title: string;
    // Add other properties as needed
    starFilled: boolean;
}

const Home: React.FC = () => {
    // Redux state management
    const userId: number | null = useSelector((state: RootState) => state.auth.user.id);
    const dispatch = useDispatch();

    spiral.register();

    const [selectedItem, setSelectedItem] = useState(null);
    const [starFilled, setStarFilled] = useState(false);
    const [boards, setBoards] = useState<Board[]>([]);

    const handleItemClick = (item: any) => {
        setSelectedItem(item);
    };

    const toggleStar = async (boardId: number) => {
        try {
            // Verify the access token's validity and refresh it if it's expired
            await verifyAccessToken();
            // Get the valid token from the cookies
            const accessToken = Cookies.get('access_token');

            // Toggle the starFilled property locally
            const updatedBoards = boards.map((board) => {
                if (board.id === boardId) {
                    return { ...board, starFilled: !board.starFilled };
                }
                return board;
            });
            setBoards(updatedBoards);

            // Send a request to the backend to update the favorite status
            await axios.post(
                `http://127.0.0.1:8000/api/boards/toggle-favorite?board_id=${boardId}`, // Send boardId as a query parameter
                null, // No request body
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
        } catch (error) {
            console.error('Error toggling star:', error);
        }
    };

    // Reset app states, especially loading
    useEffect(() => {
        dispatch(resetAppStates());
    });

    useEffect(() => {
        getBoards();
    }, []);

    const getBoards = async (): Promise<void> => {
        try {
            // Verify the access token's validity and refresh it if it's expired
            await verifyAccessToken();
            // Get the valid token from the cookies
            const accessToken = Cookies.get('access_token');

            // Make a GET request to the board API to fetch the boards
            const response: AxiosResponse = await axios.get('http://127.0.0.1:8000/api/boards/', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const fetchedBoards = response.data.map((board: any) => ({
                ...board,
                // Determine if the board is favorited by the user and set starFilled accordingly
                starFilled: board.favorite.includes(userId),
            }));

            setBoards(fetchedBoards);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="home">
            <PrivateNavbar />
            <div className="home-container">
                <div className="container home-sidebar">
                    <p
                        className={selectedItem === 'board' ? 'selected' : ''}
                        onClick={() => handleItemClick('board')}
                    >
                        Boards
                    </p>
                    <p
                        className={selectedItem === 'templates' ? 'selected' : ''}
                        onClick={() => handleItemClick('templates')}
                    >
                        Templates
                    </p>
                </div>

                {/* BOARDS */}
                <div className="container home-content">
                    <div className="boards">
                        <div className="board-content-title">
                            <p>
                                <FaRegStar className="board-content-title-icon" /> Favorites
                            </p>
                        </div>
                        {/* <div className="board-content">
                            <div className="board-wrapper">
                                <div className="board">
                                    <img
                                        src={placeholder}
                                        alt="Board image"
                                        className="board-img"
                                    />
                                    <div className="board-title">Board Title</div>
                                    <div onClick={toggleStar}>
                                        {starFilled ? (
                                            <FaStar className="star-full" />
                                        ) : (
                                            <FaRegStar className="star-icon" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="board-wrapper">
                                <div className="board">
                                    <img
                                        src={placeholder}
                                        alt="Board image"
                                        className="board-img"
                                    />
                                    <div className="board-title">Board Title</div>
                                    <div onClick={toggleStar}>
                                        {starFilled ? (
                                            <FaStar className="star-full" />
                                        ) : (
                                            <FaRegStar className="star-icon" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        <div className="board-content-title">
                            <p>
                                <FaRegClock className="board-content-title-icon" /> Recently viewed
                            </p>
                        </div>
                        <div className="board-content">
                            {boards.map((board: any) => (
                                <Board
                                    key={board.id}
                                    id={board.id}
                                    title={board.title}
                                    description={board.description}
                                    favorite={board.favorite}
                                    default_image={imageMapping[board.default_image]}
                                    workspace={board.workspace}
                                    starFilled={board.starFilled}
                                    toggleStar={() => toggleStar(board.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* WORKSPACES */}
                    <div className="workspaces">
                        <div className="board-content-title">
                            <p>WORKSPACES</p>
                        </div>
                        <div className="workspace">
                            <div className="workspace-settings">
                                <div className="workspace-title">
                                    <p>
                                        <u>TaskRize</u>
                                    </p>
                                </div>
                                <div className="workspace-buttons">
                                    <button className="btn button">
                                        <FaFlipboard className="settings-icon" /> Boards
                                    </button>
                                    <button className="btn button">
                                        <BsFillPeopleFill className="settings-icon" /> Members
                                    </button>
                                    <button className="btn button">
                                        <IoSettingsSharp className="settings-icon" /> Settings
                                    </button>
                                </div>
                            </div>

                            {/* BOARDS */}
                            <div className="board-content">
                                {/* <div className="board-wrapper">
                                    <div className="board">
                                        <img
                                            src={placeholder}
                                            alt="Board image"
                                            className="board-img"
                                        />
                                        <div className="board-title">Board Title</div>
                                        <div onClick={toggleStar}>
                                            {starFilled ? (
                                                <FaStar className="star-full" />
                                            ) : (
                                                <FaRegStar className="star-icon" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="board-wrapper">
                                    <div className="board">
                                        <img
                                            src={placeholder}
                                            alt="Board image"
                                            className="board-img"
                                        />
                                        <div className="board-title">Board Title</div>
                                        <div onClick={toggleStar}>
                                            {starFilled ? (
                                                <FaStar className="star-full" />
                                            ) : (
                                                <FaRegStar className="star-icon" />
                                            )}
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
