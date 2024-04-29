import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setBoard } from '../../redux/reducers/boardSlice';
import PrivateNavbar from '../../Navbar/PrivateNavbar';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { SlOptions } from 'react-icons/sl';
import { Button, Dropdown } from 'react-bootstrap';
import { MdDelete } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import { RxCross1 } from 'react-icons/rx';
import './BoardPage.css';
// Images
import cherryBlossom from '../../images/cherryblossom.jpg';
import mountainLake from '../../images/mountainlake.jpg';
import newYork from '../../images/newYork.jpg';
import goldenGate from '../../images/goldenGate.jpg';
import palmTrees from '../../images/palmTrees.jpg';
import bigSur from '../../images/bigSur.jpg';
import yellowstone from '../../images/yellowstone.jpg';
import monumentValley from '../../images/monumentValley.jpg';
import {
    setActiveListId,
    setIsCreatingList,
    setLists,
    setNewListName,
} from '../../redux/reducers/listSlice';
import List from '../../Components/List/List';

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

const BoardPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const userId = useSelector((state: RootState) => state.auth.user.id);
    const board = useSelector((state: RootState) => state.board.board);
    const isCreatingList = useSelector((state: RootState) => state.list.isCreatingList);
    const newListName = useSelector((state: RootState) => state.list.newListName);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchBoard = async (): Promise<void> => {
        try {
            const accessToken = Cookies.get('access_token');

            const response = await axios.get(`http://127.0.0.1:8000/api/boards/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log(`response: ${response.data}`);
            dispatch(setBoard(response.data));
            dispatch(setLists(response.data.lists));
        } catch (error) {
            console.error('Error fetching board: ', error);
        }
    };

    useEffect(() => {
        fetchBoard();
    }, []);

    const toggleFavorite = async (): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.post(
                `http://127.0.0.1:8000/api/boards/toggle-favorite?board_id=${board?.id}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log(response.data);
            if (response.status === 200) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error toggling favorite', error);
        }
    };

    const deleteBoard = async (): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.delete('http://127.0.0.1:8000/api/boards/delete', {
                data: {
                    board_id: board?.id,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log(response.data);
            if (response.status === 204) {
                navigate('/home');
            }
        } catch (error) {
            console.error('Error deleting the board', error);
        }
    };

    const handleNewList = () => {
        dispatch(setIsCreatingList(true));
    };

    const handleNewListNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        dispatch(setNewListName(e.target.value));
    };

    const handleCreateList = async (): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.post(
                'http://127.0.0.1:8000/api/lists/create',
                {
                    board_id: board?.id,
                    list_name: newListName,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log(response.data);
            if (response.status === 201) {
                // If successful
                dispatch(setIsCreatingList(false));
                dispatch(setNewListName(''));
                window.location.reload();
            }
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    return (
        <div className="board-page">
            <PrivateNavbar />
            <div
                className="board-container"
                style={{
                    backgroundImage: `url(${board ? imageMapping[board.default_image] : ''})`,
                }}
            >
                {/* NAVBAR */}
                <div className="board-content">
                    <div className="board-navbar">
                        <div className="board-navbar-left">
                            <p>{board ? board.title : ''}</p>
                            {board && userId !== null && board.favorite.includes(userId) ? (
                                <FaStar
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleFavorite()}
                                />
                            ) : (
                                <FaRegStar
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleFavorite()}
                                />
                            )}
                        </div>
                        <div className="board-navbar-right">
                            <div className="dropdown options">
                                <Dropdown>
                                    <Dropdown.Toggle
                                        variant="none"
                                        id="dropdown-basic"
                                        className="no-style"
                                    >
                                        <SlOptions
                                            style={{ cursor: 'pointer', fontSize: '1.3rem' }}
                                        />
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu align="end" className="board-dropdown-menu">
                                        <Dropdown.Item>
                                            <div
                                                className="dropdown-item-content"
                                                onClick={() => deleteBoard()}
                                            >
                                                <MdDelete style={{ marginRight: '0.5rem' }} />{' '}
                                                Delete Board
                                            </div>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="board-content-items">
                        <div className="lists-container">
                            {board?.lists &&
                                board.lists.map((list: any) => <List key={list.id} list={list} />)}
                            {isCreatingList ? (
                                <div className="new-list">
                                    <div className="new-list-top">
                                        <input
                                            type="text"
                                            value={newListName}
                                            onChange={handleNewListNameChange}
                                        />
                                        <div className="new-list-bottom">
                                            <Button
                                                variant="primary"
                                                className="new-list-button"
                                                onClick={handleCreateList}
                                            >
                                                Create list
                                            </Button>
                                            <RxCross1
                                                className="new-list-cancel"
                                                onClick={() => dispatch(setIsCreatingList(false))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="new-button"
                                    onClick={() => {
                                        handleNewList();
                                        dispatch(setActiveListId(null));
                                    }}
                                >
                                    <p>
                                        <FaPlus className="fa-plus" /> New list
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardPage;
