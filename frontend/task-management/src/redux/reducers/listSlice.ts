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
    openListId: number | null;
    activeListId: number | null;
    renamingListId: number | null;
    listFormData: {
        title?: string;
        description?: string;
    };
}

const initialState: ListState = {
    lists: [],
    isCreatingList: false,
    newListName: '',
    openListId: null,
    activeListId: null,
    renamingListId: null,
    listFormData: {
        title: '',
        description: '',
    },
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
        setOpenListId(state, action: PayloadAction<number | null>) {
            state.openListId = action.payload;
        },
        setRenamingListId(state, action: PayloadAction<number | null>) {
            state.renamingListId = action.payload;
        },
        setListFormData(state, action: PayloadAction<{ title?: string; description?: string }>) {
            state.listFormData = action.payload;
        },
    },
});

export const {
    setLists,
    setActiveListId,
    setIsCreatingList,
    setNewListName,
    setOpenListId,
    setRenamingListId,
    setListFormData,
} = listSlice.actions;
export default listSlice.reducer;
