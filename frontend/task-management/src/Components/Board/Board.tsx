import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import './Board.css';

interface BoardProps {
    id: number;
    title: string;
    description: string;
    favorite: boolean;
    default_image: string;
    workspace: number;
    workspace_name: string;
    starFilled: boolean;
    toggleStar: (boardId: number) => void;
    showWorkspaceName?: boolean;
}

const Board: React.FC<BoardProps> = ({
    id,
    title,
    description,
    favorite,
    default_image,
    workspace,
    workspace_name,
    toggleStar,
    starFilled, // Here we receive the starFilled prop
    showWorkspaceName = true,
}) => {
    return (
        <div className="board-wrapper">
            <div className="board">
                <img src={default_image} alt="Board image" className="board-img" />
                <div className="board-title">{title}</div>
                {showWorkspaceName && (
                    <div className="workspace-name">In Workspace {workspace_name}</div>
                )}
                <div onClick={() => toggleStar(id)}>
                    {starFilled ? (
                        <FaStar className="star-full" /> // Render filled star icon if starFilled is true
                    ) : (
                        <FaRegStar className="star-icon" /> // Render empty star icon if starFilled is false
                    )}
                </div>
            </div>
        </div>
    );
};

export default Board;
