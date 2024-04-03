import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: {
        isAuthenticated: boolean;
    };
    resetCode: string | null;
    stage: string;
    showPassword: boolean;
    formData: {
        email: string;
        password: string;
        password_confirmation: string;
    };
}

const initialState: AuthState = {
    user: {
        isAuthenticated: false,
    },
    resetCode: '',
    stage: 'resetCode',
    showPassword: false,
    formData: {
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
        loginUser(state) {
            state.user.isAuthenticated = true;
        },
        logoutUser(state) {
            state.user.isAuthenticated = false;
        },
        updateFormData(state, action: PayloadAction<any>) {
            state.formData = action.payload;
        },
        updateResetCode(state, action: PayloadAction<any>) {
            state.resetCode = action.payload;
        },
        updateStage(state, action: PayloadAction<'resetCode' | 'reset' | 'complete'>) {
            state.stage = action.payload;
        },
        updateConfirmPassword(state, action: PayloadAction<string>) {
            state.formData.password_confirmation = action.payload;
        },
        resetAuthStates(state) {
            state.formData = {
                email: '',
                password: '',
                password_confirmation: '',
            };
            state.showPassword = false;
            state.stage = 'resetCode';
        },
        updateShowPassword(state) {
            state.showPassword = !state.showPassword;
        },
    },
});

export const {
    loginUser,
    logoutUser,
    updateFormData,
    updateResetCode,
    updateStage,
    updateConfirmPassword,
    resetAuthStates,
    updateShowPassword,
} = authSlice.actions;
export default authSlice.reducer;
