import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateCreateBoardModal, updateBoardFormData } from '../redux/reducers/modalSlice';
import { RootState } from '../redux/store';
import './Modal.css';
import { Modal, Form, Button, DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap';
import axios, { AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import cherryBlossom from '../images/cherryblossom.jpg';
import mountainLake from '../images/mountainlake.jpg';

interface Workspace {
    id: number;
    name: string;
}

interface BoardFormData {
    title: string;
    description: string;
    workspace: Workspace | null;
    image: string | null;
}

const CreateBoardModal: React.FC = () => {
    const createBoardShow: boolean = useSelector(
        (state: RootState) => state.modal.createBoardModal
    );
    const boardFormData: BoardFormData = useSelector(
        (state: RootState) => state.modal.boardFormData
    );
    const dispatch = useDispatch();

    // TODO: Use Redux for state management
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageSelect = (image: string) => {
        setSelectedImage(image);
        dispatch(updateBoardFormData({ image })); // Dispatch action to update image in board form data
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Get the uploaded file
        // Handle the file as needed, for example, upload it to the backend or display it preview
        // For now, let's just log the file details
        console.log('Uploaded file:', file);
    };

    useEffect(() => {
        getWorkspaces();
    }, []);

    useEffect(() => {
        // Set the first workspace as the default selected workspace when workspaces change
        if (workspaces.length > 0) {
            setSelectedWorkspace(workspaces[0]);
        }
    }, [workspaces]);

    let accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');

    const getWorkspaces = async () => {
        try {
            // Verify the access token
            await axios.post(
                'http://127.0.0.1:8000/api/token/verify/',
                { token: accessToken },
                { headers: { 'Content-Type': 'application/json' } }
            );
        } catch (verifyError) {
            // Handle token verification error
            const errorResponse = (verifyError as AxiosError).response;
            if (errorResponse && errorResponse.status === 401) {
                try {
                    // If verification fails (status 401), refresh the access token
                    const refreshResponse = await axios.post(
                        'http://127.0.0.1:8000/api/token/refresh/',
                        { refresh: refreshToken },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    // Update the access token with the refreshed token from the response
                    accessToken = refreshResponse.data.access;
                    // Store new token in cookies
                    Cookies.set('access_token', accessToken ?? '');
                } catch (refreshError) {
                    console.error('Error refreshing access token:', refreshError);
                    throw refreshError;
                }
            } else {
                // Handle other verification errors
                console.error('Error verifying access token:', verifyError);
                throw verifyError;
            }
        }
        const response: AxiosResponse = await axios.get('http://127.0.0.1:8000/api/workspaces/', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const workspaces = response.data;
        console.log('workspaces: ', workspaces);
        setWorkspaces(response.data);
    };

    const createBoard = async (boardFormData: BoardFormData) => {
        try {
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
            console.log('Board created:', response.data);
            // Handle success
        } catch (error) {
            console.error('Error creating board:', error);
            // Handle error
        }
    };

    const handleWorkspaceSelect = (workspace: Workspace) => {
        setSelectedWorkspace(workspace);
        dispatch(updateBoardFormData({ workspace: workspace })); // Dispatch action to update workspace in board form data
    };

    const handleFormSubmit = () => {
        // Dispatch action to create board with form data
        dispatch(updateCreateBoardModal());
        console.log(boardFormData);
        createBoard(boardFormData); // Assuming boardFormData is accessible here
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
                                    selectedImage === 'cherryBlossom'
                                        ? 'modal-background selected'
                                        : 'modal-background'
                                }
                                src={cherryBlossom}
                                alt="Cherry Blossom"
                                onClick={() => handleImageSelect('cherryBlossom')}
                            />
                            <img
                                className={
                                    selectedImage === 'mountainLake'
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
                                onChange={handleFileUpload}
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
