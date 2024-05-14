import React, { useEffect, useState } from 'react';
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
    setImages,
    setShowImageModal,
    setSampleImages,
} from '../../../redux/reducers/modalSlice';
import { setBoardFormData } from '../../../redux/reducers/boardSlice';
import { RootState } from '../../../redux/store';
import '../Modal.css';
import {
    Modal,
    Form,
    Button,
    DropdownButton,
    ButtonGroup,
    Dropdown,
} from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';
import { verifyAccessToken } from '../../../utils/apiUtils';
import type { Image } from '../../../redux/reducers/modalSlice';
import { FaArrowRight } from 'react-icons/fa';

const CreateBoardModal: React.FC = () => {
    const [formValid, setFormValid] = useState(false);

    // Redux state management
    const createBoardShow: boolean = useSelector(
        (state: RootState) => state.modal.createBoardModal,
    );
    const boardFormData = useSelector(
        (state: RootState) => state.board.boardFormData,
    );
    const workspaces = useSelector(
        (state: RootState) => state.workspace.workspaces,
    );
    const selectedWorkspace = useSelector(
        (state: RootState) => state.modal.selectedWorkspace,
    );
    const selectedDefaultImage: Image | null = useSelector(
        (state: RootState) => state.modal.selectedDefaultImage,
    );
    const errorTitleMessage: string | null = useSelector(
        (state: RootState) => state.modal.errorTitleMessage,
    );
    const errorImageMessage: string | null = useSelector(
        (state: RootState) => state.modal.errorImageMessage,
    );
    const errorWorkspaceMessage: string | null = useSelector(
        (state: RootState) => state.modal.errorWorkspaceMessage,
    );
    const sampleImages = useSelector(
        (state: RootState) => state.modal.sampleImages,
    );
    const images = useSelector((state: RootState) => state.modal.images);
    const showImageModal = useSelector(
        (state: RootState) => state.modal.showImageModal,
    );
    const dispatch = useDispatch();

    useEffect(() => {
        fetchImagesSample();
    }, []);

    useEffect(() => {
        if (showImageModal) {
            fetchImages();
        }
    }, [showImageModal]);

    useEffect(() => {
        if (
            selectedDefaultImage &&
            boardFormData.title &&
            boardFormData.workspace.name
        ) {
            setFormValid(true);
        } else {
            setFormValid(false);
        }
    }, [
        selectedDefaultImage,
        boardFormData.title,
        boardFormData.workspace.name,
    ]);

    // Modify handleImageSelect to store the selected image object
    const handleImageSelect = (image: any) => {
        dispatch(setSelectedDefaultImage(image));
        dispatch(
            setBoardFormData({ ...boardFormData, default_image: image.id }),
        ); // Dispatch action to update default_image in board form data
    };

    const fetchImagesSample = async () => {
        try {
            const accessToken = Cookies.get('access_token');
            const response = await axios.get(
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/images/sample',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            dispatch(setSampleImages(response.data.images));
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const fetchImages = async () => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.get(
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/images/all',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            dispatch(setImages(response.data.images));
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    useEffect(() => {
        // Set the first workspace as the default selected workspace when workspaces change
        if (workspaces.length > 0) {
            dispatch(setSelectedWorkspace(workspaces[0]));
            dispatch(
                setBoardFormData({
                    ...boardFormData,
                    workspace: workspaces[0],
                }),
            );
        }
    }, [workspaces, dispatch]);

    const createBoard = async (boardFormData: any) => {
        // Get the access token from cookies
        const accessToken = Cookies.get('access_token');
        try {
            await verifyAccessToken();
            // Send POST request to Board API to create the board
            const response = await axios.post(
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/boards/create',
                boardFormData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
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

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (formValid) {
            // Dispatch action to create board with form data
            dispatch(updateCreateBoardModal());
            dispatch(resetModalStates());
            createBoard(boardFormData);
        }
    };

    return (
        <Modal
            show={createBoardShow}
            onHide={() => dispatch(updateCreateBoardModal())}
            centered
        >
            <Modal.Header
                closeButton
                style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
            >
                <Modal.Title>Create a new Board</Modal.Title>
            </Modal.Header>
            <Modal.Body
                style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
                className="modal-body"
            >
                <Form onSubmit={handleFormSubmit}>
                    <Form.Group
                        className="mb-3"
                        controlId="exampleForm.ControlInput1"
                    >
                        <Form.Label>Background image</Form.Label>
                        <div className="modal-background-images">
                            {(sampleImages || []).map(image => {
                                return (
                                    <img
                                        key={image.id}
                                        src={image.url}
                                        alt={image.alt}
                                        className={
                                            selectedDefaultImage?.id ===
                                            image.id
                                                ? 'modal-background selected'
                                                : 'modal-background'
                                        }
                                        onClick={() => handleImageSelect(image)}
                                    />
                                );
                            })}
                            <div className="browse-and-selected">
                                <button
                                    className="browse-images"
                                    onClick={() =>
                                        dispatch(setShowImageModal(true))
                                    }
                                >
                                    <FaArrowRight /> Browse more images...
                                </button>
                                {selectedDefaultImage && (
                                    <div
                                        className="selected-image"
                                        style={{
                                            marginTop: '0.5rem',
                                            marginBottom: 0,
                                        }}
                                    >
                                        <img
                                            src={selectedDefaultImage.url}
                                            alt={selectedDefaultImage.alt}
                                            className="modal-background selected"
                                        />
                                        <p>Nice choice!</p>
                                    </div>
                                )}
                            </div>
                            {errorImageMessage && (
                                <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                                    {errorImageMessage}
                                </div>
                            )}
                            <Modal
                                show={showImageModal}
                                onHide={() =>
                                    dispatch(setShowImageModal(false))
                                }
                                size="xl"
                                centered
                            >
                                <Modal.Header
                                    closeButton
                                    style={{ backgroundColor: '#33373a' }}
                                >
                                    <Modal.Title style={{ color: '#9fadbc' }}>
                                        Choose an image
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body
                                    style={{ backgroundColor: '#33373a' }}
                                >
                                    <div className="modal-background-images">
                                        {(showImageModal
                                            ? images
                                            : sampleImages
                                        ).map(image => {
                                            return (
                                                <img
                                                    key={image.id}
                                                    src={image.url}
                                                    alt={image.alt}
                                                    className={
                                                        selectedDefaultImage?.id ===
                                                        image.id
                                                            ? 'modal-background selected'
                                                            : 'modal-background'
                                                    }
                                                    onClick={() =>
                                                        handleImageSelect(image)
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                dispatch(
                                                    setShowImageModal(false),
                                                )
                                            }
                                        >
                                            Ok
                                        </Button>
                                    </div>
                                </Modal.Body>
                            </Modal>
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
                    <Form.Group
                        className="mb-3"
                        controlId="exampleForm.ControlInput1"
                    >
                        <Form.Label>Board title</Form.Label>
                        <Form.Control
                            type="text"
                            className="modal-input"
                            autoFocus
                            value={boardFormData.title}
                            onChange={e =>
                                dispatch(
                                    setBoardFormData({
                                        ...boardFormData,
                                        title: e.target.value,
                                    }),
                                )
                            }
                        />
                        {errorTitleMessage && (
                            <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                                {errorTitleMessage}
                            </div>
                        )}
                    </Form.Group>
                    <Form.Group
                        className="mb-3"
                        controlId="exampleForm.ControlDropdown1"
                    >
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
                                onChange={e =>
                                    dispatch(
                                        setBoardFormData({
                                            ...boardFormData,
                                            workspace: {
                                                name: e.target.value,
                                            },
                                        }),
                                    )
                                }
                            />
                        ) : (
                            // If workspaces exist, the user has to provide the workspace they want their new board to be in
                            <DropdownButton
                                as={ButtonGroup}
                                title={
                                    selectedWorkspace
                                        ? selectedWorkspace.name
                                        : 'Workspace'
                                }
                                className="modal-dropdown-button custom-dropdown-button"
                                variant="secondary"
                            >
                                {workspaces.map(workspace => (
                                    <Dropdown.Item
                                        key={workspace.id}
                                        eventKey={workspace.id}
                                        className="modal-dropdown-item"
                                        onClick={() =>
                                            handleWorkspaceSelect(workspace)
                                        }
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
                    <Form.Group
                        className="mb-3"
                        controlId="exampleForm.ControlTextarea1"
                    >
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="modal-input"
                            value={boardFormData.description}
                            onChange={e =>
                                dispatch(
                                    setBoardFormData({
                                        ...boardFormData,
                                        description: e.target.value,
                                    }),
                                )
                            }
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer
                style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
            >
                <Button
                    variant="secondary"
                    onClick={() => dispatch(updateCreateBoardModal())}
                    className="modal-create-button"
                >
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={handleFormSubmit}
                    disabled={!formValid}
                    className="create-button"
                >
                    Create board
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateBoardModal;
