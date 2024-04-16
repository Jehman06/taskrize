import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Board {
    id: number;
    title: string;
    description: string;
    favorite: number[];
    default_image: string;
    workspace: number;
    workspace_name: string;
    starFilled: any;
}

interface boardState {
    boards: Board[];
    favoriteBoards: Board[];
}

const initialState: boardState = {
    boards: [],
    favoriteBoards: [],
};

const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        setBoards(state, action: PayloadAction<Board[]>) {
            state.boards = action.payload;
        },
        setFavoriteBoards(state, action: PayloadAction<Board[]>) {
            state.favoriteBoards = action.payload;
        },
    },
});

export const { setBoards, setFavoriteBoards } = boardSlice.actions;
export default boardSlice.reducer;
