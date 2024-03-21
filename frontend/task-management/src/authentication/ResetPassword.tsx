import React, { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetAuthStates,
  updateFormData,
  updateResetCode,
  updateShowPassword,
  updateStage,
} from '../redux/reducers/authSlice';
import {
  updateLoading,
  updateMessage,
  updateErrorMessage,
  resetAppStates,
} from '../redux/reducers/appSlice';
import { RootState } from '../redux/store';
import { Form } from 'react-bootstrap';
import taskrize from '../images/taskrize.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Auth.css';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { spiral } from 'ldrs';

const ResetPassword: React.FC = () => {
  // Loader
  spiral.register();

  // State management
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.auth.formData);
  const confirmPassword = useSelector(
    (state: RootState) => state.auth.formData.password_confirmation,
  );
  const resetCode = useSelector(
    (state: RootState) => state.auth.resetCode || '',
  );
  const loading = useSelector((state: RootState) => state.app.loading);
  const message = useSelector((state: RootState) => state.app.message);
  const stage = useSelector((state: RootState) => state.auth.stage);
  const errorMessage = useSelector(
    (state: RootState) => state.app.errorMessage,
  );
  const showPassword = useSelector(
    (state: RootState) => state.auth.showPassword,
  );

  // Set initial state
  useEffect(() => {
    dispatch(resetAppStates());
    dispatch(resetAuthStates());
    dispatch(updateResetCode(''));
  }, []);

  // Params
  const { user_id, reset_code } = useParams<{
    user_id: string;
    reset_code: string;
  }>();

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name == 'password') {
      dispatch(updateFormData({ ...formData, password: value }));
    } else if (name == 'password_confirmation') {
      dispatch(updateFormData({ ...formData, password_confirmation: value }));
    }
  };

  const handleResetCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('resetCode', resetCode);
    console.log('reset_code', reset_code);
    try {
      if (resetCode !== reset_code) {
        // If reset codes don't match, set error message and prevent further action
        dispatch(updateErrorMessage('Reset codes do not match.'));
        return;
      }
      // If reset codes match, proceed to the password reset stage
      dispatch(updateStage('reset'));
      dispatch(updateErrorMessage(''));
    } catch (error: any) {
      dispatch(
        updateErrorMessage('An error occurred. Please try again later.'),
      );
    }
  };

  const togglePasswordVisibility = () => {
    dispatch(updateShowPassword());
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(updateErrorMessage(''));

    // Check if passwords match
    if (formData.password !== confirmPassword) {
      dispatch(updateErrorMessage("Passwords don't match."));
      return;
    } else if (formData.password == confirmPassword) {
      dispatch(updateErrorMessage(''));
    }

    dispatch(updateLoading(true));

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/reset-password-confirm/${user_id}`,
        {
          new_password: formData.password,
        },
      );
      dispatch(updateLoading(false));
      dispatch(
        updateMessage('Your password has been reset. Redirecting to login'),
      );
      dispatch(updateStage('complete'));

      // Redirects to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      dispatch(updateLoading(false));
      dispatch(updateErrorMessage('An error occurred. Please try to login.'));
    }
  };

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
                style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
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
                    onChange={(e) => dispatch(updateResetCode(e.target.value))}
                    required
                    placeholder="Reset Code"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-1">
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
                style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
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
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    placeholder="Confirm new password"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
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
              <div className="p-1 text-success bg-success-subtle border border-success rounded-3 w-100 mb-2">
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
