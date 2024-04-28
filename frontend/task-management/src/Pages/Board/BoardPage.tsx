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
import { Dropdown } from 'react-bootstrap';
import { MdDelete } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
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
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchBoard = async (): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.get(`http://127.0.0.1:8000/api/boards/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log(`response: ${response.data}`);
            dispatch(setBoard(response.data));
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
                                        <Dropdown.Item href="#/action-1">
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
                            <div className="list">
                                <div className="list-top">
                                    <p>List Name</p>
                                    <SlOptions className="SlOptions" />
                                </div>
                                <div className="list-items">
                                    <div className="list-item">
                                        <p>Item 1</p>
                                    </div>
                                    <div className="list-item">
                                        <p>Item 2</p>
                                    </div>
                                    <div className="list-item">
                                        <p>Item 3</p>
                                    </div>
                                </div>
                                <p className="list-bottom">
                                    <FaPlus className="fa-plus" /> Add list
                                </p>
                            </div>
                            <div className="list">
                                <div className="list-top">
                                    <p>List Name</p>
                                    <SlOptions className="SlOptions" />
                                </div>
                                <div className="list-items">
                                    <div className="list-item">
                                        <p>Item 1</p>
                                    </div>
                                    <div className="list-item">
                                        <p>Item 2</p>
                                    </div>
                                </div>
                                <p className="list-bottom">
                                    <FaPlus className="fa-plus" /> Add list
                                </p>
                            </div>
                            <div className="list">
                                <div className="list-top">
                                    <p>List Name</p>
                                    <SlOptions className="SlOptions" />
                                </div>
                                <div className="list-item">
                                    <p>Item 1</p>
                                </div>
                                <div className="list-item">
                                    <p>Item 2</p>
                                </div>
                                <p className="list-bottom">
                                    <FaPlus className="fa-plus" /> Add list
                                </p>
                            </div>
                            <div className="list">
                                <div className="list-top">
                                    <p>List Name</p>
                                    <SlOptions className="SlOptions" />
                                </div>
                                <div className="list-item">
                                    <p>Item 1</p>
                                </div>
                                <div className="list-item">
                                    <p>Item 2</p>
                                </div>
                                <p className="list-bottom">
                                    <FaPlus className="fa-plus" /> Add list
                                </p>
                            </div>
                            <div className="list">
                                <div className="list-top">
                                    <p>List Name</p>
                                    <SlOptions className="SlOptions" />
                                </div>
                                <div className="list-item">
                                    <p>Item 1</p>
                                </div>
                                <div className="list-item">
                                    <p>Item 2</p>
                                </div>
                                <p className="list-bottom">
                                    <FaPlus className="fa-plus" /> Add list
                                </p>
                            </div>
                            <div className="list">
                                <div className="list-top">
                                    <p>List Name</p>
                                    <SlOptions className="SlOptions" />
                                </div>
                                <div className="list-item">
                                    <p>Item 1</p>
                                </div>
                                <div className="list-item">
                                    <p>Item 2</p>
                                </div>
                                <p className="list-bottom">
                                    <FaPlus className="fa-plus" /> Add list
                                </p>
                            </div>
                            <div className="list">
                                <div className="list-top">
                                    <p>List Name</p>
                                    <SlOptions className="SlOptions" />
                                </div>
                                <div className="list-item">
                                    <p>Item 1</p>
                                </div>
                                <div className="list-item">
                                    <p>Item 2</p>
                                </div>
                                <p className="list-bottom">
                                    <FaPlus className="fa-plus" /> Add list
                                </p>
                            </div>
                            <div className="list">
                                <div className="list-top">
                                    <p>List Name</p>
                                    <SlOptions className="SlOptions" />
                                </div>
                                <div className="list-item">
                                    <p>Item 1</p>
                                </div>
                                <div className="list-item">
                                    <p>Item 2</p>
                                </div>
                                <p className="list-bottom">
                                    <FaPlus className="fa-plus" /> Add list
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardPage;
