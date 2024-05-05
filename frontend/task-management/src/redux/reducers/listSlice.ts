import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card } from './cardSlice';

export interface List {
    id: number;
    title: string;
    position: number;
    description: string;
    created_at: Date;
    updated_at: Date;
    board?: number;
    board_id?: number;
    cards: Card[];
    taskIds: string[];
}

interface ListState {
    lists: List[];
    isLoading: boolean;
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
    isLoading: true,
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
        setLists: (state, action: PayloadAction<List[]>) => {
            if (Array.isArray(action.payload)) {
                state.lists = action.payload;
                state.isLoading = false;
            } else {
                console.error('Invalid payload for setLists:', action.payload);
            }
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
        sortListsByPosition: (state) => {
            state.lists.sort((a, b) => a.position - b.position);
        },
        moveList: (state, action: PayloadAction<{ listId: number; newPosition: number }>) => {
            const { listId, newPosition } = action.payload;
            const movedList = state.lists.find((list: List) => list.id === listId);
            if (!movedList) {
                return;
            }
            const newLists = state.lists.filter((list: List) => list.id !== listId);
            newLists.splice(newPosition, 0, movedList);
            newLists.forEach((list, index) => {
                list.position = index;
            });
            state.lists = newLists;
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
    sortListsByPosition,
    moveList,
} = listSlice.actions;
export default listSlice.reducer;
