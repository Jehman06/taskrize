import React, { useEffect } from 'react';
import { UseSelector, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Home: React.FC = () => {
  // Access the authenticated user's data from the Redux store
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div>
      <h1>
        Welcome, {user ? user.email : 'Guest'}, your password, for everybody to
        see, is '{user.password}'. Enjoy this wonderful, magnificent app!
      </h1>
    </div>
  );
};

export default Home;
