import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EmojiState {
    data: any;
    showEmojiPicker: boolean;
}

export const initialState: EmojiState = {
    data: null,
    showEmojiPicker: false,
};

const emojiSLice = createSlice({
    name: 'emoji',
    initialState,
    reducers: {
        setEmojiData(state, action: PayloadAction<any>) {
            state.data = action.payload;
        },
        setShowEmojiPicker(state, action: PayloadAction<boolean>) {
            state.showEmojiPicker = action.payload;
        },
    },
});

export const { setEmojiData, setShowEmojiPicker } = emojiSLice.actions;
export default emojiSLice.reducer;
