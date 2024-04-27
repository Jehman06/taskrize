import React, { lazy, Suspense } from 'react';
// Redux
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {
    Member,
    setEditing,
    setEditingWorkspaceId,
    setWorkspaceName,
} from '../../redux/reducers/workspaceSlice';
import {
    setShowDeleteWorkspaceModal,
    setShowWorkspaceMembersModal,
    setWorkspaceIdToDelete,
} from '../../redux/reducers/modalSlice';
// Component
import Board from '../Board/Board';
// API related
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios from 'axios';
// Styling

import './Workspace.css';
import '../Board/Board.css';
import '../Modals/Modal.css';
import { Button, Modal } from 'react-bootstrap';
import { BsFillPeopleFill } from 'react-icons/bs';
import { IoSettingsSharp, IoExitOutline } from 'react-icons/io5';
import { MdDriveFileRenameOutline, MdDelete } from 'react-icons/md';
// Images
import cherryBlossom from '../../images/cherryblossom.jpg';
import mountainLake from '../../images/mountainlake.jpg';
import newYork from '../../images/newYork.jpg';
import goldenGate from '../../images/goldenGate.jpg';
import palmTrees from '../../images/palmTrees.jpg';
import bigSur from '../../images/bigSur.jpg';
import yellowstone from '../../images/yellowstone.jpg';
import monumentValley from '../../images/monumentValley.jpg';
const WorkspaceMembersModal = lazy(() => import('../Modals/Workspace/WorkspaceMembersModal'));

interface WorkspaceProps {
    id: number;
    name: string;
    description: string;
    ownerId: number;
    members: Member[];
    boards: any[];
    toggleStar: (boardId: number) => Promise<void>;
    favoriteBoards: any[];
}

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

const Workspace: React.FC<WorkspaceProps> = ({
    name,
    boards,
    toggleStar,
    favoriteBoards,
    id,
    members,
}) => {
    // Redux state management
    const editing = useSelector((state: RootState) => state.workspace.editing);
    const workspaceName = useSelector((state: RootState) => state.workspace.workspaceName);
    const editingWorkspaceId = useSelector(
        (state: RootState) => state.workspace.editingWorkspaceId
    );
    const showDeleteModal = useSelector((state: RootState) => state.modal.showDeleteWorkspaceModal);
    const showMembersModal = useSelector(
        (state: RootState) => state.modal.showWorkspaceMembersModal
    );
    const workspaceIdToDelete = useSelector((state: RootState) => state.modal.workspaceIdToDelete);
    const dispatch = useDispatch();

    // Calculate the starFilled property for each board
    const boardsWithStarFilled = boards.map((board) => ({
        ...board,
        starFilled: favoriteBoards.some((favoriteBoard) => favoriteBoard.id === board.id),
    }));

    // Update Workspace
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setWorkspaceName(e.target.value));
    };

    const handleNameBlur = async () => {
        try {
            dispatch(setEditing(false));
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

    // Delete Workspace
    const handleDelete = (workspaceId: number) => {
        // Open the Modal to confirm deletion
        dispatch(setWorkspaceIdToDelete(workspaceId));
        dispatch(setShowDeleteWorkspaceModal(true));
    };

    const confirmDelete = async () => {
        if (workspaceIdToDelete !== null) {
            // Call the onDelete function to delete the workspace
            await onDelete(workspaceIdToDelete); // Pass the workspaceIdToDelete as a parameter
            // Close the modal
            await dispatch(setShowDeleteWorkspaceModal(false));
        }
    };

    const onDelete = async (workspaceId: number): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            // Make a DELETE request to the Workspace API to delete the workspace
            const response = await axios.delete('http://127.0.0.1:8000/api/workspaces/delete', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json', // Include Content-Type header
                },
                data: { workspace_id: workspaceId }, // Pass workspace_id in the request body
            });

            // Check if the response is successful
            if (response.status === 204) {
                window.location.reload();
                window.alert('Workspace deleted successfully');
            } else {
                console.error('Error deleting workspace');
            }
        } catch (error: any) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                window.alert(error.response.data.error);
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request);
                window.alert('No response received from server.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
                window.alert(error.message);
            }
        }
    };

    const cancelDelete = () => {
        // Close the modal without deleting the workspace
        dispatch(setShowDeleteWorkspaceModal(false));
    };

    const toggleWorkspaceMembersModal = () => {
        dispatch(setShowWorkspaceMembersModal({ show: true, id: id }));
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
                    <button className="btn button" onClick={toggleWorkspaceMembersModal}>
                        <BsFillPeopleFill className="settings-icon" /> Members
                    </button>

                    <Suspense
                        fallback={
                            <div className="text-center mt-5 mb-5">
                                <l-spiral size="30" color="teal"></l-spiral>
                            </div>
                        }
                    >
                        <WorkspaceMembersModal
                            id={id}
                            show={showMembersModal}
                            onHide={() =>
                                dispatch(setShowWorkspaceMembersModal({ show: false, id: null }))
                            }
                            members={members}
                            workspaceName={name}
                        />
                    </Suspense>
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
                            <MdDriveFileRenameOutline className="settings-dropdown-icons" />
                            Rename
                        </li>
                        <li
                            className="dropdown-item"
                            onClick={() => handleDelete(id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <MdDelete className="settings-dropdown-icons" />
                            Delete
                        </li>
                        <li className="dropdown-item" style={{ cursor: 'pointer' }}>
                            <IoExitOutline className="settings-dropdown-icons" />
                            Leave workspace
                        </li>
                    </ul>

                    {/* Confirm-Delete-Modal */}
                    <Modal
                        show={showDeleteModal}
                        onHide={() => dispatch(setShowDeleteWorkspaceModal(false))}
                        backdrop="static"
                        keyboard={false}
                        style={{ borderRadius: '0.3rem' }}
                        centered
                    >
                        <Modal.Body
                            className="modal-body"
                            style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
                        >
                            <div className="modal-delete-text">
                                All boards will be deleted for you and all members. Are you sure?
                            </div>
                            <div className="modal-delete-buttons">
                                <Button
                                    variant="success"
                                    className="modal-delete-button"
                                    onClick={confirmDelete}
                                >
                                    Yes
                                </Button>
                                <Button
                                    variant="danger"
                                    className="modal-delete-button"
                                    onClick={cancelDelete}
                                >
                                    No
                                </Button>
                            </div>
                        </Modal.Body>
                    </Modal>
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
