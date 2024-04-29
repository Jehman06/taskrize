import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from './reducers/authSlice';
import appSlice from './reducers/appSlice';
import modalSlice from './reducers/modalSlice';
import boardSlice from './reducers/boardSlice';
import workspaceSlice from './reducers/workspaceSlice';
import profileSlice from './reducers/profileSlice';
import emojiSlice from './reducers/emojiSlice';

// Import middleware to warn of non-serializable actions in the redux store
import { createImmutableStateInvariantMiddleware } from '@reduxjs/toolkit';
import notificationSlice from './reducers/notificationSlice';
import listSlice from './reducers/listSlice';
import cardSlice from './reducers/cardSlice';

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
    profile: profileSlice,
    emoji: emojiSlice,
    notification: notificationSlice,
    list: listSlice,
    card: cardSlice,
});

// Persist the combined reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export type RootState = ReturnType<typeof rootReducer>;

const reduxPersistActions = [FLUSH, REHYDRATE, PAUSE, PURGE, REGISTER];

// Create the Redux store with the persisted reducer
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [...reduxPersistActions],
            },
        }),
});

// Create the persistor
const persistor = persistStore(store);

export { store, persistor };
