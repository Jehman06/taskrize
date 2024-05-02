import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setBoard } from '../../redux/reducers/boardSlice';
import PrivateNavbar from '../../Components/Navbar/PrivateNavbar';
import { Button } from 'react-bootstrap';
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
import BoardNavbar from '../../Components/Navbar/BoardNavbar';

const BoardPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const board = useSelector((state: RootState) => state.board.board);
    const isCreatingList = useSelector((state: RootState) => state.list.isCreatingList);
    const newListName = useSelector((state: RootState) => state.list.newListName);
    const dispatch = useDispatch();

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

    const handleBlurNewList = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            dispatch(setNewListName(event.target.value));
        } else {
            dispatch(setIsCreatingList(false));
        }
    };

    const handleKeyDownNewList = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && event.currentTarget.value !== '') {
            dispatch(setNewListName(event.currentTarget.value));
            dispatch(setIsCreatingList(false));
        }
    };

    return (
        <div className="board-page">
            <PrivateNavbar />
            <div
                className="board-container"
                style={{
                    backgroundImage: `url(${board ? board.default_image.url : ''})`,
                }}
            >
                <div className="board-content">
                    {/* NAVBAR */}
                    {board && <BoardNavbar board={board} />}

                    {/* CONTENT */}
                    <div className="board-content-items">
                        <p
                            style={{
                                position: 'absolute',
                                top: '3rem',
                                right: '1rem',
                                fontSize: '0.8rem',
                            }}
                        >
                            Photo by {board ? board.default_image.owner : ''} on Unsplash
                        </p>
                        <div className="lists-container">
                            {board?.lists &&
                                board.lists.map((list: any) => <List key={list.id} list={list} />)}
                            {isCreatingList ? (
                                <div className="new-list">
                                    <div className="new-list-top">
                                        <input
                                            type="text"
                                            placeholder="Enter list name"
                                            value={newListName}
                                            onChange={handleNewListNameChange}
                                            onBlur={handleBlurNewList}
                                            onKeyDown={handleKeyDownNewList}
                                            autoFocus
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
