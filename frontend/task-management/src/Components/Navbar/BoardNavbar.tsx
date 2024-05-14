import React from 'react';
import { Board } from '../../redux/reducers/boardSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { SlOptions } from 'react-icons/sl';
import { MdDelete } from 'react-icons/md';
import { verifyAccessToken } from '../../utils/apiUtils';
import { Dropdown } from 'react-bootstrap';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './BoardNavbar.css';

interface BoardNavbarProps {
    board: Board;
}

const BoardNavbar: React.FC<BoardNavbarProps> = ({ board }) => {
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const navigate = useNavigate();

    const toggleFavorite = async (): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.post(
                `https://taskrize-2e3dd97a0d3e.herokuapp.com/api/boards/toggle-favorite?board_id=${board?.id}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
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

            const response = await axios.delete(
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/boards/delete',
                {
                    data: {
                        board_id: board?.id,
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            console.log(response.data);
            if (response.status === 204) {
                navigate('/home');
            }
        } catch (error) {
            console.error('Error deleting the board', error);
        }
    };

    return (
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
                                style={{
                                    cursor: 'pointer',
                                    fontSize: '1.3rem',
                                }}
                            />
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                            align="end"
                            className="board-dropdown-menu"
                        >
                            <Dropdown.Item>
                                <div
                                    className="dropdown-item-content"
                                    onClick={() => deleteBoard()}
                                >
                                    <MdDelete
                                        style={{ marginRight: '0.5rem' }}
                                    />{' '}
                                    Delete Board
                                </div>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
};

export default BoardNavbar;
