import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import PrivateNavbar from '../../Navbar/PrivateNavbar';
import { spiral } from 'ldrs';
import { resetAppStates } from '../../redux/reducers/appSlice';
import './Home.css';
import { FaRegClock } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa';
import axios, { AxiosResponse } from 'axios';
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import Board from '../../Components/Board/Board';
import Workspace from '../../Components/Workspace/Workspace';
import cherryBlossom from '../../images/cherryblossom.jpg';
import mountainLake from '../../images/mountainlake.jpg';
import newYork from '../../images/newYork.jpg';
import goldenGate from '../../images/goldenGate.jpg';
import palmTrees from '../../images/palmTrees.jpg';
import bigSur from '../../images/bigSur.jpg';
import yellowstone from '../../images/yellowstone.jpg';
import monumentValley from '../../images/monumentValley.jpg';

// Map image names to file paths
const imageMapping: { [key: string]: string } = {
    cherryBlossom: cherryBlossom,
    mountainLake: mountainLake,
    newYork: newYork,
    monumentValley: monumentValley,
    yellowstone: yellowstone,
    bigSur: bigSur,
    palmTrees: palmTrees,
    goldenGate: goldenGate,
};

interface Board {
    id: number;
    title: string;
    description: string;
    favorite: any; // You might want to define a type for favorite property
    default_image: string;
    workspace: any; // You might want to define a type for workspace property
    workspace_name: string;
    starFilled: boolean;
}

interface Workspaces {
    id: number;
    name: string;
    description: string;
    owner: number;
    members: number[];
    boards: Board[];
}

interface FavoriteBoard {
    id: number;
    starFilled: boolean;
}

const Home: React.FC = () => {
    // Redux state management
    const userId: number | null = useSelector((state: RootState) => state.auth.user.id);
    const dispatch = useDispatch();

    spiral.register();

    const [selectedItem, setSelectedItem] = useState(null);
    const [boards, setBoards] = useState<Board[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspaces[]>([]);
    const [favoriteBoards, setFavoriteBoards] = useState<FavoriteBoard[]>([]);

    const handleItemClick = (item: any) => {
        setSelectedItem(item);
    };

    // Add board to favorite
    const toggleStar = async (boardId: number) => {
        try {
            // Verify the access token's validity and refresh it if it's expired
            await verifyAccessToken();
            // Get the valid token from the cookies
            const accessToken = Cookies.get('access_token');

            // Toggle the starFilled property locally
            const updatedBoards = boards.map((board) => {
                if (board.id === boardId) {
                    // Toggle the starFilled property
                    return { ...board, starFilled: !board.starFilled };
                }
                return board;
            });

            // Update boards state
            setBoards(updatedBoards);

            // Update favoriteBoards state
            const updatedFavoriteBoards = updatedBoards.filter((board) => board.starFilled);
            setFavoriteBoards(updatedFavoriteBoards);

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

    useEffect(() => {
        const fetchDataAndInitialize = async () => {
            await getBoardsAndWorkspaces();
            dispatch(resetAppStates());
        };

        fetchDataAndInitialize();
    }, []);

    useEffect(() => {
        // Initialize favoriteBoards state with initial favorite boards data
        const initialFavoriteBoards = boards.filter((board: Board) => board.starFilled);
        setFavoriteBoards(initialFavoriteBoards);
    }, [boards]);

    const fetchData = async (url: string): Promise<any> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');
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

    const getBoardsAndWorkspaces = async (): Promise<void> => {
        const boardsUrl = 'http://127.0.0.1:8000/api/boards/';
        const workspacesUrl = 'http://127.0.0.1:8000/api/workspaces/';

        try {
            const [boardsResponse, workspacesResponse] = await Promise.all([
                fetchData(boardsUrl),
                fetchData(workspacesUrl),
            ]);

            if (boardsResponse && workspacesResponse) {
                // Process boards data
                const fetchedBoards = boardsResponse.map((board: any) => ({
                    ...board,
                    starFilled: board.favorite.includes(userId),
                }));
                setBoards(fetchedBoards);

                // Filter favorite boards
                const initialFavoriteBoards = fetchedBoards.filter(
                    (board: any) => board.starFilled
                );
                setFavoriteBoards(initialFavoriteBoards);

                // Process workspaces data
                const updatedWorkspaces = await Promise.all(
                    workspacesResponse.map(async (workspace: any) => {
                        const boardsData = await fetchData(
                            `${workspacesUrl}${workspace.id}/boards`
                        );

                        // Merge the fetched boards data with the workspace object
                        return {
                            ...workspace,
                            boards: boardsData,
                        };
                    })
                );

                setWorkspaces(updatedWorkspaces);
            } else {
                console.error('Error fetching boards or workspaces.');
            }
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
                        <div className="board-content">
                            {favoriteBoards.map((board: any) => (
                                <Board
                                    key={board.id}
                                    id={board.id}
                                    title={board.title}
                                    description={board.description}
                                    favorite={board.favorite}
                                    default_image={imageMapping[board.default_image]}
                                    workspace={board.workspace}
                                    workspace_name={board.workspace_name}
                                    starFilled={board.starFilled}
                                    toggleStar={() => toggleStar(board.id)}
                                />
                            ))}
                        </div>

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
                                    workspace_name={board.workspace_name}
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
                        {workspaces &&
                            workspaces.map((workspace: any) => (
                                <Workspace
                                    key={workspace.id}
                                    name={workspace.name}
                                    description={workspace.description}
                                    ownerId={workspace.owner}
                                    members={workspace.members}
                                    boards={workspace.boards}
                                    toggleStar={toggleStar}
                                    favoriteBoards={favoriteBoards}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
