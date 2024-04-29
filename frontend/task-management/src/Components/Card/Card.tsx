import React from 'react';
import { Card as CardType } from '../../redux/reducers/cardSlice';
import '../../Pages/Board/BoardPage.css';

interface CardProps {
    card: CardType;
}

const Card: React.FC<CardProps> = ({ card }) => {
    return <div className="list-item">{card.title}</div>;
};

export default Card;
