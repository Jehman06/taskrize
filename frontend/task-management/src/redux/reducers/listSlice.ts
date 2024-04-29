import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card } from './cardSlice';

export interface List {
    id: number;
    title: string;
    position: number;
    description: string;
    created_at: Date;
    updated_at: Date;
    board: number;
    cards: Card[];
}

interface ListState {
    lists: List[];
    isCreatingList: boolean;
    newListName: string;
    activeListId: number | null;
}

const initialState: ListState = {
    lists: [],
    isCreatingList: false,
    newListName: '',
    activeListId: null,
};

const listSlice = createSlice({
    name: 'list',
    initialState,
    reducers: {
        setLists(state, action: PayloadAction<List[]>) {
            state.lists = action.payload;
        },
        setActiveListId(state, action: PayloadAction<number | null>) {
            state.activeListId = action.payload;
        },
        setIsCreatingList(state, action: PayloadAction<boolean>) {
            state.isCreatingList = action.payload;
        },
        setNewListName(state, action: PayloadAction<string>) {
            state.newListName = action.payload;
        },
    },
});

export const { setLists, setActiveListId, setIsCreatingList, setNewListName } = listSlice.actions;
export default listSlice.reducer;
