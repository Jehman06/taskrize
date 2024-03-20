import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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

import { spiral } from 'ldrs';

const ForgotPassword: React.FC = () => {
  // State management
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.auth.formData);
  const loading = useSelector((state: RootState) => state.app.loading);
  const errorMessage = useSelector(
    (state: RootState) => state.app.errorMessage,
  );

  // Reset states
  useEffect(() => {
    dispatch(resetAppStates());
    dispatch(resetAuthStates());
  }, []);

  const navigate = useNavigate();

  spiral.register();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    dispatch(updateFormData(updatedFormData));
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Update loading state
    dispatch(updateLoading(true));
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/reset-password',
        { email: formData.email },
      );
      const { user_id, reset_code } = response.data;
      // Update resetCode state
      dispatch(updateResetCode(reset_code));
      // Navigation to the Reset Password page
      navigate(`/resetpassword/${user_id}/${reset_code}`);
    } catch (error: any) {
      dispatch(updateErrorMessage('Email not found.'));
    } finally {
      // Update loading state after password reset attempt
      dispatch(updateLoading(false));
    }
  };

  return (
    <div className="container w-50">
      <h1 className="text-center mt-5 mb-5">Reset Password</h1>
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
        <div className="d-flex justify-content-center mt-1">
          <div className="d-flex justify-content-between">
            <Link to={'/'} className="me-3">
              Home
            </Link>

            <Link to={'/login'}>Login</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
