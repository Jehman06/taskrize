import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Redux
import {
    setDeleteAccountFormData,
    setFormProfileData,
    setProfile,
    setUpdatedEmail,
    setUpdatedPassword,
    setUpdatedPasswordConfirm,
    UserProfile,
} from '../../redux/reducers/profileSlice';
import { setShowEmojiPicker } from '../../redux/reducers/emojiSlice';
import {
    setErrorImageMessage,
    setShowDeleteAccountModal,
    setShowUpdateEmailModal,
    setShowUpdatePasswordModal,
} from '../../redux/reducers/modalSlice';

// API related
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios, { AxiosResponse } from 'axios';

// Styling
import { Button, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { FaRegFaceSmileBeam, FaFaceSmileBeam } from 'react-icons/fa6';
import './Profile.css';
import '../../Components/Modals/Modal.css';
import '../../Components/Workspace/Workspace.css';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { logoutUser, resetAuthStates } from '../../redux/reducers/authSlice';
import { resetAppStates, setErrorMessage, setLoading } from '../../redux/reducers/appSlice';
import { spiral } from 'ldrs';

// Initialize the loading spinner icon
spiral.register();

const ProfilePage: React.FC = () => {
    // Redux state management
    // Profile
    const profile = useSelector((state: RootState) => state.profile.profile);
    const formProfileData = useSelector((state: RootState) => state.profile.formProfileData);
    const deleteAccountFormData = useSelector(
        (state: RootState) => state.profile.deleteAccountFormData
    );
    const ShowEmojiPicker = useSelector((state: RootState) => state.emoji.showEmojiPicker);
    const updated_email = useSelector((state: RootState) => state.profile.updated_email);
    const updated_password = useSelector((state: RootState) => state.profile.updated_password);
    const updated_password_confirm = useSelector(
        (state: RootState) => state.profile.updated_password_confirm
    );
    // Modal
    const showDeleteAccountModal = useSelector(
        (state: RootState) => state.modal.showDeleteAccountModal
    );
    const showUpdateEmailModal = useSelector(
        (state: RootState) => state.modal.showUpdateEmailModal
    );
    const showUpdatePasswordModal = useSelector(
        (state: RootState) => state.modal.showUpdatePasswordModal
    );
    // App
    const errorMessage = useSelector((state: RootState) => state.app.errorMessage);
    const loading = useSelector((state: RootState) => state.app.loading);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Fetch the user profile on component mount
    useEffect(() => {
        getUserProfile();
    }, [dispatch]);

    const memoizedDispatch = useCallback(dispatch, []);

    useEffect(() => {
        // Set formProfileData fields to profile fields when the profile object changes
        if (profile) {
            memoizedDispatch(
                setFormProfileData({
                    ...formProfileData,
                    name: profile.name || '',
                    nickname: profile.nickname || '',
                    bio: profile.bio || '',
                })
            );
        }
    }, [dispatch, profile]);

    // Handle the profile input changes
    const handleProfileInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        dispatch(setFormProfileData({ ...(formProfileData as UserProfile), [name]: value }));
    };

    // Open/close the emoji picker for the bio
    const toggleEmojiPicker = () => {
        dispatch(setShowEmojiPicker(!ShowEmojiPicker));
    };

    // Select emojis and add them to bio
    const handleEmojiSelect = (emoji: any) => {
        dispatch(
            setFormProfileData({
                ...(formProfileData as UserProfile),
                bio: formProfileData.bio + emoji.native,
            })
        );
    };

    // Get the user information
    const getUserProfile = async () => {
        try {
            // Verify the validity of the access token
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token'); // Access the access token from the cookies

            // Send get request to user API to get user's information
            const response = await axios.get('http://127.0.0.1:8000/api/user/profile', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            dispatch(setProfile(response.data));
        } catch (error) {
            console.error('Error fetching profile information: ', error);
        }
    };

    // Update profile function
    const updateProfile = async (): Promise<void> => {
        try {
            // Verify the validity of the access token
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token'); // Access the access token from the cookies

            // Create a copy of the formProfileData
            const updatedData = { ...formProfileData };

            // Remove fields that haven't changed or are empty
            Object.keys(updatedData).forEach((key) => {
                if (updatedData[key] === profile?.[key]) {
                    delete updatedData[key];
                }
            });

            // Check if there are any updates to send
            if (Object.keys(updatedData).length === 0) {
                return;
            }

            // Send a put request to update the user profile
            const response: AxiosResponse = await axios.put(
                `http://127.0.0.1:8000/api/user/profile/update/${profile?.id}/`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            // Reload the page to display the updated profile
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile', error);
        }
    };

    // Open/close the modal for account deletion
    const toggleDeleteAccountModal = () => {
        dispatch(setShowDeleteAccountModal(true));
    };

    // Cancel the account deletion and close the modal
    const cancelDeleteAccount = () => {
        dispatch(setShowDeleteAccountModal(false));
        dispatch(setDeleteAccountFormData({ ...deleteAccountFormData, email: '', password: '' }));
        dispatch(setErrorMessage(''));
    };

    // Function for account deletion
    const confirmDeleteAccount = async () => {
        try {
            // Verify the validity of access token
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token'); // Access the access token from the cookies

            // Send a delete request to the user API to delete the account
            await axios.delete('http://127.0.0.1:8000/api/user/delete', {
                data: deleteAccountFormData,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            // Navigate to homepage and reset states and cookies
            navigate('/');
            dispatch(resetAppStates());
            dispatch(resetAuthStates());
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            Cookies.remove('csrftoken');
            Cookies.remove('sessionid');
        } catch (error: any) {
            // Delete operation failed, handle the error
            console.error('Error deleting account', error);
            if (error.response && error.response.data && error.response.data.error) {
                dispatch(setErrorMessage(error.response.data.error));
            } else {
                dispatch(setErrorMessage('Failed to delete account. Please try again.'));
            }
        }
    };

    // Open/close the modal for email update
    const toggleUpdateEmailModal = () => {
        dispatch(setShowUpdateEmailModal(true));
    };

    // Cancel the email update and close the modal
    const cancelUpdateEmail = () => {
        dispatch(setShowUpdateEmailModal(false));
        dispatch(setDeleteAccountFormData({ ...deleteAccountFormData, email: '', password: '' }));
        dispatch(setUpdatedEmail(''));
        dispatch(setErrorMessage(''));
    };

    // Function for email update
    const confirmUpdateEmail = async (): Promise<void> => {
        try {
            dispatch(setLoading(true));
            // Verify the validity of access token
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token'); // Get access token from the cookies

            // Merge deleteAccountFormData with updated_email into a single object
            const requestData = {
                ...deleteAccountFormData,
                updated_email,
            };

            // Send a put request to the user API to update the email address
            const response = await axios.put(
                'http://127.0.0.1:8000/api/user/email-update',
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (response.status === 200) {
                // If the password update went through, log the user out
                await axios.post(
                    'http://127.0.0.1:8000/api/user/logout',
                    {},
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                // Reset form states
                dispatch(
                    setDeleteAccountFormData({ ...deleteAccountFormData, email: '', password: '' })
                );
                dispatch(setUpdatedEmail(''));
                dispatch(setShowUpdateEmailModal(false));
                dispatch(setUpdatedPassword(''));
                dispatch(setUpdatedPasswordConfirm(''));
                // Reset updated password
                dispatch(setShowUpdatePasswordModal(false));
                // Update states and remove tokens from cookies
                dispatch(logoutUser());
                dispatch(resetAppStates());
                dispatch(resetAuthStates());
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                Cookies.remove('csrftoken');
                Cookies.remove('sessionid');

                // Navigate to the login page
                navigate('/login');
            } else {
                // Error handling
                dispatch(
                    setErrorMessage(
                        'Error updating the email address. Please refresh the page and try again.'
                    )
                );
                dispatch(setLoading(false));
                return;
            }
        } catch (error: any) {
            // Error handling
            console.error('Error updating email: ', error);
            if (error.response && error.response.data && error.response.data.error) {
                dispatch(setErrorMessage(error.response.data.error));
                dispatch(setLoading(false));
                return;
            } else {
                // Error handling
                setErrorMessage('Failed to update email address. Please try again later.');
                dispatch(setLoading(false));
                return;
            }
        }
    };

    // Open/close modal for password update
    const toggleUpdatePasswordModal = () => {
        dispatch(setShowUpdatePasswordModal(true));
    };

    // Cancel password update and close modal
    const cancelUpdatePassword = () => {
        dispatch(setShowUpdatePasswordModal(false));
        dispatch(setDeleteAccountFormData({ ...deleteAccountFormData, email: '', password: '' }));
        dispatch(setUpdatedPassword(''));
        dispatch(setUpdatedPasswordConfirm(''));
        dispatch(setErrorMessage(''));
    };

    // Function for password update
    const confirmUpdatePassword = async (): Promise<void> => {
        try {
            dispatch(setLoading(true));
            // Verify the validity of access token
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token'); // Get access token from the cookies

            // Check if the password and confirmation entered match
            if (updated_password === updated_password_confirm) {
                const requestData = {
                    ...deleteAccountFormData,
                    updated_password,
                };

                // If it matches, send a PUT request to the user API to update password
                const response = await axios.put(
                    'http://127.0.0.1:8000/api/user/password-update',
                    requestData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                // If the request went through, log the user out
                if (response.status === 200) {
                    await axios.post(
                        'http://127.0.0.1:8000/api/user/logout',
                        {},
                        {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        }
                    );
                    // Reset states and cookies
                    dispatch(
                        setDeleteAccountFormData({
                            ...deleteAccountFormData,
                            email: '',
                            password: '',
                        })
                    );
                    dispatch(setUpdatedPassword(''));
                    dispatch(setUpdatedPasswordConfirm(''));
                    dispatch(setShowUpdatePasswordModal(false));
                    dispatch(logoutUser());
                    dispatch(resetAppStates());
                    dispatch(resetAuthStates());
                    Cookies.remove('access_token');
                    Cookies.remove('refresh_token');
                    Cookies.remove('csrftoken');
                    Cookies.remove('sessionid');
                    // Navigate to the login page
                    navigate('/login');
                } else {
                    console.error('Unexpected response:', response);
                    dispatch(setErrorMessage('Unexpected error. Please try again.'));
                    dispatch(setLoading(false));
                    return;
                }
            } else {
                // Error handling
                dispatch(setErrorMessage("New passwords don't match"));
                dispatch(setLoading(false));
                return;
            }
        } catch (error: any) {
            // Handle network errors and other exceptions
            console.error('Error updating the password:', error);
            if (error.response && error.response.data && error.response.data.error) {
                // If the backend sent an error message, display it to the user
                dispatch(setErrorMessage(error.response.data.error));
                dispatch(setLoading(false));
            } else {
                // Otherwise, show a generic error message
                dispatch(setErrorMessage('Failed to update password. Please try again later'));
                dispatch(setLoading(false));
            }
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-content">
                <div className="profile-title">
                    <h1>Profile</h1>
                </div>
                <Form>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        className="profile-input"
                        name="name"
                        value={formProfileData.name || ''}
                        onChange={handleProfileInputChange}
                    />
                    <Form.Label>NickName</Form.Label>
                    <Form.Control
                        type="text"
                        className="profile-input"
                        name="nickname"
                        value={formProfileData.nickname || ''}
                        onChange={handleProfileInputChange}
                    />
                    <Form.Label>Bio</Form.Label>
                    <div className="bio-input-wrapper">
                        <Form.Control
                            as="textarea"
                            rows={8}
                            className="profile-input"
                            name="bio"
                            value={formProfileData.bio || ''}
                            onChange={handleProfileInputChange}
                        />
                        <div className="emoji-toggle" onClick={toggleEmojiPicker}>
                            {ShowEmojiPicker ? <FaFaceSmileBeam /> : <FaRegFaceSmileBeam />}
                        </div>
                        <div className="emoji-picker-wrapper">
                            {ShowEmojiPicker && data && (
                                <Picker
                                    className="emoji-picker"
                                    data={data}
                                    onEmojiSelect={handleEmojiSelect}
                                />
                            )}
                        </div>
                    </div>
                    <div className="profile-buttons">
                        <Button variant="success" onClick={updateProfile}>
                            Save
                        </Button>
                    </div>
                </Form>
                <div className="danger-zone">
                    <h2>Danger Zone</h2>
                    <div className="danger-zone-content">
                        <div className="danger-section">
                            <div className="left-content">
                                <b>
                                    <p>Update Email</p>
                                </b>
                                <p>Update your email address.</p>
                            </div>
                            <div className="danger-button">
                                <Button variant="danger" onClick={toggleUpdateEmailModal}>
                                    Update Email
                                </Button>
                            </div>
                        </div>

                        {/* Update Email Modal */}
                        <Modal
                            show={showUpdateEmailModal}
                            onHide={() => dispatch(setShowUpdateEmailModal(false))}
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
                                    Are you sure you want to update your email address? You will
                                    have to login again.{' '}
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
                                    <Form.Group
                                        className="mb-3"
                                        controlId="exampleForm.ControlInput1"
                                    >
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            className="modal-input"
                                            autoFocus
                                            required
                                            value={deleteAccountFormData.email}
                                            onChange={(e) =>
                                                dispatch(
                                                    setDeleteAccountFormData({
                                                        ...deleteAccountFormData,
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
                                            value={deleteAccountFormData.password}
                                            onChange={(e) =>
                                                dispatch(
                                                    setDeleteAccountFormData({
                                                        ...deleteAccountFormData,
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
                                            onChange={(e) =>
                                                dispatch(setUpdatedEmail(e.target.value))
                                            }
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
                            </Modal.Body>
                        </Modal>

                        <div className="danger-section">
                            <div className="left-content">
                                <b>
                                    <p>Update Password</p>
                                </b>
                                <p>Update your password.</p>
                            </div>
                            <div className="danger-button">
                                <Button variant="danger" onClick={toggleUpdatePasswordModal}>
                                    Update Password
                                </Button>
                            </div>
                        </div>

                        {/* Update Password Modal */}
                        <Modal
                            show={showUpdatePasswordModal}
                            onHide={() => dispatch(setShowUpdatePasswordModal(false))}
                            backdrop="static"
                            style={{ borderRadius: '0.3rem' }}
                            centered
                        >
                            <Modal.Body
                                className="modal-body"
                                style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
                            >
                                <div className="modal-delete-text">
                                    Are you sure you want to update your password? You will have to
                                    login again.{' '}
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
                                    <Form.Group
                                        className="mb-3"
                                        controlId="exampleForm.ControlInput1"
                                    >
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            className="modal-input"
                                            autoFocus
                                            required
                                            value={deleteAccountFormData.email}
                                            onChange={(e) =>
                                                dispatch(
                                                    setDeleteAccountFormData({
                                                        ...deleteAccountFormData,
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
                                            value={deleteAccountFormData.password}
                                            onChange={(e) =>
                                                dispatch(
                                                    setDeleteAccountFormData({
                                                        ...deleteAccountFormData,
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
                                            onChange={(e) =>
                                                dispatch(setUpdatedPassword(e.target.value))
                                            }
                                        />
                                        <Form.Label>Confirm New Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            className="modal-input"
                                            required
                                            value={updated_password_confirm}
                                            onChange={(e) =>
                                                dispatch(setUpdatedPasswordConfirm(e.target.value))
                                            }
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
                            </Modal.Body>
                        </Modal>

                        <div className="danger-section">
                            <div className="left-content">
                                <b>
                                    <p>Delete Account</p>
                                </b>
                                <p>This action will delete your account permanently.</p>
                            </div>
                            <div className="danger-button">
                                <Button onClick={toggleDeleteAccountModal} variant="danger">
                                    Delete Account
                                </Button>
                            </div>
                        </div>

                        {/* Delete Account Modal */}
                        <Modal
                            show={showDeleteAccountModal}
                            onHide={() => dispatch(setShowDeleteAccountModal(false))}
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
                                    Are you sure you want to delete your account?{' '}
                                    <u style={{ color: '#b91919' }}>
                                        <span style={{ color: '#b91919' }}>
                                            There is no going back.
                                        </span>
                                    </u>
                                </div>
                                {errorMessage && (
                                    <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                                        {errorMessage}
                                    </div>
                                )}
                                <Form>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="exampleForm.ControlInput1"
                                    >
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            className="modal-input"
                                            autoFocus
                                            required
                                            value={deleteAccountFormData.email}
                                            onChange={(e) =>
                                                dispatch(
                                                    setDeleteAccountFormData({
                                                        ...deleteAccountFormData,
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
                                            value={deleteAccountFormData.password}
                                            onChange={(e) =>
                                                dispatch(
                                                    setDeleteAccountFormData({
                                                        ...deleteAccountFormData,
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
                            </Modal.Body>
                        </Modal>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
