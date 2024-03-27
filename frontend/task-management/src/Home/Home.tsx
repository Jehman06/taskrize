import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import PrivateNavbar from '../Navbar/PrivateNavbar';
import { spiral } from 'ldrs';
import { resetAppStates } from '../redux/reducers/appSlice';
import './Home.css';
import { FaRegClock } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa';
import placeholder from '../images/placeholder.png';

const Home: React.FC = () => {
    // Access the authenticated user's data from the Redux store
    const dispatch = useDispatch();

    spiral.register();

    const [selectedItem, setSelectedItem] = useState(null);
    const [starFilled, setStarFilled] = useState(false);

    const handleItemClick = (item: any) => {
        setSelectedItem(item);
    };

    const toggleStar = () => {
        setStarFilled((prevStarFilled) => !prevStarFilled);
    };

    // Reset app states, especially loading
    useEffect(() => {
        dispatch(resetAppStates());
    });

    return (
        <div className="home">
            <PrivateNavbar />
            <div className="home-container">
                <div className="container home-sidebar">
                    <p
                        className={selectedItem === 'board' ? 'selected' : ''}
                        onClick={() => handleItemClick('board')}
                    >
                        Boards
                    </p>
                    <p
                        className={selectedItem === 'templates' ? 'selected' : ''}
                        onClick={() => handleItemClick('templates')}
                    >
                        Templates
                    </p>
                </div>

                {/* BOARDS */}
                <div className="container home-content">
                    <div className="board-content-title">
                        <p>
                            <FaRegClock /> Recently viewed
                        </p>
                    </div>
                    <div className="board-wrapper">
                        <div className="board">
                            <img src={placeholder} alt="Board image" className="board-img" />
                            <div className="board-title">Board Title</div>
                            <div onClick={toggleStar}>
                                {starFilled ? (
                                    <FaStar className="star-full" />
                                ) : (
                                    <FaRegStar className="star-icon" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
