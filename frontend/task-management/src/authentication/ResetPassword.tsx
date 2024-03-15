import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stage, setStage] = useState<'resetCode' | 'reset' | 'complete'>(
    'resetCode',
  );

  const { user_id, reset_code } = useParams<{
    user_id: string;
    reset_code: string;
  }>();

  const navigate = useNavigate();

  const handleResetCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (resetCode !== reset_code) {
        // If reset codes don't match, set error message and prevent further action
        setErrorMessage('Reset codes do not match.');
        return;
      }
      // If reset codes match, proceed to the password reset stage
      setMessage('');
      setErrorMessage('');
      setStage('reset');
    } catch (error: any) {
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/reset-password-confirm/${user_id}`,
        {
          new_password: password,
        },
      );
      setMessage('Your password has been reset. Redirecting to login');
      setStage('complete');

      // Redirects to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setErrorMessage('An error occurred. Please try again later.');
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
                  type="reset_code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                />
              </div>
              <div className="mb-2">
                <input
                  className="form-control"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
