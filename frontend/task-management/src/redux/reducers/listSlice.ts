import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ListState {
    isCreatingList: boolean;
    newListName: string;
}

const initialState: ListState = {
    isCreatingList: false,
    newListName: '',
};

const listSlice = createSlice({
    name: 'list',
    initialState,
    reducers: {
        setIsCreatingList(state, action: PayloadAction<boolean>) {
            state.isCreatingList = action.payload;
        },
        setNewListName(state, action: PayloadAction<string>) {
            state.newListName = action.payload;
        },
    },
});

export const { setIsCreatingList, setNewListName } = listSlice.actions;
export default listSlice.reducer;
