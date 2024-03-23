import React, { useEffect } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  resetAuthStates,
  updateFormData,
  updateShowPassword,
} from '../redux/reducers/authSlice';
import {
  updateLoading,
  updateErrorMessage,
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

// Define types for formData
interface formData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  // State management
  const dispatch = useDispatch();
  const formData: formData = useSelector(
    (state: RootState) => state.auth.formData,
  );
  const loading: boolean = useSelector((state: RootState) => state.app.loading);
  const errorMessage: string = useSelector(
    (state: RootState) => state.app.errorMessage,
  );
  const showPassword: boolean = useSelector(
    (state: RootState) => state.auth.showPassword,
  );

  let navigate = useNavigate();

  // Loading icon
  spiral.register();

  // Reset Auth and App states to ensure a clean state on component mount
  useEffect(() => {
    dispatch(resetAppStates());
    dispatch(resetAuthStates());
  }, []);

  // Handle input change event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const updatedFormData: formData = { ...formData, [name]: value };
    dispatch(updateFormData(updatedFormData));
  };

  const togglePasswordVisibility = (): void => {
    dispatch(updateShowPassword());
  };

  // Handle form submission for login
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    dispatch(updateLoading(true)); // Update loading state to indicate request in progress
    try {
      // Send login request to the backend API
      const response: AxiosResponse = await axios.post(
        'http://127.0.0.1:8000/api/login',
        formData,
      );
      if (response.status === 200) {
        // Login successful
        const userData = response.data; // Extract user data from the response
        dispatch(loginUser({ user: userData }));
        navigate('/home'); // Redirect user after successful login
      } else {
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
      dispatch(updateLoading(false));
    }
  };

  // Handle errors from the login request
  const handleRequestError = (error: AxiosError): void => {
    if (error.response) {
      // Server responded with an error message
      if (error.response.status === 401 || error.response.status === 400) {
        // Incorrect email/password error
        dispatch(updateErrorMessage('Invalid credentials. Please try again.'));
      } else {
        // Other error from the server
        dispatch(
          updateErrorMessage(
            'An error occurred during login. Please try again.',
          ),
        );
      }
    } else {
      // Network error or other unexpected error
      dispatch(
        updateErrorMessage(
          'An unexpected error occurred. Please try again later.',
        ),
      );
    }
  };

  // Handle server errors
  const handleServerError = (message: string): void => {
    dispatch(updateErrorMessage(message));
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
                style={{ cursor: 'pointer', right: '15px', fontSize: '1.5em' }}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
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
