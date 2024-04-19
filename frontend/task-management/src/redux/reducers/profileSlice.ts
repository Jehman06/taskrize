import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
    id?: number;
    email?: string;
    name?: string;
    nickname?: string;
    bio?: string;
    [key: string]: number | string | undefined;
}

interface ProfileState {
    profile: UserProfile | null;
    formProfileData: Partial<UserProfile>;
}

const initialState: ProfileState = {
    profile: null,
    formProfileData: {
        name: '',
        nickname: '',
        bio: '',
    },
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfile(state, action: PayloadAction<UserProfile | null>) {
            state.profile = action.payload;
        },
        setFormProfileData(state, action: PayloadAction<UserProfile>) {
            state.formProfileData = action.payload;
        },
    },
});

export const { setProfile, setFormProfileData } = profileSlice.actions;
export default profileSlice.reducer;
