import React, { useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetAuthStates,
  updateFormData,
  updateResetCode,
  updateStage,
} from '../redux/reducers/authSlice';
import {
  updateLoading,
  updateMessage,
  updateErrorMessage,
  resetAppStates,
} from '../redux/reducers/appSlice';
import { RootState } from '../redux/store';
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
          <div className="container w-50">
            <form onSubmit={handleResetCodeSubmit} className="col-md-6 mx-auto">
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
              <button type="submit" className="btn btn-primary w-100">
                Submit
              </button>
            </form>
          </div>
        );
      case 'reset':
        return (
          <div className="container w-50">
            {loading ? (
              <div className="text-center mt-5 mb-5">
                <l-spiral size="30" color="teal"></l-spiral>
              </div>
            ) : (
              ''
            )}
            <form onSubmit={handlePasswordSubmit} className="col-md-6 mx-auto">
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
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter new password"
                />
              </div>
              <div className="mb-2">
                <input
                  className="form-control"
                  type="password"
                  name="password_confirmation" // Set name attribute to identify the field
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Submit
              </button>
            </form>
          </div>
        );
      case 'complete':
        return (
          <div className="container w-50">
            <div className="p-1 text-success bg-success-subtle border border-success rounded-3 w-100 mb-2">
              {message}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-center mt-5 mb-5">Reset Password</h1>
      {renderForm()}
    </div>
  );
};

export default ResetPassword;
