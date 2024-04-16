import React from 'react';
import './Workspace.css';
import '../Board/Board.css';
import Board from '../Board/Board';
import { BsFillPeopleFill } from 'react-icons/bs';
import { IoSettingsSharp } from 'react-icons/io5';
import cherryBlossom from '../../images/cherryblossom.jpg';
import mountainLake from '../../images/mountainlake.jpg';
import newYork from '../../images/newYork.jpg';
import goldenGate from '../../images/goldenGate.jpg';
import palmTrees from '../../images/palmTrees.jpg';
import bigSur from '../../images/bigSur.jpg';
import yellowstone from '../../images/yellowstone.jpg';
import monumentValley from '../../images/monumentValley.jpg';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {
    setEditing,
    setEditingWorkspaceId,
    setWorkspaceName,
} from '../../redux/reducers/workspaceSlice';
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios from 'axios';

interface WorkspaceProps {
    id: number;
    name: string;
    description: string;
    ownerId: number;
    members: number[];
    boards: any[];
    toggleStar: (boardId: number) => Promise<void>;
    favoriteBoards: any[];
}

const Workspace: React.FC<WorkspaceProps> = ({ name, boards, toggleStar, favoriteBoards, id }) => {
    // Redux state management
    const editing = useSelector((state: RootState) => state.workspace.editing);
    const workspaceName = useSelector((state: RootState) => state.workspace.workspaceName);
    const editingWorkspaceId = useSelector(
        (state: RootState) => state.workspace.editingWorkspaceId
    );
    const dispatch = useDispatch();

    // Calculate the starFilled property for each board
    const boardsWithStarFilled = boards.map((board) => ({
        ...board,
        starFilled: favoriteBoards.some((favoriteBoard) => favoriteBoard.id === board.id),
    }));

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setWorkspaceName(e.target.value));
    };

    const handleNameBlur = async () => {
        try {
            dispatch(setEditing(false));
            console.log(`Start of handleNameBlur, editing is ${editing}`);

            // Trim whitespace from workspaceName
            const trimmedName = workspaceName.trim();

            // Make sure that the workspace name is not empty after trimming whitespace
            if (trimmedName === '') {
                return;
            }

            // Check if the workspace name has been changed
            if (trimmedName !== name) {
                await verifyAccessToken();
                const accessToken = Cookies.get('access_token');

                // Prepare the data to send in the PUT request
                const requestData = {
                    workspace_id: id,
                    updated_data: { name: trimmedName }, // Use trimmedName instead of workspaceName
                };

                // Send PUT request to update the workspace name
                const response = await axios.put(
                    'http://127.0.0.1:8000/api/workspaces/update',
                    requestData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log(`${trimmedName} successfully renamed!`);
                console.log('Response: ', response.data);
            }
        } catch (error) {
            console.error('Error renaming workspace:', error);
        } finally {
            dispatch(setEditing(false));
            window.location.reload();
        }
    };

    const handleRenameClick = () => {
        dispatch(setEditing(true));
        dispatch(setEditingWorkspaceId(id));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNameBlur();
        }
    };

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
                    {editing && editingWorkspaceId === id ? (
                        <u>
                            <input
                                className="input-workspace-name"
                                type="text"
                                placeholder={name}
                                value={workspaceName}
                                onChange={handleNameChange}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                required
                            />
                        </u>
                    ) : (
                        <p>
                            <u>{name}</u>
                        </p>
                    )}
                </div>
                <div className="workspace-buttons">
                    <button className="btn button">
                        <BsFillPeopleFill className="settings-icon" /> Members
                    </button>
                    <button
                        className="btn button"
                        id="dropdownSettingsButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <IoSettingsSharp className="settings-icon" /> Settings
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownSettingsButton">
                        <li
                            className="dropdown-item"
                            style={{ cursor: 'pointer' }}
                            onClick={handleRenameClick}
                        >
                            Rename
                        </li>
                        <li className="dropdown-item" style={{ cursor: 'pointer' }}>
                            Delete
                        </li>
                    </ul>
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
