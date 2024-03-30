import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

interface BoardProps {
    title: string;
    image: string;
    starFilled: boolean;
    toggleStar: () => void;
}

const Board: React.FC<BoardProps> = ({ title, image, starFilled, toggleStar }) => {
    return (
        <div className="board">
            <img src={image} alt="Board image" className="board-img" />
            <div className="board-title">{title}</div>
            <div onClick={toggleStar}>
                {starFilled ? (
                    <FaStar className="star-full" />
                ) : (
                    <FaRegStar className="star-icon" />
                )}
            </div>
        </div>
    );
};

export default Board;
