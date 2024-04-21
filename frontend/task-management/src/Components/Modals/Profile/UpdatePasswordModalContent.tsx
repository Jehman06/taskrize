import React from 'react';
import { Form, Button } from 'react-bootstrap';

interface UpdatePasswordModalContentProps {
    loading: boolean;
    errorMessage: string;
    dangerZoneFormData: {
        email: string;
        password: string;
    };
    dispatch: React.Dispatch<any>;
    setDangerZoneFormData: React.Dispatch<any>;
    updated_password: string;
    setUpdatedPassword: React.Dispatch<any>;
    updated_password_confirm: string;
    setUpdatedPasswordConfirm: React.Dispatch<any>;
    confirmUpdatePassword: () => void;
    cancelUpdatePassword: () => void;
}

const UpdatePasswordModalContent: React.FC<UpdatePasswordModalContentProps> = ({
    loading,
    errorMessage,
    dangerZoneFormData,
    dispatch,
    setDangerZoneFormData,
    updated_password,
    setUpdatedPassword,
    updated_password_confirm,
    setUpdatedPasswordConfirm,
    confirmUpdatePassword,
    cancelUpdatePassword,
}) => {
    return (
        <>
            <div className="modal-delete-text">
                Are you sure you want to update your password? You will have to login again.{' '}
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
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        type="password"
                        className="modal-input"
                        required
                        value={updated_password}
                        onChange={(e) => dispatch(setUpdatedPassword(e.target.value))}
                    />
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                        type="password"
                        className="modal-input"
                        required
                        value={updated_password_confirm}
                        onChange={(e) => dispatch(setUpdatedPasswordConfirm(e.target.value))}
                    />
                </Form.Group>
                <div className="modal-delete-buttons">
                    <Button
                        variant="success"
                        className="modal-delete-button"
                        onClick={confirmUpdatePassword}
                    >
                        Yes
                    </Button>
                    <Button
                        variant="danger"
                        className="modal-delete-button"
                        onClick={cancelUpdatePassword}
                    >
                        No
                    </Button>
                </div>
            </Form>
        </>
    );
};

export default UpdatePasswordModalContent;
