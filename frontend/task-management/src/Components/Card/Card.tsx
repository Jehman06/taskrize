import React from 'react';
import {
    Card as CardType,
    setIsEditingTitle,
    setNewCardTitle,
    setSelectedCard,
} from '../../redux/reducers/cardSlice';
import CardModal from '../Modals/Card/CardModal';
import '../List/List.css';
import { FaPen } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { setShowCardModal } from '../../redux/reducers/modalSlice';
import moment from 'moment';
import { FaClock } from 'react-icons/fa';

interface CardProps {
    card: CardType;
    socket: WebSocket;
    boardId?: number;
}

const Card: React.FC<CardProps> = ({ card, socket, boardId }) => {
    const showCardModal = useSelector(
        (state: RootState) => state.modal.showCardModal,
    );
    const selectedCard = useSelector(
        (state: RootState) => state.card.selectedCard,
    );
    const dispatch = useDispatch();

    const openModal = () => {
        dispatch(setShowCardModal(true));
        dispatch(setSelectedCard(card));
    };

    return (
        <div className="list-item">
            <div className="title-icon-container">
                <div>{card.title}</div>
                <FaPen className="edit-icon" onClick={openModal} />
            </div>
            {card.due_date && (
                <div className="due-date">
                    <div>
                        <FaClock style={{ marginRight: '0.1rem' }} />
                        {moment(card.due_date).format('MMM DD, YYYY')}
                    </div>
                </div>
            )}
            <CardModal
                card={selectedCard}
                show={showCardModal}
                onHide={() => {
                    dispatch(setShowCardModal(false));
                    dispatch(setIsEditingTitle(false));
                }}
                socket={socket}
                boardId={boardId}
            />
        </div>
    );
};

export default Card;
