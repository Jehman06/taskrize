import React from 'react';
import { Form, Button } from 'react-bootstrap';

interface UpdateEmailModalProps {
    loading: boolean;
    errorMessage: string | null;
    dangerZoneFormData: {
        email: string;
        password: string;
    };
    updated_email: string;
    dispatch: React.Dispatch<any>;
    setDangerZoneFormData: React.Dispatch<any>;
    setUpdatedEmail: React.Dispatch<any>;
    confirmUpdateEmail: () => void;
    cancelUpdateEmail: () => void;
}

const UpdateEmailModalContent: React.FC<UpdateEmailModalProps> = ({
    loading,
    errorMessage,
    dangerZoneFormData,
    updated_email,
    dispatch,
    setDangerZoneFormData,
    setUpdatedEmail,
    confirmUpdateEmail,
    cancelUpdateEmail,
}) => {
    return (
        <>
            <div className="modal-delete-text">
                Are you sure you want to update your email address? You will have to login again.{' '}
            </div>
            {loading && (
                <div className="text-center mt-5 mb-5">
                    <l-spiral size="30" color="teal"></l-spiral>
                </div>
            )}
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
                    <Form.Label>New Email</Form.Label>
                    <Form.Control
                        type="email"
                        className="modal-input"
                        required
                        value={updated_email}
                        onChange={(e) => dispatch(setUpdatedEmail(e.target.value))}
                    />
                </Form.Group>
                <div className="modal-delete-buttons">
                    <Button
                        variant="success"
                        className="modal-delete-button"
                        onClick={confirmUpdateEmail}
                    >
                        Yes
                    </Button>
                    <Button
                        variant="danger"
                        className="modal-delete-button"
                        onClick={cancelUpdateEmail}
                    >
                        No
                    </Button>
                </div>
            </Form>
        </>
    );
};

export default UpdateEmailModalContent;
