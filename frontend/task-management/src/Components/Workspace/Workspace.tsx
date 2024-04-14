import React from 'react';
import './Workspace.css';
import '../Board/Board.css';
import Board from '../Board/Board';
import { FaFlipboard } from 'react-icons/fa';
import { BsFillPeopleFill } from 'react-icons/bs';
import { IoSettingsSharp } from 'react-icons/io5';
import { FaStar, FaRegStar } from 'react-icons/fa';
import cherryBlossom from '../../images/cherryblossom.jpg';
import mountainLake from '../../images/mountainlake.jpg';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface Workspaces {
    id: number;
    name: string;
    description: string;
    owner: number;
    members: number[];
}

interface WorkspaceProps {
    name: string;
    description: string;
    ownerId: number;
    members: number[];
    boards: any[];
    toggleStar: (boardId: number) => Promise<void>;
    workspaces: Workspaces[]; // Add workspaces to the WorkspaceProps interface
}

// Map image names to file paths
const imageMapping: { [key: string]: string } = {
    cherryBlossom: cherryBlossom,
    mountainLake: mountainLake,
    // Add more image names and file paths as needed
};

const Workspace: React.FC<WorkspaceProps> = ({
    name,
    description,
    ownerId,
    members,
    boards,
    toggleStar,
    workspaces,
}) => {
    // Redux state management
    const userId: number | null = useSelector((state: RootState) => state.auth.user.id);

    // Function to determine if a board is favorited by the user
    const isBoardFavorited = (board: any): boolean => {
        return board.favorite.includes(userId);
    };

    return (
        <div className="workspace">
            <div className="workspace-settings">
                <div className="workspace-title">
                    <p>
                        <u>{name}</u>
                    </p>
                </div>
                <div className="workspace-buttons">
                    <button className="btn button">
                        <FaFlipboard className="settings-icon" /> Boards
                    </button>
                    <button className="btn button">
                        <BsFillPeopleFill className="settings-icon" /> Members
                    </button>
                    <button className="btn button">
                        <IoSettingsSharp className="settings-icon" /> Settings
                    </button>
                </div>
            </div>

            {/* Render the boards */}
            <div className="board-content">
                {boards.map((board: any) => {
                    console.log('User ID:', userId);
                    console.log('Favorite array:', board.favorite);
                    const starFilled = isBoardFavorited(board);
                    console.log('starFilled:', starFilled);
                    return (
                        <Board
                            key={board.id}
                            id={board.id}
                            title={board.title}
                            description={board.description}
                            favorite={board.favorite}
                            default_image={imageMapping[board.default_image]}
                            workspace={board.workspace}
                            workspace_name={board.workspace_name}
                            starFilled={starFilled}
                            toggleStar={() => toggleStar(board.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Workspace;
