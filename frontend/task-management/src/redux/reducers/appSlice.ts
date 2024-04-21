import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
    loading: boolean;
    message: string;
    errorMessage: string;
}

export const initialState: AppState = {
    loading: false,
    message: '',
    errorMessage: '',
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
        resetAppStates(state) {
            state.loading = false;
            state.message = '';
            state.errorMessage = '';
        },
    },
});

export const { setLoading, setMessage, setErrorMessage, resetAppStates } = appSlice.actions;
export default appSlice.reducer;
