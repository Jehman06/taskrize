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

// Configure Redux Persist
const persistConfig = {
  key: 'root',
  storage,
};

// Wrap the root reducer with Redux Persist
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store
const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer
});

// Create the Redux persistor
const persistor = persistStore(store);

export { store, persistor };
