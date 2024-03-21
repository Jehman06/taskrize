import React, { useEffect } from 'react';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import PrivateNavbar from '../Navbar/PrivateNavbar';
import { spiral } from 'ldrs';
import { resetAppStates } from '../redux/reducers/appSlice';

const Home: React.FC = () => {
  // Access the authenticated user's data from the Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  spiral.register();

  // Reset app states, especially loading
  useEffect(() => {
    dispatch(resetAppStates());
  });

  if (!user) {
    return (
      <div className="text-center mt-5 mb-5">
        <l-spiral size="30" color="teal"></l-spiral>
      </div>
    );
  }

  return (
    <div>
      <PrivateNavbar />
      <h1>Hey, {user.email}! Welcome to your dashboard!</h1>
    </div>
  );
};

export default Home;