import { createSlice, PayloadAction, createReducer } from '@reduxjs/toolkit';
import { Member } from './workspaceSlice';

export interface AppState {
    loading: boolean;
    message: string;
    errorMessage: string;
    query: string;
    searchResults: Member[];
    isInputFocused: boolean;
    selectedUsers: Member[];
}

export const initialState: AppState = {
    loading: false,
    message: '',
    errorMessage: '',
    query: '',
    searchResults: [],
    isInputFocused: false,
    selectedUsers: [] as Member[],
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setMessage(state, action: PayloadAction<string>) {
            state.message = action.payload;
        },
        setErrorMessage(state, action: PayloadAction<string>) {
            state.errorMessage = action.payload;
        },
        setSearchQuery(state, action: PayloadAction<string>) {
            state.query = action.payload;
        },
        clearSearchQuery(state) {
            state.query = '';
        },
        fetchSearchResults(state, action: PayloadAction<Member[]>) {
            state.searchResults = action.payload;
        },
        resetSearchResults(state) {
            state.searchResults = [];
        },
        setInputFocus(state, action: PayloadAction<boolean>) {
            state.isInputFocused = action.payload;
        },
        setSelectedUsers(state, action: PayloadAction<Member[]>) {
            state.selectedUsers = action.payload;
        },
        resetAppStates(state) {
            state.loading = false;
            state.message = '';
            state.errorMessage = '';
        },
    },
});

export const {
    setLoading,
    setMessage,
    setErrorMessage,
    resetAppStates,
    setSearchQuery,
    clearSearchQuery,
    fetchSearchResults,
    resetSearchResults,
    setInputFocus,
    setSelectedUsers,
} = appSlice.actions;

export default appSlice.reducer;
