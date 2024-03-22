import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  resetAuthStates,
  updateFormData,
  updateResetCode,
} from '../redux/reducers/authSlice';
import {
  updateLoading,
  updateErrorMessage,
  resetAppStates,
} from '../redux/reducers/appSlice';
import { RootState } from '../redux/store';

// Styling
import taskrize from '../images/taskrize.png';
import { spiral } from 'ldrs';

const ForgotPassword: React.FC = () => {
  // State management
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.auth.formData);
  const loading = useSelector((state: RootState) => state.app.loading);
  const errorMessage = useSelector(
    (state: RootState) => state.app.errorMessage,
  );

  // Reset Auth and App states to ensure a clean state on component mount
  useEffect(() => {
    dispatch(resetAppStates()); // Reset app loading, message and error message states
    dispatch(resetAuthStates()); // Reset authentication form data and showPassword states
  }, []);

  const navigate = useNavigate();

  // Loading icon
  spiral.register();

  // Handle input change event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    dispatch(updateFormData(updatedFormData));
  };

  // Handle form submission for email input
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(updateLoading(true)); // Update loading state while waiting for API response
    try {
      // Make API call to initiate reset process
      const response = await axios.post(
        'http://127.0.0.1:8000/api/reset-password',
        { email: formData.email },
      );
      const { user_id, reset_code } = response.data;
      dispatch(updateResetCode(reset_code)); // Update resetCode state
      // Navigation to the Reset Password page with user ID and reset code
      navigate(`/resetpassword/${user_id}/${reset_code}`);
    } catch (error: any) {
      dispatch(updateErrorMessage('Email not found.'));
    } finally {
      dispatch(updateLoading(false)); // Update loading state after password reset attempt
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
          Reset your password
        </p>
        {loading ? (
          <div className="text-center mt-5 mb-5">
            <l-spiral size="30" color="coral"></l-spiral>
          </div>
        ) : (
          ''
        )}
        <form onSubmit={handleEmailSubmit} className="col-md-6 mx-auto">
          {errorMessage && (
            <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
              {errorMessage}
            </div>
          )}
          <div className="mb-2">
            <input
              className="form-control"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@example.com"
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
};

export default ForgotPassword;
