import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: any;
    isAuthenticated: boolean;
    error: string | null;
    loading: boolean;
    resetCode: string | null;
    password: string | null;
    stage: string | null;
    formData: {
        email: string;
        password: string;
        confirmPassword: string;
    };
}

const initialState = {
    user: null,
    isAuthenticated: false,
    error: null,
    loading: false,
    resetCode: null,
    password: null,
    confirmPassword: null,
    stage: null,
    formData: {
        email: '',
        password: '',
        confirmPassword: '',
    },
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Action to update state when login request is initiated
        loginUser(state, action: PayloadAction<{user: any}>) {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
            state.loading = false;
        },
        loginFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        updateFormData(state, action) {
            state.formData = action.payload;
        },
        updateLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
    }
})

export const { loginUser, loginFailure, updateFormData, updateLoading } = authSlice.actions;
export default authSlice.reducer;