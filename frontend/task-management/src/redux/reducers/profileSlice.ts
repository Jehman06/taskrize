import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
    id?: number;
    email?: string;
    name?: string;
    nickname?: string;
    bio?: string;
    [key: string]: number | string | undefined;
}

interface DangerZoneFormData {
    email: string;
    password: string;
}

export interface ProfileState {
    profile: UserProfile | null;
    updateProfileFormData: Partial<UserProfile>;
    dangerZoneFormData: DangerZoneFormData;
    updated_email: string;
    updated_password: string;
    updated_password_confirm: string;
}

export const initialState: ProfileState = {
    profile: null,
    updateProfileFormData: {
        name: '',
        nickname: '',
        bio: '',
    },
    dangerZoneFormData: {
        email: '',
        password: '',
    },
    updated_email: '',
    updated_password: '',
    updated_password_confirm: '',
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfile(state, action: PayloadAction<UserProfile | null>) {
            state.profile = action.payload;
        },
        setUpdateProfileFormData(state, action: PayloadAction<UserProfile>) {
            state.updateProfileFormData = action.payload;
        },
        setDangerZoneFormData(state, action: PayloadAction<DangerZoneFormData>) {
            state.dangerZoneFormData = action.payload;
        },
        setUpdatedEmail(state, action: PayloadAction<string>) {
            state.updated_email = action.payload;
        },
        setUpdatedPassword(state, action: PayloadAction<string>) {
            state.updated_password = action.payload;
        },
        setUpdatedPasswordConfirm(state, action: PayloadAction<string>) {
            state.updated_password_confirm = action.payload;
        },
    },
});

export const {
    setProfile,
    setUpdateProfileFormData,
    setDangerZoneFormData,
    setUpdatedEmail,
    setUpdatedPassword,
    setUpdatedPasswordConfirm,
} = profileSlice.actions;
export default profileSlice.reducer;
