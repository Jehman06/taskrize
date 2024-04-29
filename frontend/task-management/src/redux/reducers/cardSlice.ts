import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Card {
    id: number;
    title: string;
    description: string;
    position: number;
    due_date: Date;
    attachment: string; // Will probably need to change this later
    list: number;
}

interface CardState {
    newCardTitle: string;
}

const initialState: CardState = {
    newCardTitle: '',
};

const cardSlice = createSlice({
    name: 'card',
    initialState,
    reducers: {
        setNewCardTitle(state, action: PayloadAction<string>) {
            state.newCardTitle = action.payload;
        },
    },
});

export const { setNewCardTitle } = cardSlice.actions;
export default cardSlice.reducer;
