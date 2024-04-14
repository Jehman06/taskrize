import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Board {
    id: number;
    title: string;
    starFilled: boolean;
}

interface Workspaces {
    id: number;
    name: string;
    description: string;
    owner: number;
    members: number[];
}

interface ApiState {
    boards: Board[];
    workspaces: Workspaces[];
}

const initialState: ApiState = {
    boards: [],
    workspaces: [],
};

const apiSlice = createSlice({
    name: 'api',
    initialState,
    reducers: {
        updatedBoards(state, action: PayloadAction<Board[]>) {
            state.boards = action.payload;
        },
        updateWorkspaces(state, action: PayloadAction<Workspaces[]>) {
            state.workspaces = action.payload;
        },
    },
});

export const { updatedBoards, updateWorkspaces } = apiSlice.actions;

export default apiSlice.reducer;
