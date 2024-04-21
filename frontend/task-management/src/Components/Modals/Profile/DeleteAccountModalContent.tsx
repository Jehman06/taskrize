import React from 'react';
import { Form, Button } from 'react-bootstrap';

interface DeleteAccountModalContentProps {
    errorMessage: string;
    dangerZoneFormData: {
        email: string;
        password: string;
    };
    setDangerZoneFormData: React.Dispatch<any>;
    dispatch: React.Dispatch<any>;
    confirmDeleteAccount: () => void;
    cancelDeleteAccount: () => void;
}

const DeleteAccountModalContent: React.FC<DeleteAccountModalContentProps> = ({
    errorMessage,
    dangerZoneFormData,
    setDangerZoneFormData,
    dispatch,
    confirmDeleteAccount,
    cancelDeleteAccount,
}) => {
    return (
        <>
            <div className="modal-delete-text">
                Are you sure you want to delete your account?{' '}
                <u style={{ color: '#b91919' }}>
                    <span style={{ color: '#b91919' }}>There is no going back.</span>
                </u>
            </div>
            {errorMessage && (
                <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                    {errorMessage}
                </div>
            )}
            <Form>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        className="modal-input"
                        autoFocus
                        required
                        value={dangerZoneFormData.email}
                        onChange={(e) =>
                            dispatch(
                                setDangerZoneFormData({
                                    ...dangerZoneFormData,
                                    email: e.target.value,
                                })
                            )
                        }
                    />
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        className="modal-input"
                        required
                        value={dangerZoneFormData.password}
                        onChange={(e) =>
                            dispatch(
                                setDangerZoneFormData({
                                    ...dangerZoneFormData,
                                    password: e.target.value,
                                })
                            )
                        }
                    />
                </Form.Group>
                <div className="modal-delete-buttons">
                    <Button
                        variant="success"
                        className="modal-delete-button"
                        onClick={confirmDeleteAccount}
                    >
                        Yes
                    </Button>
                    <Button
                        variant="danger"
                        className="modal-delete-button"
                        onClick={cancelDeleteAccount}
                    >
                        No
                    </Button>
                </div>
            </Form>
        </>
    );
};

export default DeleteAccountModalContent;
