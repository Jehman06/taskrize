import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import {
    resetModalStates,
    updateCreateWorkspaceModal,
    updateErrorTitleMessage,
    updateWorkspaceFormData,
} from '../../redux/reducers/modalSlice';
import { verifyAccessToken } from '../../utils/apiUtils';

interface WorkspaceFormData {
    name: string;
    description: string;
}

const CreateWorkspaceModal: React.FC = () => {
    // Redux state management
    const createWorkspaceShow: boolean = useSelector(
        (state: RootState) => state.modal.createWorkspaceModal
    );
    const workspaceFormData: WorkspaceFormData = useSelector(
        (state: RootState) => state.modal.workspaceFormData
    );
    const errorTitleMessage: string | null = useSelector(
        (state: RootState) => state.modal.errorTitleMessage
    );
    const dispatch = useDispatch();

    // Send a POST request to the workspace API to create a new workspace
    const createWorkspace = async (workspaceFormData: WorkspaceFormData) => {
        try {
            // Verify the validity of JWT token, and refresh it if invalid (See utils/apiUtils.ts)
            await verifyAccessToken();
            // Get access token from cookies
            const accessToken = Cookies.get('access_token');
            // Send POST request to workspace API
            const response: AxiosResponse = await axios.post(
                'http://127.0.0.1:8000/api/workspaces/create',
                workspaceFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log('Workspace created successfully:', response.data);
            // Reset error message
            dispatch(resetModalStates());
            // Reload the page to fetch updated data
            window.location.reload();
        } catch (error) {
            console.error('Error creating workspace:', error);
        }
    };

    const handleFormSubmit = async (): Promise<void> => {
        if (!workspaceFormData.name) {
            dispatch(updateErrorTitleMessage('Please provide a name for your workspace.'));
            return;
        }
        // Dispatch action to create workspace with form data
        createWorkspace(workspaceFormData);
        dispatch(updateCreateWorkspaceModal());
        dispatch(resetModalStates());
    };

    return (
        <Modal
            show={createWorkspaceShow}
            onHide={() => dispatch(updateCreateWorkspaceModal())}
            centered
        >
            <Modal.Header closeButton style={{ backgroundColor: '#33373a', color: '#9fadbc' }}>
                <Modal.Title>Create a new Workspace</Modal.Title>
            </Modal.Header>
            <Modal.Body
                style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
                className="modal-body"
            >
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1"></Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Workspace name</Form.Label>
                        <Form.Control
                            type="text"
                            className="modal-input"
                            autoFocus
                            required
                            value={workspaceFormData.name}
                            onChange={(e) =>
                                dispatch(updateWorkspaceFormData({ name: e.target.value }))
                            }
                        />
                        {errorTitleMessage && (
                            <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                                {errorTitleMessage}
                            </div>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="modal-input"
                            value={workspaceFormData.description}
                            onChange={(e) =>
                                dispatch(updateWorkspaceFormData({ description: e.target.value }))
                            }
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#33373a', color: '#9fadbc' }}>
                <Button
                    variant="secondary"
                    onClick={() => dispatch(updateCreateWorkspaceModal())}
                    className="modal-create-button"
                >
                    Close
                </Button>
                <Button variant="primary" onClick={handleFormSubmit} className="create-button">
                    Create workspace
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateWorkspaceModal;
