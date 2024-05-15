import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import {
    setActiveListId,
    setIsCreatingList,
    setLists,
    setNewListName,
    sortListsByPosition,
} from '../../redux/reducers/listSlice';
import BoardNavbar from '../../Components/Navbar/BoardNavbar';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import List from '../../Components/List/List';
import { verifyAccessToken } from '../../utils/apiUtils';

export const getDraggableStyles = (isDragging: boolean) => ({
    transform: isDragging ? 'rotate(10deg)' : 'none',
    border: isDragging ? '1px solid teal' : 'none',
    borderRadius: isDragging ? '0.7rem' : '0.7rem',
    transition: 'transform 0.2s ease',
});

const BoardPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const [updateNeeded, setUpdateNeeded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const board = useSelector((state: RootState) => state.board.board);
    const lists = useSelector((state: RootState) => state.list.lists);
    // const isLoading = useSelector((state: RootState) => state.list.isLoading);
    const isCreatingList = useSelector(
        (state: RootState) => state.list.isCreatingList,
    );
    const newListName = useSelector(
        (state: RootState) => state.list.newListName,
    );
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        // Sort the lists by position after they are rehydrated from storage
        dispatch(sortListsByPosition());
    }, []);

    // Create a ref for the board state
    const boardRef = useRef(board);
    // Create a ref for the lists state
    const listsRef = useRef(lists);
    // Update the ref with the latest board state
    useEffect(() => {
        boardRef.current = board;
    }, [board]);

    // Function to establish the WebSocket connection and set up the event handlers
    // Create a new WebSocket connection outside of the useEffect hook
    let socket = new WebSocket(
        'wss://taskrize-2e3dd97a0d3e.herokuapp.com/ws/board/',
    );

    socket.onopen = () => {
        console.log('WebSocket connection opened');
    };

    socket.onmessage = event => {
        const data = JSON.parse(event.data);

        if (data && data.card) {
            // Dispatch a specific action for WebSocket card updates
            dispatch({
                type: 'WEBSOCKET_CARD_UPDATE',
                payload: { card: data.card },
            });
        }

        if (data && data.list) {
            // Dispatch a specific action for WebSocket list updates
            dispatch({
                type: 'WEBSOCKET_LIST_UPDATE',
                payload: { lists: data.list },
            });
        }
    };

    socket.onerror = error => {
        socket = new WebSocket(
            'wss://taskrize-2e3dd97a0d3e.herokuapp.com/ws/board/',
        );
    };

    socket.onclose = () => {
        socket = new WebSocket(
            'wss://taskrize-2e3dd97a0d3e.herokuapp.com/ws/board/',
        );
    };

    useEffect(() => {
        // Clean up function to close the socket when the component unmounts
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    const fetchBoard = async (): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.get(
                `https://taskrize-2e3dd97a0d3e.herokuapp.com/api/boards/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            dispatch(setBoard(response.data));
            dispatch(setLists(response.data.lists));
            setUpdateNeeded(false);
        } catch (error) {
            console.error('Error fetching board: ', error);
        }
    };

    useEffect(() => {
        fetchBoard().then(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        if (updateNeeded) {
            fetchBoard();
        }
    }, [updateNeeded]);

    const handleNewList = () => {
        dispatch(setIsCreatingList(true));
    };

    const handleNewListNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        e.preventDefault();
        dispatch(setNewListName(e.target.value));
    };

    const handleCreateList = async (newListName: string) => {
        if (socket.readyState === WebSocket.OPEN) {
            try {
                socket.send(
                    JSON.stringify({
                        action: 'create_list',
                        board_id: board?.id,
                        list_name: newListName,
                        user_id: userId,
                    }),
                );
                dispatch(setNewListName(''));
            } catch (error) {
                console.error('Error creating list:', error);
            }
        }
    };

    const handleBlurNewList = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            dispatch(setNewListName(event.target.value));
        } else {
            dispatch(setIsCreatingList(false));
        }
    };

    const handleKeyDownNewList = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter' && event.currentTarget.value !== '') {
            dispatch(setNewListName(event.currentTarget.value));
            handleCreateList(newListName);
            dispatch(setNewListName(''));
            dispatch(setIsCreatingList(false));
        }
    };

    const handleOnDragEnd = async (result: any) => {
        const { destination, source, draggableId, type } = result;

        // Ignore the result if the item was dropped outside of a droppable area
        if (!destination) {
            return;
        }

        // If board or board.lists are not defined, do nothing
        if (!board || !board.lists) {
            return;
        }

        // Check if board and board.lists are defined
        if (type === 'card') {
            // If the card was dropped in the same place it was dragged from, do nothing
            if (
                destination.droppableId === source.droppableId &&
                destination.index === source.index
            ) {
                return;
            }

            // Get the card ID from the draggableId
            const cardId = draggableId.split('-')[1];

            // Check WebSocket readyState
            if (socket.readyState === WebSocket.OPEN) {
                try {
                    // Send a message over the WebSocket connection
                    socket.send(
                        JSON.stringify({
                            action: 'move_card',
                            card_id: cardId,
                            new_list_id: destination.droppableId.split('-')[1],
                            new_position: destination.index + 1, // Add 1 to destination.index
                            board_id: board.id,
                        }),
                    );
                } catch (error) {
                    console.error('Error moving card:', error);
                }
            }
        } else {
            const startListIndex = source.index;
            const finishListIndex = destination.index;

            if (startListIndex !== finishListIndex) {
                // Extract the list id from the draggableId
                const listId = draggableId.split('-')[1];

                // Check WebSocket readyState
                if (socket.readyState === WebSocket.OPEN) {
                    try {
                        // Send a message over the WebSocket connection
                        socket.send(
                            JSON.stringify({
                                action: 'list_moved',
                                listId: listId,
                                newPosition: finishListIndex + 1,
                                board_id: board.id,
                            }),
                        );
                    } catch (error) {
                        console.error('Error moving list:', error);
                    }
                }
            }
        }
    };

    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
        );
    }

    if (isMobileDevice()) {
        return (
            <div className="boardpage-mobile">
                <button onClick={() => navigate('/home')}>
                    Back to Dashboard
                </button>
                <h1>
                    For a better experience, please use this app on a Desktop.
                </h1>
            </div>
        );
    }

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
                            Photo by {board ? board.default_image.owner : ''} on
                            Unsplash
                        </p>

                        {isLoading ? (
                            <div>Loading...</div>
                        ) : (
                            <DragDropContext onDragEnd={handleOnDragEnd}>
                                <div
                                    className="lists-and-new-button-container"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                    }}
                                >
                                    <Droppable
                                        droppableId="lists"
                                        direction="horizontal"
                                    >
                                        {(provided: any) => (
                                            <div
                                                className="lists-container"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {lists &&
                                                    lists.length > 0 &&
                                                    [...lists]
                                                        .sort(
                                                            (a: any, b: any) =>
                                                                a.position -
                                                                b.position,
                                                        )
                                                        .map(
                                                            (
                                                                list: any,
                                                                index: number,
                                                            ) => (
                                                                <Draggable
                                                                    key={
                                                                        list.id
                                                                    }
                                                                    draggableId={`list-${list.id}`}
                                                                    index={
                                                                        index
                                                                    }
                                                                >
                                                                    {(
                                                                        provided: any,
                                                                        snapshot: any,
                                                                    ) => (
                                                                        <div
                                                                            ref={
                                                                                provided.innerRef
                                                                            }
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                        >
                                                                            <div
                                                                                style={getDraggableStyles(
                                                                                    snapshot.isDragging,
                                                                                )}
                                                                            >
                                                                                <List
                                                                                    list={
                                                                                        list
                                                                                    }
                                                                                    socket={
                                                                                        socket
                                                                                    }
                                                                                    boardId={
                                                                                        board?.id
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ),
                                                        )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                    <div
                                        className="new-list-button-container"
                                        style={{ minWidth: '240px' }}
                                    >
                                        {isCreatingList ? (
                                            <div className="new-list">
                                                <div className="new-list-top">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter list name"
                                                        value={newListName}
                                                        onChange={
                                                            handleNewListNameChange
                                                        }
                                                        onBlur={
                                                            handleBlurNewList
                                                        }
                                                        onKeyDown={
                                                            handleKeyDownNewList
                                                        }
                                                        autoFocus
                                                    />
                                                    <div className="new-list-bottom">
                                                        <Button
                                                            variant="primary"
                                                            className="new-list-button"
                                                            onClick={() => {
                                                                handleCreateList(
                                                                    newListName,
                                                                );
                                                                dispatch(
                                                                    setIsCreatingList(
                                                                        false,
                                                                    ),
                                                                );
                                                            }}
                                                        >
                                                            Create list
                                                        </Button>
                                                        <RxCross1
                                                            className="new-list-cancel"
                                                            onClick={() =>
                                                                dispatch(
                                                                    setIsCreatingList(
                                                                        false,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="new-button"
                                                onClick={() => {
                                                    handleNewList();
                                                    dispatch(
                                                        setActiveListId(null),
                                                    );
                                                }}
                                            >
                                                <p>
                                                    <FaPlus className="fa-plus" />{' '}
                                                    New list
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DragDropContext>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardPage;
