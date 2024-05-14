import React, { useEffect } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
    loginUser,
    resetAuthStates,
    setAuthFormData,
    setShowPassword,
} from '../redux/reducers/authSlice';
import {
    setLoading,
    setErrorMessage,
    resetAppStates,
} from '../redux/reducers/appSlice';
import { RootState } from '../redux/store';

// Styling
import 'bootstrap/dist/css/bootstrap.min.css';
import './Auth.css';
import taskrize from '../images/taskrize.png';
import { Form } from 'react-bootstrap';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { spiral } from 'ldrs';
import Cookies from 'js-cookie';

// Loading icon
spiral.register();

const LoginPage: React.FC = () => {
    // State management
    const dispatch = useDispatch();
    const formData = useSelector((state: RootState) => state.auth.authFormData);
    const loading: boolean = useSelector(
        (state: RootState) => state.app.loading,
    );
    const errorMessage: string = useSelector(
        (state: RootState) => state.app.errorMessage,
    );
    const showPassword: boolean = useSelector(
        (state: RootState) => state.auth.showPassword,
    );

    let navigate = useNavigate();

    // Configure Axios to handle cookies
    axios.defaults.withCredentials = true;

    // Reset Auth and App states to ensure a clean state on component mount
    useEffect(() => {
        dispatch(resetAppStates());
        dispatch(resetAuthStates());
    }, [dispatch]);

    // Handle input change event
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData, [name]: value };
        dispatch(setAuthFormData(updatedFormData));
    };

    // Handle the password visibility event
    const togglePasswordVisibility = (): void => {
        dispatch(setShowPassword());
    };

    // Handle form submission for login
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault();
        dispatch(setLoading(true)); // Update loading state to indicate request in progress

        try {
            // Send login request to the backend API
            const response: AxiosResponse = await axios.post(
                'https://taskrize-2e3dd97a0d3e.herokuapp.com/api/user/login',
                formData,
            );

            if (response.status >= 200 && response.status < 300) {
                // Login successful
                // Extract the access and refresh tokens from the response
                const { user_id, access_token, refresh_token } = response.data;

                // Set access and refresh tokens as cookies
                Cookies.set('access_token', access_token);
                Cookies.set('refresh_token', refresh_token);

                // Update states
                dispatch(loginUser(user_id));
                dispatch(resetAuthStates());
                // Redirect to Home
                navigate('/home');
            } else {
                console.error('Login failed:', response.status, response.data);
                // Handle unexpected response status
                handleServerError(
                    'An unexpected error occurred. Please try again later.',
                );
            }
        } catch (error: any) {
            // Handle errors from the login request
            handleRequestError(error);
        } finally {
            // Update loading state after login attempt
            dispatch(setLoading(false));
        }
    };

    // Handle errors from the login request
    const handleRequestError = (error: AxiosError): void => {
        if (error.response) {
            // Server responded with an error message
            if (
                error.response.status === 401 ||
                error.response.status === 400
            ) {
                // Incorrect email/password error
                dispatch(
                    setErrorMessage('Invalid credentials. Please try again.'),
                );
            } else {
                // Other error from the server
                dispatch(
                    setErrorMessage(
                        'An error occurred during login. Please try again.',
                    ),
                );
            }
        } else {
            // Network error or other unexpected error
            dispatch(
                setErrorMessage(
                    'An unexpected error occurred. Please try again later.',
                ),
            );
        }
    };

    // Handle server errors
    const handleServerError = (message: string): void => {
        dispatch(setErrorMessage(message));
    };

    return (
        <div className="viewport-centered">
            <div className="container w-50 auth-shadow px-0 m-0">
                <img
                    className="d-block mx-auto mb-3 mt-3"
                    src={taskrize}
                    alt="TaskRize logo"
                    style={{ height: '60px', width: '150px' }}
                />
                <p
                    className="text-center mt-3 mb-4"
                    style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                >
                    Log in to continue
                </p>
                {loading ? (
                    <div className="text-center mt-5 mb-5">
                        <l-spiral size="30" color="teal"></l-spiral>
                    </div>
                ) : (
                    ''
                )}
                <form onSubmit={handleSubmit} className="col-md-6 mx-auto">
                    {errorMessage && (
                        <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
                            {errorMessage}
                        </div>
                    )}
                    <div className="mb-2">
                        <input
                            className="form-control"
                            id="emailInput"
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Form.Group>
                        <div className="position-relative mb-2">
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
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

                    <button type="submit" className="btn btn-primary w-100">
                        Login
                    </button>
                    <div className="d-flex justify-content-center mt-1 mb-5">
                        <div className="d-flex justify-content">
                            <Link to={'/signup'} className="me-3">
                                Create an account
                            </Link>
                            <Link to={'/forgotpassword'}>Can't log in?</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
