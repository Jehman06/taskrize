import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  let navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/login',
        formData,
      );
      if (response.status === 200) {
        // Login successful
        console.log('Login successful:', response.data);
        // Clear any previous error messages
        setErrorMessage('');
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
      console.error('Error logging in:', error);
      if (error.response) {
        // Server responded with an error message
        if (error.response.status === 401 || error.response.status === 400) {
          // Incorrect email/password error
          setErrorMessage('Invalid credentials. Please try again.');
          console.log(errorMessage);
        } else {
          // Other error from the server
          setErrorMessage(
            error.response.data.error ||
              'An error occurred during login. Please try again.',
          );
          console.log(errorMessage);
        }
      } else {
        // Network error or other unexpected error
        setErrorMessage(
          'An unexpected error occurred. Please try again later.',
        );
        console.log(errorMessage);
      }
    }
  };

  return (
    <div className="container w-50">
      <h1 className="text-center mt-5 mb-5">Login</h1>
      <form onSubmit={handleSubmit} className="col-md-6 mx-auto">
        {errorMessage && (
          <div className="p-1 text-danger bg-danger-subtle border border-danger rounded-3 w-100">
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
        <div className="d-flex justify-content-center mt-3">
          <div className="d-flex justify-content-between">
            <Link to={'/signup'} className="me-3">
              Create an account
            </Link>
            <Link to={'/resetpassword'}>Can't log in?</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
