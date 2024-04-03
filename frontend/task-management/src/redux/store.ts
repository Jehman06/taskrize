import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from './reducers/authSlice';
import appSlice from './reducers/appSlice';

// Combine all reducers
const rootReducer = combineReducers({
    auth: authSlice,
    app: appSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

// Create the Redux store
const store = configureStore({
    reducer: rootReducer, // Use the persisted reducer
});

export { store };
