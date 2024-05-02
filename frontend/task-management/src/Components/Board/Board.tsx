import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { Image } from '../../redux/reducers/modalSlice';
import './Board.css';

interface BoardProps {
    id: number;
    title: string;
    description: string;
    favorite: boolean;
    default_image: Image;
    workspace: number;
    workspace_name: string;
    starFilled: boolean;
    toggleStar: (boardId: number) => void;
    showWorkspaceName?: boolean;
}

const Board: React.FC<BoardProps> = ({
    id,
    title,
    default_image,
    workspace_name,
    toggleStar,
    starFilled,
    showWorkspaceName = true, // Show the Workspace name if Board isn't in the Workspace section, for clarity
}) => {
    const navigate = useNavigate();

    const navigateToBoardPage = () => {
        navigate(`/board/${id}`);
    };

    return (
        <div className="board-wrapper" onClick={navigateToBoardPage}>
            <div className="board">
                <img src={default_image.url} alt="Board image" className="board-img" />
                <div className="board-title">{title}</div>
                {showWorkspaceName && (
                    <div className="workspace-name">In Workspace {workspace_name}</div>
                )}
                <div
                    onClick={(event) => {
                        event.stopPropagation();
                        toggleStar(id);
                    }}
                >
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
