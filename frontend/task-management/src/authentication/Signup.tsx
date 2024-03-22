import React, { useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateConfirmPassword,
  updateFormData,
  resetAuthStates,
  updateShowPassword,
} from '../redux/reducers/authSlice';
import {
  updateErrorMessage,
  updateLoading,
  resetAppStates,
} from '../redux/reducers/appSlice';
import { RootState } from '../redux/store';

// Styling
import 'bootstrap/dist/css/bootstrap.min.css';
import './Auth.css';
import taskrize from '../images/taskrize.png';
import { Form } from 'react-bootstrap';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

const SignupPage: React.FC = () => {
  // State management
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.auth.formData);
  const confirmPassword = useSelector(
    (state: RootState) => state.auth.formData.password_confirmation,
  );
  const errorMessage = useSelector(
    (state: RootState) => state.app.errorMessage,
  );
  const loading = useSelector((state: RootState) => state.app.loading);
  const showPassword = useSelector(
    (state: RootState) => state.auth.showPassword,
  );

  const navigate = useNavigate();

  // Reset Auth and App states to ensure a clean state on component mount
  useEffect(() => {
    dispatch(resetAppStates());
    dispatch(resetAuthStates());
  }, []);

  // Handle input change event for form data
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    dispatch(updateFormData(updatedFormData));
  };

  // Handle input change event for confirm password
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    dispatch(updateConfirmPassword(e.target.value));
  };

  const togglePasswordVisibility = () => {
    dispatch(updateShowPassword());
  };

  // Handle form submission for sign up process
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      dispatch(updateErrorMessage("Passwords don't match."));
      return;
    }

    dispatch(updateLoading(true)); // Update loading state to indicate request in progress
    try {
      await axios.post('http://127.0.0.1:8000/api/register', formData);
      dispatch(updateErrorMessage(''));
      dispatch(updateLoading(false));
      navigate('/login'); // Redirect user to the login page
    } catch (error: any) {
      console.error('Error registering user:', error);
      dispatch(
        updateErrorMessage(
          (error as AxiosError<any>)?.response?.data?.error ||
            'An error occurred during registration.',
        ),
        dispatch(updateLoading(false)),
      );
    }
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
          Sign up to continue
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
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
          </Form.Group>

          <div className="mb-2">
            <input
              className="form-control"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              aria-describedby="passwordHelpBlock"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-1">
            Signup
          </button>
          <div className="d-flex justify-content-center mt-1 mb-5">
            <Link to="/login">Already have an account? Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
