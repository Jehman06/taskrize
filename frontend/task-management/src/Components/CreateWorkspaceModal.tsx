import React, { useEffect, useState } from 'react';
import { Modal, Form, DropdownButton, Dropdown, Button } from 'react-bootstrap';
import { UseDispatch, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import axios, { AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { updateCreateWorkspaceModal, updateWorkspaceFormData } from '../redux/reducers/modalSlice';

interface WorkspaceFormData {
    name: string;
    description: string;
}

const CreateWorkspaceModal: React.FC = () => {
    const createWorkspaceShow: boolean = useSelector(
        (state: RootState) => state.modal.createWorkspaceModal
    );
    const workspaceFormData: WorkspaceFormData = useSelector(
        (state: RootState) => state.modal.workspaceFormData
    );
    const dispatch = useDispatch();

    let accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');

    const createWorkspace = async (workspaceFormData: WorkspaceFormData) => {
        try {
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
        } catch (error) {
            console.error('Error creating workspace:', error);
        }
    };

    // Make a POST request to save the new workspace
    const handleFormSubmit = async (): Promise<void> => {
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
        createWorkspace(workspaceFormData);
        dispatch(updateCreateWorkspaceModal());
        console.log(workspaceFormData);
    };

    return (
        <Modal
            show={createWorkspaceShow}
            onHide={() => dispatch(updateCreateWorkspaceModal())}
            centered
        >
            <Modal.Header closeButton style={{ backgroundColor: '#33373a', color: '#9fadbc' }}>
                <Modal.Title>Create a new Board</Modal.Title>
            </Modal.Header>
            <Modal.Body
                style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
                className="modal-body"
            >
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1"></Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Board title</Form.Label>
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
                    Create board
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateWorkspaceModal;
