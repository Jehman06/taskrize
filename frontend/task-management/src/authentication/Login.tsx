import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

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
      // Login successful
      if (response.status == 200) {
        // Clear any previous error messages
        setErrorMessage('');
        console.log('Login Successful! YAY!');
        // TODO: Redirect to homepage
      } else {
        // Unexpected response status
        console.error('Unexpected response status:', response.status);
        setErrorMessage('Email or password incorrect');
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      if (error.response) {
        setErrorMessage(
          error.response.data.error ||
            'An error occurred during login. Try again.',
        );
        console.log(errorMessage);
      } else {
        // Network error or other unexpected error
        setErrorMessage('An unexpected error occurred. Try again later.');
        console.log(errorMessage);
      }
    }
  };

  return (
    <div className="container">
      <h1 className="text-center mt-5 mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="col-md-6 mx-auto">
        <div className="mb-3">
          <label htmlFor="emailInput" className="form-label">
            Email address
          </label>
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

        <div className="mb-3">
          <label htmlFor="passwordInput" className="form-label">
            Password
          </label>
          <input
            className="form-control"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            aria-describedby="passwordHelpBlock"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
