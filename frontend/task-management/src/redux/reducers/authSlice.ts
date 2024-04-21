import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
    user: {
        isAuthenticated: boolean;
        id: number | null;
    };
    resetCode: string | null;
    stage: string;
    showPassword: boolean;
    authFormData: {
        email: string;
        password: string;
        password_confirmation: string;
    };
}

export const initialState: AuthState = {
    user: {
        isAuthenticated: false,
        id: null,
    },
    resetCode: '',
    stage: 'resetCode',
    showPassword: false,
    authFormData: {
        email: '',
        password: '',
        password_confirmation: '',
    },
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Action to update state when login request is initiated
        loginUser(state, action: PayloadAction<number>) {
            state.user.isAuthenticated = true;
            state.user.id = action.payload;
        },
        logoutUser(state) {
            state.user.isAuthenticated = false;
            state.user.id = null;
        },
        setAuthFormData(state, action: PayloadAction<any>) {
            state.authFormData = action.payload;
        },
        setResetCode(state, action: PayloadAction<string>) {
            state.resetCode = action.payload;
        },
        setStage(state, action: PayloadAction<'resetCode' | 'reset' | 'complete'>) {
            state.stage = action.payload;
        },
        setConfirmPassword(state, action: PayloadAction<string>) {
            state.authFormData.password_confirmation = action.payload;
        },
        resetAuthStates(state) {
            state.authFormData = {
                email: '',
                password: '',
                password_confirmation: '',
            };
            state.showPassword = false;
            state.stage = 'resetCode';
            state.user = {
                id: null,
                isAuthenticated: false,
            };
        },
        setShowPassword(state) {
            state.showPassword = !state.showPassword;
        },
    },
});

export const {
    loginUser,
    logoutUser,
    setAuthFormData,
    setResetCode,
    setStage,
    setConfirmPassword,
    resetAuthStates,
    setShowPassword,
} = authSlice.actions;
export default authSlice.reducer;
