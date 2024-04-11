import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authSlice from './reducers/authSlice';
import appSlice from './reducers/appSlice';
import modalSlice from './reducers/modalSlice';

// Combine all reducers
const rootReducer = combineReducers({
    auth: authSlice,
    app: appSlice,
    modal: modalSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

// Create the Redux store
const store = configureStore({
    reducer: rootReducer, // Use the persisted reducer
});

export { store };
