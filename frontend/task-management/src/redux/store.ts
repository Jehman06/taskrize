import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from './reducers/authSlice';
import appSlice from './reducers/appSlice';
import modalSlice from './reducers/modalSlice';
import boardSlice from './reducers/boardSlice';
import workspaceSlice from './reducers/workspaceSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // Only persist the 'auth' slice
};

// Combine all reducers
const rootReducer = combineReducers({
    auth: authSlice,
    app: appSlice,
    modal: modalSlice,
    board: boardSlice,
    workspace: workspaceSlice,
});

// Persist the combined reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export type RootState = ReturnType<typeof rootReducer>;

// Create the Redux store with the persisted reducer
const store = configureStore({
    reducer: persistedReducer,
});

// Create the persistor
const persistor = persistStore(store);

export { store, persistor };
