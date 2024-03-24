import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/reducers/authSlice';
import taskrize from '../images/taskrize.png';
import { SlMagnifier } from 'react-icons/sl';
import { MdAccountCircle } from 'react-icons/md';
import './PrivateNavbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';

const PrivateNavbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async (): Promise<void> => {
    try {
      await axios.post('http://127.0.0.1:8000/api/logout');
      dispatch(logoutUser());
      navigate('/');
    } catch (error: any) {
      console.error('Error encountered when logging out. Please try again.');
    }
  };

  return (
    <nav className="navbar private-navbar justify-content-between align-items-center">
      {/* Left-aligned section */}
      <div className="d-flex align-items-center">
        <img src={taskrize} alt="logo" className="mr-3 private-logo" />
        <div className="dropdown recent">
          <button
            className="dropdown-btn dropdown-toggle"
            type="button"
            id="dropdownMenuButton1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Recent
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            <li>
              <a className="dropdown-item" href="#">
                Board 1
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Board 2
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Board 3
              </a>
            </li>
          </ul>
        </div>
        <div className="dropdown favorites">
          <button
            className="dropdown-btn dropdown-toggle"
            type="button"
            id="dropdownMenuButton2"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Favorites
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton2">
            <li>
              <a className="dropdown-item" href="#">
                Favorite 1
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Favorite 2
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Favorite 3
              </a>
            </li>
          </ul>
        </div>
        <button className="create-button">Create</button>
      </div>

      {/* Right-aligned section */}
      <div className="d-flex align-items-center">
        <div className="search-container mr-3">
          <div className="search-icon-container">
            <SlMagnifier className="magnifier" />
          </div>
          <input className="search" placeholder="Search" />
        </div>
        <div className="dropdown profile">
          <button
            className="dropdown-btn dropdown-profile dropdown-toggle no-arrow"
            type="button"
            id="dropdownMenuButton3"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <MdAccountCircle className="account-icon" />
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="dropdownMenuButton3"
          >
            <li>
              <a className="dropdown-item" href="#">
                Profile
              </a>
            </li>
            <li>
              <a
                className="dropdown-item profile-dropdown-item"
                onClick={handleLogout}
              >
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default PrivateNavbar;
