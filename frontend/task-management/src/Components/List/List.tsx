import React, { useEffect, useRef } from 'react';
import {
    List as ListType,
    setActiveListId,
    setIsCreatingList,
    setListFormData,
    setOpenListId,
    setRenamingListId,
} from '../../redux/reducers/listSlice';
import { Card as CardType } from '../../redux/reducers/cardSlice';
import { Dropdown, Button } from 'react-bootstrap';
import { SlOptions } from 'react-icons/sl';
import { MdDelete, MdDriveFileRenameOutline } from 'react-icons/md';
import { RxCross1 } from 'react-icons/rx';
import { FaPlus } from 'react-icons/fa';
import { IoOpen } from 'react-icons/io5';
import { RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setNewCardTitle } from '../../redux/reducers/cardSlice';
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios from 'axios';
import './List.css';
import Card from '../Card/Card';
import { setShowListModal } from '../../redux/reducers/modalSlice';
import ListModal from '../Modals/List/ListModal';

interface ListProps {
    list: ListType;
    socket: WebSocket;
    boardId?: number;
}

const List: React.FC<ListProps> = ({ list, socket, boardId }) => {
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const activeListId = useSelector((state: RootState) => state.list.activeListId);
    const newCardTitle = useSelector((state: RootState) => state.card.newCardTitle);
    const renamingListId = useSelector((state: RootState) => state.list.renamingListId);
    const listFormData = useSelector((state: RootState) => state.list.listFormData);
    // const showListModal = useSelector((state: RootState) => state.modal.showListModal);
    const dispatch = useDispatch();

    const inputRef = useRef<HTMLInputElement | null>(null);

    console.log(boardId);

    const handleNewCardTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        dispatch(setNewCardTitle(e.target.value));
    };

    const handleCreateCard = async (listId: number): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.post(
                'http://127.0.0.1:8000/api/cards/create',
                {
                    list_id: listId,
                    card_title: newCardTitle,
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
                dispatch(setNewCardTitle(''));
                dispatch(setActiveListId(null));
                window.location.reload();
            }
        } catch (error) {
            console.error('Error creating card:', error);
        }
    };

    // Future update
    // const handleOpenListModal = (listId: number): void => {
    //     dispatch(setShowListModal(listId)); // Change this to setShowListModal(listId)
    //     dispatch(setOpenListId(listId));
    // };

    const handleDeleteList = async (listId: number): Promise<void> => {
        console.log('handleDeleteList called, listId:', listId);
        console.log(`listId: ${listId}, userId: ${userId}`);
        if (socket.readyState === WebSocket.OPEN) {
            console.log('socket ready:', socket.readyState === WebSocket.OPEN);
            try {
                socket.send(
                    JSON.stringify({
                        action: 'delete_list',
                        list_id: listId,
                        user_id: userId,
                        board_id: boardId,
                    })
                );
            } catch (error) {
                console.error('Error deleting list:', error);
            }
        }
    };

    const handleUpdateListTitle = async (listId: number, newTitle: string): Promise<void> => {
        console.log('listFormData.title:', listFormData.title);
        if (socket.readyState === WebSocket.OPEN) {
            try {
                socket.send(
                    JSON.stringify({
                        action: 'update_list',
                        list_id: listId,
                        updated_data: { title: newTitle },
                        user_id: userId,
                        board_id: boardId,
                    })
                );
            } catch (error) {
                console.error('Error updating list title:', error);
            }
        }
    };

    const handleRenameList = (listId: number) => {
        dispatch(setRenamingListId(listId));
    };

    // onBlur and onKeyDown functions for list rename
    const handleBlurRename = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            dispatch(setListFormData({ title: event.target.value }));
            handleUpdateListTitle(list.id, event.target.value);
            dispatch(setRenamingListId(null)); // Move this line inside the if statement
        }
    };

    const handleKeyDownRename = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && event.currentTarget.value !== '') {
            dispatch(setListFormData({ title: event.currentTarget.value }));
            handleUpdateListTitle(list.id, event.currentTarget.value);
            dispatch(setRenamingListId(null)); // Move this line inside the if statement
        }
    };

    useEffect(() => {
        if (renamingListId === list.id && inputRef.current) {
            inputRef.current.focus();
        }
    }, [renamingListId]);

    const handleBlurNewCard = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            dispatch(setNewCardTitle(event.target.value));
        }
        dispatch(setActiveListId(null));
    };

    const handleKeyDownNewCard = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && event.currentTarget.value !== '') {
            dispatch(setNewCardTitle(event.currentTarget.value));
            handleCreateCard(list.id);
        } else if (event.key === 'Escape') {
            dispatch(setActiveListId(null));
        }
    };

    return (
        <div className="list">
            <div className="list-top">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={list.title}
                    onBlur={handleBlurRename}
                    onKeyDown={handleKeyDownRename}
                    style={{ display: renamingListId === list.id ? 'block' : 'none' }}
                />
                <p style={{ display: renamingListId === list.id ? 'none' : 'block' }}>
                    {list.title}
                </p>
                <Dropdown>
                    <Dropdown.Toggle variant="none" id="dropdown-basic" className="no-style">
                        <SlOptions className="SlOptions" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end" className="list-dropdown-menu">
                        {/* Future update */}
                        {/* <Dropdown.Item>
                            <div
                                className="dropdown-item-content"
                                onClick={() => handleOpenListModal(list.id)}
                            >
                                <IoOpen style={{ marginRight: '0.5rem' }} /> Open
                            </div>
                        </Dropdown.Item> */}
                        <Dropdown.Item>
                            <div
                                className="dropdown-item-content"
                                onClick={() => handleDeleteList(list.id)}
                            >
                                <MdDelete style={{ marginRight: '0.5rem' }} /> Delete
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item>
                            <div
                                className="dropdown-item-content"
                                onClick={() => handleRenameList(list.id)}
                            >
                                <MdDriveFileRenameOutline style={{ marginRight: '0.5rem' }} />{' '}
                                Rename
                            </div>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div className="list-items">
                {list.cards.map((card: CardType) => (
                    <Card key={card.id} card={card} />
                ))}
            </div>
            {list.id === activeListId ? (
                <div className="new-card-list-bottom">
                    <input
                        type="text"
                        placeholder="Enter a title for this card..."
                        value={newCardTitle}
                        onChange={handleNewCardTitleChange}
                        onBlur={handleBlurNewCard}
                        onKeyDown={handleKeyDownNewCard}
                        autoFocus
                    />
                    <div className="button-icon-container">
                        <RxCross1
                            className="new-list-cancel"
                            onClick={() => dispatch(setActiveListId(null))}
                        />
                    </div>
                </div>
            ) : (
                <p
                    className="list-bottom"
                    onClick={() => {
                        dispatch(setActiveListId(list.id));
                        dispatch(setIsCreatingList(false));
                    }}
                >
                    <FaPlus className="fa-plus" /> Add card
                </p>
            )}
            {/* LIST MODAL */}
            {/* Future update, added feature */}
            {/* <ListModal listId={list.id} /> */}
        </div>
    );
};

export default List;
