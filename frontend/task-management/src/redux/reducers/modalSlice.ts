import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Workspace {
    id: number;
    name: string;
}

interface ModalState {
    createBoardModal: boolean;
    createWorkspaceModal: boolean;
    boardFormData: {
        title: string;
        description: string;
        workspace: Workspace | null;
        image: string | null;
    };
    workspaceFormData: {
        name: string;
        description: string;
    };
}

const initialState: ModalState = {
    createBoardModal: false,
    createWorkspaceModal: false,
    boardFormData: {
        title: '',
        description: '',
        workspace: null,
        image: null,
    },
    workspaceFormData: {
        name: '',
        description: '',
    },
};

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        updateCreateBoardModal(state) {
            state.createBoardModal = !state.createBoardModal;
        },
        updateCreateWorkspaceModal(state) {
            state.createWorkspaceModal = !state.createWorkspaceModal;
        },
        updateBoardFormData(state, action: PayloadAction<Partial<ModalState['boardFormData']>>) {
            state.boardFormData = { ...state.boardFormData, ...action.payload };
        },
        updateWorkspaceFormData(
            state,
            action: PayloadAction<Partial<ModalState['workspaceFormData']>>
        ) {
            state.workspaceFormData = { ...state.workspaceFormData, ...action.payload };
        },
    },
});

export const {
    updateCreateBoardModal,
    updateCreateWorkspaceModal,
    updateBoardFormData,
    updateWorkspaceFormData,
} = modalSlice.actions;
export default modalSlice.reducer;
