import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    updateCreateBoardModal,
    updateBoardFormData,
    updateSelectedCustomImage,
    updateSelectedDefaultImage,
    updateSelectedWorkspace,
    updateWorkspaces,
} from '../redux/reducers/modalSlice';
import { RootState } from '../redux/store';
import './Modal.css';
import { Modal, Form, Button, DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap';
import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import cherryBlossom from '../images/cherryblossom.jpg';
import mountainLake from '../images/mountainlake.jpg';
import { verifyAccessToken } from '../utils/apiUtils';

interface Workspace {
    id: number;
    name: string;
}

interface BoardFormData {
    title: string;
    description: string;
    workspace: Workspace | null;
    custom_image: File | string | null; // Allow both string (for default images) and File (for custom images)
    default_image: string | null;
}

const CreateBoardModal: React.FC = () => {
    // Redux state management
    const createBoardShow: boolean = useSelector(
        (state: RootState) => state.modal.createBoardModal
    );
    const boardFormData: BoardFormData = useSelector(
        (state: RootState) => state.modal.boardFormData
    );
    const workspaces: Workspace[] = useSelector((state: RootState) => state.modal.workspaces);
    const selectedWorkspace: Workspace | null = useSelector(
        (state: RootState) => state.modal.selectedWorkspace
    );
    const selectedDefaultImage: string | null = useSelector(
        (state: RootState) => state.modal.selectedDefaultImage
    );
    const dispatch = useDispatch();

    const handleImageSelect = (image: string | File) => {
        if (typeof image === 'string') {
            // If the selected image is one of the default images, set it as the selectedDefaultImage
            dispatch(updateSelectedDefaultImage(image));
            dispatch(updateSelectedCustomImage(null));
            // Update board form data with default image
            dispatch(updateBoardFormData({ custom_image: null, default_image: image }));
        } else {
            // If the selected image is a custom image, set it as the selectedCustomImage
            dispatch(updateSelectedCustomImage(image));
            dispatch(updateSelectedDefaultImage(null));
            // Update board form data with custom image
            dispatch(updateBoardFormData({ custom_image: image, default_image: null }));
        }
    };

    const handleFileUpload = (file: File | undefined) => {
        if (file) {
            // Handle the file as needed, upload it to the backend or display it preview
            // For now, let's just log the file details
            console.log('Uploaded file:', file);
            // Set the custom image in state
            dispatch(updateSelectedCustomImage(file));
            // Clear the default image selection
            dispatch(updateSelectedDefaultImage(null));
        }
    };

    useEffect(() => {
        getWorkspaces();
    }, []);

    useEffect(() => {
        // Set the first workspace as the default selected workspace when workspaces change
        if (workspaces.length > 0) {
            dispatch(updateSelectedWorkspace(workspaces[0]));
        }
    }, [workspaces]);

    // Get the workspaces from the database
    const getWorkspaces = async () => {
        try {
            // Verify the access token or refresh it if it's expired
            await verifyAccessToken();

            // Get the access token and refresh token from cookies
            const accessToken = Cookies.get('access_token');

            // Once the token has been validated or refreshed, create the new workspace
            const response: AxiosResponse = await axios.get(
                'http://127.0.0.1:8000/api/workspaces/',
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            dispatch(updateWorkspaces(response.data));
        } catch (error) {
            console.error('Error creating the workspace');
        }
    };

    const createBoard = async (boardFormData: BoardFormData) => {
        // Get the access token from cookies
        const accessToken = Cookies.get('access_token');
        try {
            await verifyAccessToken();

            // Send POST request to Board API to create the board
            const response = await axios.post(
                'http://127.0.0.1:8000/api/boards/create',
                boardFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            // Handle success
            console.log('Board created:', response.data);
        } catch (error) {
            // Handle error
            console.error('Error creating board:', error);
        }
    };

    const handleWorkspaceSelect = (workspace: Workspace) => {
        dispatch(updateSelectedWorkspace(workspace));
        dispatch(updateBoardFormData({ workspace: workspace })); // Dispatch action to update workspace in board form data
    };

    const handleFormSubmit = () => {
        // Dispatch action to create board with form data
        dispatch(updateCreateBoardModal());
        console.log(boardFormData);
        createBoard(boardFormData);
    };

    return (
        <Modal show={createBoardShow} onHide={() => dispatch(updateCreateBoardModal())} centered>
            <Modal.Header closeButton style={{ backgroundColor: '#33373a', color: '#9fadbc' }}>
                <Modal.Title>Create a new Board</Modal.Title>
            </Modal.Header>
            <Modal.Body
                style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
                className="modal-body"
            >
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Background image</Form.Label>
                        <div className="modal-background-images">
                            <img
                                className={
                                    selectedDefaultImage === 'cherryBlossom'
                                        ? 'modal-background selected'
                                        : 'modal-background'
                                }
                                src={cherryBlossom}
                                alt="Cherry Blossom"
                                onClick={() => handleImageSelect('cherryBlossom')}
                            />
                            <img
                                className={
                                    selectedDefaultImage === 'mountainLake'
                                        ? 'modal-background selected'
                                        : 'modal-background'
                                }
                                src={mountainLake}
                                alt="Mountain lake"
                                onClick={() => handleImageSelect('mountainLake')}
                            />
                        </div>
                        <div className="custom-upload">
                            <label htmlFor="file-upload" className="file-upload-label">
                                Or upload a custom image
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Board title</Form.Label>
                        <Form.Control
                            type="text"
                            className="modal-input"
                            autoFocus
                            required
                            value={boardFormData.title}
                            onChange={(e) =>
                                dispatch(updateBoardFormData({ title: e.target.value }))
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlDropdown1">
                        <Form.Label>Workspace</Form.Label>
                        <DropdownButton
                            as={ButtonGroup}
                            title={selectedWorkspace ? selectedWorkspace.name : 'Workspace'}
                            className="modal-dropdown-button custom-dropdown-button"
                            variant="secondary"
                        >
                            {workspaces.map((workspace) => (
                                <Dropdown.Item
                                    key={workspace.id}
                                    eventKey={workspace.id}
                                    className="modal-dropdown-item"
                                    onClick={() => handleWorkspaceSelect(workspace)}
                                >
                                    {workspace.name}
                                </Dropdown.Item>
                            ))}
                        </DropdownButton>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="modal-input"
                            value={boardFormData.description}
                            onChange={(e) =>
                                dispatch(updateBoardFormData({ description: e.target.value }))
                            }
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#33373a', color: '#9fadbc' }}>
                <Button
                    variant="secondary"
                    onClick={() => dispatch(updateCreateBoardModal())}
                    className="modal-create-button"
                >
                    Close
                </Button>
                <Button variant="primary" onClick={handleFormSubmit} className="create-button">
                    Create board
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateBoardModal;
