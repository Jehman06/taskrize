import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authSlice from './reducers/authSlice';
import appSlice from './reducers/appSlice';

const rootReducer = combineReducers({
  auth: authSlice,
  app: appSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
});

export default store;
