import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
    email: string;
    name: string;
    nickname: string;
    bio: string;
}

interface ProfileState {
    profile: UserProfile | null;
    bio: string;
}

const initialState: ProfileState = {
    profile: null,
    bio: '',
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfile(state, action: PayloadAction<UserProfile | null>) {
            state.profile = action.payload;
        },
        setBio(state, action: PayloadAction<string>) {
            state.bio = action.payload;
        },
    },
});

export const { setProfile, setBio } = profileSlice.actions;
export default profileSlice.reducer;
