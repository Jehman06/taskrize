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

export interface BoardState {
    boards: Board[];
    favoriteBoards: Board[];
    boardFormData: {
        title: string;
        description: string;
        workspace: {
            name: string | null;
        };
        custom_image: File | string | null;
        default_image: string | null;
    };
}

export const initialState: BoardState = {
    boards: [],
    favoriteBoards: [],
    boardFormData: {
        title: '',
        description: '',
        custom_image: null,
        default_image: null,
        workspace: {
            name: '',
        },
    },
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
        setBoardFormData(state, action: PayloadAction<Partial<BoardState>['boardFormData']>) {
            state.boardFormData = { ...state.boardFormData, ...action.payload };
        },
    },
});

export const { setBoards, setFavoriteBoards, setBoardFormData } = boardSlice.actions;
export default boardSlice.reducer;
