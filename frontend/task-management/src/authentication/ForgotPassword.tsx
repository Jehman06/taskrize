import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetCode, setResetCode] = useState('');

  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/reset-password',
        { email },
      );
      const { user_id, reset_code } = response.data;
      console.log('Response data: ', response.data);
      setResetCode(response.data.reset_code);
      setMessage('Check your inbox for the reset code.');
      navigate(`/resetpassword/${user_id}/${reset_code}`);
    } catch (error: any) {
      setMessage('Email was not found.');
    }
  };

  return (
    <div className="container w-50">
      <h1 className="text-center mt-5 mb-5">Reset Password</h1>
      <form onSubmit={handleEmailSubmit} className="col-md-6 mx-auto">
        {message && (
          <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100 mb-2">
            {message}
          </div>
        )}
        <div className="mb-2">
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
