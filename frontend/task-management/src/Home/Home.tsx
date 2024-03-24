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

  return (
    <div style={{ backgroundColor: '#33373a', height: '100vh' }}>
      <PrivateNavbar />
    </div>
  );
};

export default Home;
