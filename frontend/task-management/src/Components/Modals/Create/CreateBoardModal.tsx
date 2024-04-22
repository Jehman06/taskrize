import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    updateCreateBoardModal,
    setSelectedCustomImage,
    setSelectedDefaultImage,
    setSelectedWorkspace,
    setErrorTitleMessage,
    setErrorImageMessage,
    resetModalStates,
    setErrorWorkspaceMessage,
} from '../../../redux/reducers/modalSlice';
import { setBoardFormData } from '../../../redux/reducers/boardSlice';
import { RootState } from '../../../redux/store';
import '../Modal.css';
import { Modal, Form, Button, DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';
import cherryBlossom from '../../../images/cherryblossom.jpg';
import mountainLake from '../../../images/mountainlake.jpg';
import newYork from '../../../images/newYork.jpg';
import goldenGate from '../../../images/goldenGate.jpg';
import palmTrees from '../../../images/palmTrees.jpg';
import bigSur from '../../../images/bigSur.jpg';
import yellowstone from '../../../images/yellowstone.jpg';
import monumentValley from '../../../images/monumentValley.jpg';
import { verifyAccessToken } from '../../../utils/apiUtils';

const images = [
    cherryBlossom,
    mountainLake,
    newYork,
    goldenGate,
    palmTrees,
    bigSur,
    yellowstone,
    monumentValley,
];

const CreateBoardModal: React.FC = () => {
    // Redux state management
    const createBoardShow: boolean = useSelector(
        (state: RootState) => state.modal.createBoardModal
    );
    const boardFormData = useSelector((state: RootState) => state.board.boardFormData);
    const workspaces = useSelector((state: RootState) => state.workspace.workspaces);
    const selectedWorkspace = useSelector((state: RootState) => state.modal.selectedWorkspace);
    const selectedDefaultImage: string | null = useSelector(
        (state: RootState) => state.modal.selectedDefaultImage
    );
    const errorTitleMessage: string | null = useSelector(
        (state: RootState) => state.modal.errorTitleMessage
    );
    const errorImageMessage: string | null = useSelector(
        (state: RootState) => state.modal.errorImageMessage
    );
    const errorWorkspaceMessage: string | null = useSelector(
        (state: RootState) => state.modal.errorWorkspaceMessage
    );
    const dispatch = useDispatch();

    useEffect(() => {
        // Preload images when the component mounts
        preloadImages(Object.values(images));
    }, []);

    // Function to preload images
    const preloadImages = (urls: string[]) => {
        urls.forEach((url) => {
            const img = new Image();
            img.src = url;
        });
    };

    // As of right now, users cannot upload their own images as backgrounds. It's a feature that I will be working on in the future.
    const handleImageSelect = (image: string | File) => {
        if (typeof image === 'string') {
            // If the selected image is one of the default images, set it as the selectedDefaultImage
            dispatch(setSelectedDefaultImage(image));
            dispatch(setSelectedCustomImage(null));
            // Update board form data with default image
            dispatch(
                setBoardFormData({ ...boardFormData, custom_image: null, default_image: image })
            );
        } else {
            // If the selected image is a custom image, set it as the selectedCustomImage
            dispatch(setSelectedCustomImage(image));
            dispatch(setSelectedDefaultImage(null));
            // Update board form data with custom image
            dispatch(
                setBoardFormData({ ...boardFormData, custom_image: image, default_image: null })
            );
        }
    };

    // // Feature that will be worked on in the future
    // const handleFileUpload = (file: File | undefined) => {
    //     if (file) {
    //         // Handle the file as needed, upload it to the backend or display it preview
    //         // For now, let's just log the file details
    //         console.log('Uploaded file:', file);
    //         // Set the custom image in state
    //         dispatch(updateSelectedCustomImage(file));
    //         // Clear the default image selection
    //         dispatch(updateSelectedDefaultImage(null));
    //     }
    // };

    useEffect(() => {
        // Set the first workspace as the default selected workspace when workspaces change
        if (workspaces.length > 0) {
            dispatch(setSelectedWorkspace(workspaces[0]));
            dispatch(setBoardFormData({ ...boardFormData, workspace: workspaces[0] }));
        }
    }, [workspaces, dispatch]);

    const createBoard = async (boardFormData: any) => {
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
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            // Reset error message
            dispatch(resetModalStates());
            // Reload the page to fetch updated data
            window.location.reload();
        } catch (error) {
            // Handle error
            console.error('Error creating board:', error);
        }
    };

    const handleWorkspaceSelect = (workspace: any) => {
        dispatch(setSelectedWorkspace(workspace));
        dispatch(setBoardFormData({ ...boardFormData, workspace: workspace })); // Dispatch action to update workspace in board form data
    };

    const handleFormSubmit = () => {
        if (!selectedDefaultImage) {
            dispatch(setErrorImageMessage('Please select a background image.'));
            return;
        }
        if (!boardFormData.title) {
            dispatch(setErrorTitleMessage('Please provide a title for your board.'));
            return;
        }
        if (!boardFormData.workspace.name) {
            dispatch(setErrorWorkspaceMessage('Please create a workspace for your board.'));
            return;
        }
        // Dispatch action to create board with form data
        dispatch(updateCreateBoardModal());
        dispatch(resetModalStates());
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
                            <img
                                className={
                                    selectedDefaultImage === 'bigSur'
                                        ? 'modal-background selected'
                                        : 'modal-background'
                                }
                                src={bigSur}
                                alt="Big Sur"
                                onClick={() => handleImageSelect('bigSur')}
                            />
                            <img
                                className={
                                    selectedDefaultImage === 'newYork'
                                        ? 'modal-background selected'
                                        : 'modal-background'
                                }
                                src={newYork}
                                alt="New York"
                                onClick={() => handleImageSelect('newYork')}
                            />
                            <img
                                className={
                                    selectedDefaultImage === 'palmTrees'
                                        ? 'modal-background selected'
                                        : 'modal-background'
                                }
                                src={palmTrees}
                                alt="Palm Trees"
                                onClick={() => handleImageSelect('palmTrees')}
                            />
                            <img
                                className={
                                    selectedDefaultImage === 'goldenGate'
                                        ? 'modal-background selected'
                                        : 'modal-background'
                                }
                                src={goldenGate}
                                alt="Golden Gate"
                                onClick={() => handleImageSelect('goldenGate')}
                            />
                            <img
                                className={
                                    selectedDefaultImage === 'yellowstone'
                                        ? 'modal-background selected'
                                        : 'modal-background'
                                }
                                src={yellowstone}
                                alt="Yellowstone"
                                onClick={() => handleImageSelect('yellowstone')}
                            />
                            <img
                                className={
                                    selectedDefaultImage === 'monumentValley'
                                        ? 'modal-background selected'
                                        : 'modal-background'
                                }
                                src={monumentValley}
                                alt="Monument Valley"
                                onClick={() => handleImageSelect('monumentValley')}
                            />
                            {errorImageMessage && (
                                <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                                    {errorImageMessage}
                                </div>
                            )}
                        </div>
                        {/* <div className="custom-upload">
                            <label htmlFor="file-upload" className="file-upload-label">
                                Or upload a custom image
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                            />
                        </div> */}
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
                                dispatch(
                                    setBoardFormData({ ...boardFormData, title: e.target.value })
                                )
                            }
                        />
                        {errorTitleMessage && (
                            <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                                {errorTitleMessage}
                            </div>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlDropdown1">
                        <Form.Label>Workspace</Form.Label>
                        {/* If no workspace exists, the user needs to create a new workspace */}
                        {workspaces.length === 0 ? (
                            <Form.Control
                                type="text"
                                className="modal-input"
                                required
                                value={
                                    boardFormData.workspace
                                        ? boardFormData.workspace.name || ''
                                        : ''
                                }
                                onChange={(e) =>
                                    dispatch(
                                        setBoardFormData({
                                            ...boardFormData,
                                            workspace: {
                                                name: e.target.value,
                                            },
                                        })
                                    )
                                }
                            />
                        ) : (
                            // If workspaces exist, the user has to provide the workspace they want their new board to be in
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
                        )}
                        {errorWorkspaceMessage && (
                            <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                                {errorWorkspaceMessage}
                            </div>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="modal-input"
                            value={boardFormData.description}
                            onChange={(e) =>
                                dispatch(
                                    setBoardFormData({
                                        ...boardFormData,
                                        description: e.target.value,
                                    })
                                )
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
