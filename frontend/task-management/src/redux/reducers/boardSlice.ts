import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { List } from './listSlice';

export interface Image {
    id: number;
    url: string;
    owner: string;
    alt: string;
}

export interface Board {
    id: number;
    title: string;
    description: string;
    favorite: number[];
    default_image: Image;
    workspace: number;
    workspace_name: string;
    starFilled: any;
    lists?: List[];
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
        default_image: {
            id: null;
            url: string;
            owner: string;
            alt: string;
        };
    };
    board: Board | null;
}

export const initialState: BoardState = {
    boards: [],
    favoriteBoards: [],
    boardFormData: {
        title: '',
        description: '',
        custom_image: null,
        default_image: {
            id: null,
            url: '',
            owner: '',
            alt: '',
        },
        workspace: {
            name: '',
        },
    },
    board: null,
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
        setBoard(state, action: PayloadAction<Partial<Board> | null>) {
            if (action.payload === null) {
                state.board = null;
            } else {
                state.board = {
                    id: state.board ? state.board.id : 0,
                    title: state.board ? state.board.title : '',
                    description: state.board ? state.board.description : '',
                    favorite: state.board ? state.board.favorite : [],
                    default_image: state.board
                        ? state.board.default_image
                        : { id: 0, url: '', owner: '', alt: '' },
                    workspace: state.board ? state.board.workspace : 0,
                    workspace_name: state.board ? state.board.workspace_name : '',
                    starFilled: state.board ? state.board.starFilled : null,
                    lists: state.board ? state.board.lists : [],
                    ...action.payload,
                };
            }
        },
    },
});

export const { setBoards, setFavoriteBoards, setBoardFormData, setBoard } = boardSlice.actions;
export default boardSlice.reducer;
