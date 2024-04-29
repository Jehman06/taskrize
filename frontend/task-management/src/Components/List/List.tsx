import React from 'react';
import {
    List as ListType,
    setActiveListId,
    setIsCreatingList,
} from '../../redux/reducers/listSlice';
import { Card as CardType } from '../../redux/reducers/cardSlice';
import { Dropdown, Button } from 'react-bootstrap';
import { SlOptions } from 'react-icons/sl';
import { MdDelete } from 'react-icons/md';
import { RxCross1 } from 'react-icons/rx';
import { MdDriveFileRenameOutline } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import { RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setNewCardTitle } from '../../redux/reducers/cardSlice';
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios from 'axios';
import '../../Pages/Board/BoardPage.css';
import Card from '../Card/Card';

interface ListProps {
    list: ListType;
}

const List: React.FC<ListProps> = ({ list }) => {
    const activeListId = useSelector((state: RootState) => state.list.activeListId);
    const newCardTitle = useSelector((state: RootState) => state.card.newCardTitle);

    const dispatch = useDispatch();

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

    return (
        <div className="list">
            <div className="list-top">
                <p>{list.title}</p>
                <Dropdown>
                    <Dropdown.Toggle variant="none" id="dropdown-basic" className="no-style">
                        <SlOptions className="SlOptions" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end" className="list-dropdown-menu">
                        <Dropdown.Item>
                            <div
                                className="dropdown-item-content"
                                // onClick delete list
                            >
                                <MdDelete style={{ marginRight: '0.5rem' }} /> Delete List
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item>
                            <div className="dropdown-item-content">
                                <MdDriveFileRenameOutline style={{ marginRight: '0.5rem' }} />{' '}
                                Rename List
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
                    />
                    <div className="button-icon-container">
                        <Button
                            variant="primary"
                            className="new-list-button"
                            onClick={() => handleCreateCard(list.id)}
                        >
                            Create card
                        </Button>
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
        </div>
    );
};

export default List;
