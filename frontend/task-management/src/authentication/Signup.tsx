import React from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateConfirmPassword,
  updateFormData,
} from '../redux/reducers/authSlice';
import { updateErrorMessage, updateLoading } from '../redux/reducers/appSlice';
import { RootState } from '../redux/store';
import 'bootstrap/dist/css/bootstrap.min.css';

const SignupPage: React.FC = () => {
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.auth.formData);
  const confirmPassword = useSelector(
    (state: RootState) => state.auth.formData.password_confirmation,
  );
  const errorMessage = useSelector(
    (state: RootState) => state.app.errorMessage,
  );
  const loading = useSelector((state: RootState) => state.app.loading);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    dispatch(updateFormData(updatedFormData));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    dispatch(updateConfirmPassword(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Password:', formData.password);
    console.log('Confirm Password:', confirmPassword);
    if (formData.password !== confirmPassword) {
      dispatch(updateErrorMessage("Passwords don't match."));
      return;
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/register', formData);
      dispatch(updateErrorMessage(''));
      navigate('/login');
    } catch (error: any) {
      console.error('Error registering user:', error);
      dispatch(
        updateErrorMessage(
          (error as AxiosError<any>)?.response?.data?.error ||
            'An error occurred during registration.',
        ),
      );
    }
  };

  return (
    <div className="container w-50">
      <h1 className="text-center mt-5 mb-5">Signup</h1>
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

        <div className="mb-2">
          <input
            className="form-control"
            type="password"
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
        <div className="d-flex justify-content-center mt-1">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
