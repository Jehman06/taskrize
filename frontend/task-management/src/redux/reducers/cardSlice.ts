import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Card {
    id: number;
    title: string;
    description: string;
    position: number;
    due_date: Date;
    attachment: string;
    label: string;
    list: number;
}

interface CardState {
    newCardTitle: string;
    newCardDescription: string;
    selectedCard: Card | null;
    isEditingTitle: boolean;
    isEditingDescription: boolean;
    dueDate: string | null;
}

const initialState: CardState = {
    newCardTitle: '',
    newCardDescription: '',
    selectedCard: null,
    isEditingTitle: false,
    isEditingDescription: false,
    dueDate: new Date().toISOString(),
};

const cardSlice = createSlice({
    name: 'card',
    initialState,
    reducers: {
        setNewCardTitle(state, action: PayloadAction<string>) {
            state.newCardTitle = action.payload;
        },
        setNewCardDescription(state, action: PayloadAction<string>) {
            state.newCardDescription = action.payload;
        },
        setSelectedCard(state, action: PayloadAction<Card>) {
            state.selectedCard = action.payload;
        },
        updateSelectedCard(state, action: PayloadAction<Card>) {
            state.selectedCard = action.payload;
        },
        setIsEditingTitle(state, action: PayloadAction<boolean>) {
            state.isEditingTitle = action.payload;
        },
        setIsEditingDescription(state, action: PayloadAction<boolean>) {
            state.isEditingDescription = action.payload;
        },
        setDueDate(state, action: PayloadAction<string>) {
            state.dueDate = action.payload;
        },
    },
});

export const {
    setNewCardTitle,
    setNewCardDescription,
    setSelectedCard,
    updateSelectedCard,
    setIsEditingTitle,
    setIsEditingDescription,
    setDueDate,
} = cardSlice.actions;
export default cardSlice.reducer;
