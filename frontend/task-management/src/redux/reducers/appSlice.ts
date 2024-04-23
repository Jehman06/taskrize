import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SearchResults {
    email: string;
    name?: string;
    nickname?: string;
}

export interface AppState {
    loading: boolean;
    message: string;
    errorMessage: string;
    query: string;
    searchResults: SearchResults[];
    isInputFocused: boolean;
}

export const initialState: AppState = {
    loading: false,
    message: '',
    errorMessage: '',
    query: '',
    searchResults: [],
    isInputFocused: false,
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
        fetchSearchResults(state, action: PayloadAction<SearchResults[]>) {
            console.log('Received search results:', action.payload);
            state.searchResults = action.payload;
        },
        resetSearchResults(state) {
            state.searchResults = [];
        },
        setInputFocus(state, action: PayloadAction<boolean>) {
            state.isInputFocused = action.payload;
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
} = appSlice.actions;
export default appSlice.reducer;
