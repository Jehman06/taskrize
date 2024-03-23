import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import taskrize from '../images/taskrize.png';
import { SlMagnifier } from 'react-icons/sl';
import { MdAccountCircle } from 'react-icons/md';
import './PrivateNavbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const PrivateNavbar: React.FC = () => {
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
        <MdAccountCircle className="account-icon" />
      </div>
    </nav>
  );
};

export default PrivateNavbar;
