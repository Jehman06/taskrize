import React from 'react';
import './Workspace.css';
import '../Board/Board.css';
import Board from '../Board/Board';
import { FaFlipboard } from 'react-icons/fa';
import { BsFillPeopleFill } from 'react-icons/bs';
import { IoSettingsSharp } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import cherryBlossom from '../../images/cherryblossom.jpg';
import mountainLake from '../../images/mountainlake.jpg';
import newYork from '../../images/newYork.jpg';
import goldenGate from '../../images/goldenGate.jpg';
import palmTrees from '../../images/palmTrees.jpg';
import bigSur from '../../images/bigSur.jpg';
import yellowstone from '../../images/yellowstone.jpg';
import monumentValley from '../../images/monumentValley.jpg';

interface WorkspaceProps {
    name: string;
    description: string;
    ownerId: number;
    members: number[];
    boards: any[];
    toggleStar: (boardId: number) => Promise<void>;
    favoriteBoards: any[];
}

const Workspace: React.FC<WorkspaceProps> = ({ name, boards, toggleStar, favoriteBoards }) => {
    // Calculate the starFilled property for each board
    const boardsWithStarFilled = boards.map((board) => ({
        ...board,
        starFilled: favoriteBoards.some((favoriteBoard) => favoriteBoard.id === board.id),
    }));

    // Map image names to file paths
    const imageMapping: { [key: string]: string } = {
        cherryBlossom: cherryBlossom,
        mountainLake: mountainLake,
        newYork: newYork,
        monumentValley: monumentValley,
        yellowstone: yellowstone,
        bigSur: bigSur,
        palmTrees: palmTrees,
        goldenGate: goldenGate,
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
                {boardsWithStarFilled.map((board: any) => {
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
                            starFilled={board.starFilled}
                            toggleStar={() => toggleStar(board.id)}
                            showWorkspaceName={false} // Because the board is in the Workspace section, we don't display the workspace name
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Workspace;
