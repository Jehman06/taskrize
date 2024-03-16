import {configureStore, combineReducers} from '@reduxjs/toolkit';
import  authReducer from './reducers/authSlice';

const rootReducer = combineReducers({
    auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
    reducer: rootReducer,
})

export default store;