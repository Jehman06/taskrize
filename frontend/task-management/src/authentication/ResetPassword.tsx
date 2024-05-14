import React, { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
    resetAuthStates,
    setAuthFormData,
    setResetCode,
    setShowPassword,
    setStage,
} from '../redux/reducers/authSlice';
import {
    setLoading,
    setMessage,
    setErrorMessage,
    resetAppStates,
} from '../redux/reducers/appSlice';
import { RootState } from '../redux/store';

// Styling
import { Form } from 'react-bootstrap';
import taskrize from '../images/taskrize.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Auth.css';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { spiral } from 'ldrs';

const ResetPassword: React.FC = () => {
    // State management
    const dispatch = useDispatch();

    const formData = useSelector((state: RootState) => state.auth.authFormData);

    const confirmPassword: string = useSelector(
        (state: RootState) => state.auth.authFormData.password_confirmation,
    );

    const resetCode: string = useSelector(
        (state: RootState) => state.auth.resetCode || '',
    );

    const loading: boolean = useSelector(
        (state: RootState) => state.app.loading,
    );
    const message: string = useSelector(
        (state: RootState) => state.app.message,
    );
    const stage: string = useSelector((state: RootState) => state.auth.stage);
    const errorMessage: string = useSelector(
        (state: RootState) => state.app.errorMessage,
    );

    const showPassword: boolean = useSelector(
        (state: RootState) => state.auth.showPassword,
    );

    // Loading icon
    spiral.register();

    // Reset Auth, App and resetCode states to ensure a clean state on component mount
    useEffect(() => {
        dispatch(resetAppStates(), resetAuthStates());
        dispatch(setResetCode(''));
    }, [dispatch]);

    // Extract params from the api endpoint
    const { reset_code, user_id } = useParams<{
        reset_code: string;
        user_id: string;
    }>();

    const navigate = useNavigate();

    // Handle input change event
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        if (name === 'password') {
            dispatch(setAuthFormData({ ...formData, password: value }));
        } else if (name === 'password_confirmation') {
            dispatch(
                setAuthFormData({ ...formData, password_confirmation: value }),
            );
        }
    };

    // Handle submission of the reset code form
    const handleResetCodeSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault();
        try {
            if (resetCode !== reset_code) {
                dispatch(setErrorMessage('Reset codes do not match.'));
                return;
            } else {
                dispatch(setErrorMessage(''));
                dispatch(setResetCode('')); // Clear the reset code after submission
                dispatch(setStage('reset'));
            }
        } catch (error: any) {
            dispatch(
                setErrorMessage('An error occurred. Please try again later.'),
            );
        }
    };

    const togglePasswordVisibility = (): void => {
        dispatch(setShowPassword());
    };

    // Handle submission of the password confirmation form
    const handlePasswordSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault();
        dispatch(setErrorMessage(''));
        if (formData.password !== confirmPassword) {
            dispatch(setErrorMessage("Passwords don't match."));
            return;
        }
        dispatch(setLoading(true));
        try {
            const response = await axios.post(
                `https://taskrize-2e3dd97a0d3e.herokuapp.com/api/user/reset-password-confirm/${user_id}`,
                {
                    new_password: formData.password,
                },
            );
            // Check if the response was successful
            if (response.status === 200) {
                dispatch(setErrorMessage(''));
                dispatch(setMessage('Redirecting to Login page.'));
                dispatch(setStage('complete'));

                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                // Handle unexpected response status
                dispatch(
                    setErrorMessage(
                        'An unexpected error occurred. Please try again later.',
                    ),
                );
            }
        } catch (error: any) {
            // Handle specific types of errors
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with an error message
                    const errorMessage =
                        error.response.data?.message ||
                        'An error occurred. Please try to login.';
                    dispatch(setErrorMessage(errorMessage));
                } else if (error.request) {
                    // The request was made but no response was received
                    dispatch(
                        setErrorMessage(
                            'No response received from the server. Please try again later.',
                        ),
                    );
                } else {
                    // Something happened in setting up the request that triggered an error
                    dispatch(
                        setErrorMessage(
                            'An unexpected error occurred. Please try again later.',
                        ),
                    );
                }
            } else {
                // Handle other types of errors
                dispatch(
                    setErrorMessage(
                        'An unexpected error occurred. Please try again later.',
                    ),
                );
            }
        } finally {
            dispatch(setLoading(false));
        }
    };

    // Renders based on `stage` state
    const renderForm = () => {
        switch (stage) {
            case 'resetCode':
                return (
                    <div className="viewport-centered">
                        <div className="container w-50 auth-shadow p-0 m-0">
                            <img
                                className="d-block mx-auto mb-3 mt-3"
                                src={taskrize}
                                alt="TaskRize logo"
                                style={{ height: '60px', width: '150px' }}
                            />
                            <p
                                className="text-center mt-3 mb-4"
                                style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                Enter the verification code
                            </p>
                            <form
                                onSubmit={handleResetCodeSubmit}
                                className="col-md-6 mx-auto"
                            >
                                {errorMessage && (
                                    <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                                        {errorMessage}
                                    </div>
                                )}
                                {message && (
                                    <div className="p-1 text-success bg-success-subtle border border-success rounded-3 w-100 mb-2">
                                        {message}
                                    </div>
                                )}
                                <div className="mb-2">
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={resetCode}
                                        onChange={e =>
                                            dispatch(
                                                setResetCode(e.target.value),
                                            )
                                        }
                                        required
                                        placeholder="Reset Code"
                                        autoComplete="off"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mb-1"
                                >
                                    Submit
                                </button>
                                <div className="d-flex justify-content-center mt-1 mb-5">
                                    <Link to={'/'} className="me-3">
                                        Home
                                    </Link>

                                    <Link to={'/login'}>Login</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case 'reset':
                return (
                    <div className="viewport-centered">
                        <div className="container w-50 auth-shadow p-0 m-0">
                            <img
                                className="d-block mx-auto mb-3 mt-3"
                                src={taskrize}
                                alt="TaskRize logo"
                                style={{ height: '60px', width: '150px' }}
                            />
                            <p
                                className="text-center mt-3 mb-4"
                                style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                Reset your password
                            </p>
                            {loading ? (
                                <div className="text-center mt-5 mb-5">
                                    <l-spiral size="30" color="teal"></l-spiral>
                                </div>
                            ) : (
                                ''
                            )}
                            <form
                                onSubmit={handlePasswordSubmit}
                                className="col-md-6 mx-auto"
                            >
                                {errorMessage && (
                                    <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                                        {errorMessage}
                                    </div>
                                )}
                                {message && (
                                    <div className="p-1 text-success bg-success-subtle border border-success rounded-3 w-100 mb-2">
                                        {message}
                                    </div>
                                )}
                                <Form.Group>
                                    <div className="position-relative mb-2">
                                        <Form.Control
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <div
                                            className="position-absolute top-50 translate-middle-y"
                                            style={{
                                                cursor: 'pointer',
                                                right: '15px',
                                                fontSize: '1.5em',
                                            }}
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? (
                                                <FaRegEye />
                                            ) : (
                                                <FaRegEyeSlash />
                                            )}
                                        </div>
                                    </div>
                                </Form.Group>
                                <div className="mb-2">
                                    <input
                                        className="form-control"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        required
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                >
                                    Submit
                                </button>
                                <div className="d-flex justify-content-center mt-1 mb-5">
                                    <Link to={'/'} className="me-3">
                                        Home
                                    </Link>

                                    <Link to={'/login'}>Login</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case 'complete':
                return (
                    <div className="viewport-centered">
                        <div className="container w-50 auth-shadow p-0 m-0">
                            <img
                                className="d-block mx-auto mb-3 mt-3"
                                src={taskrize}
                                alt="TaskRize logo"
                                style={{ height: '60px', width: '150px' }}
                            />
                            <div className="p-1 text-success bg-success-subtle border border-success rounded-3 w-100 mb-2 text-center">
                                {message}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return <div>{renderForm()}</div>;
};

export default ResetPassword;
