// React
import React, { useState } from 'react';
// Axios
import axios from 'axios';
// Redux Toolkit
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, updateFormData, updateLoading } from '../redux/reducers/authSlice';
import {RootState} from '../redux/store';
// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage: React.FC = () => {
  // State management
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.auth.formData);
  const loading = useSelector((state: RootState) => state.auth.loading);

  const [errorMessage, setErrorMessage] = useState('');

  let navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value};
    dispatch(updateFormData(updatedFormData));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(updateLoading(true));
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/login',
        formData,
      );
      if (response.status === 200) {
        // Login successful
        setErrorMessage(''); // Clear any previous error messages
        dispatch(loginUser({user: formData}));
        navigate('/home');
      } else {
        // Unexpected response status
        console.error('Unexpected response status:', response.status);
        setErrorMessage(
          'An unexpected error occurred. Please try again later.',
        );
      }
    } catch (error: any) {
      // Request failed or response status is not 200
      if (error.response) {
        // Server responded with an error message
        if (error.response.status === 401 || error.response.status === 400) {
          // Incorrect email/password error
          setErrorMessage('Invalid credentials. Please try again.');
          dispatch(updateLoading(false));
        } else {
          // Other error from the server
          setErrorMessage(
            error.response.data.error ||
              'An error occurred during login. Please try again.',
          );
        }
      } else {
        // Network error or other unexpected error
        setErrorMessage(
          'An unexpected error occurred. Please try again later.',
        );
      }
    }
  };

  return (
    <div className="container w-50">
      <h1 className="text-center mt-5 mb-5">Login</h1>
      {loading ? 'LOADING' : ''} 
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

        <div className="mb-2">
          <input
            className="form-control"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            aria-describedby="passwordHelpBlock"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
        <div className="d-flex justify-content-center mt-1">
          <div className="d-flex justify-content-between">
            <Link to={'/signup'} className="me-3">
              Create an account
            </Link>
            <Link to={'/forgotpassword'}>Can't log in?</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
