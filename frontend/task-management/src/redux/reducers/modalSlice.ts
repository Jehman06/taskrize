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
        workspace: {
            name: string | null;
        };
        custom_image: File | string | null;
        default_image: string | null;
    };
    workspaceFormData: {
        name: string;
        description: string;
    };
    workspaces: Workspace[];
    selectedWorkspace: Workspace | null;
    selectedDefaultImage: string | null;
    selectedCustomImage: File | null;
    errorTitleMessage: string | null;
    errorImageMessage: string | null;
    errorWorkspaceMessage: string | null;
}

const initialState: ModalState = {
    createBoardModal: false,
    createWorkspaceModal: false,
    boardFormData: {
        title: '',
        description: '',
        custom_image: null,
        default_image: null,
        workspace: {
            name: '',
        },
    },
    workspaceFormData: {
        name: '',
        description: '',
    },
    workspaces: [],
    selectedWorkspace: null,
    selectedDefaultImage: null,
    selectedCustomImage: null,
    errorTitleMessage: '',
    errorImageMessage: '',
    errorWorkspaceMessage: '',
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
        updateSelectedWorkspace(state, action: PayloadAction<Workspace | null>) {
            state.selectedWorkspace = action.payload;
        },
        updateSelectedDefaultImage(state, action: PayloadAction<string | null>) {
            state.selectedDefaultImage = action.payload;
        },
        updateSelectedCustomImage(state, action: PayloadAction<File | null>) {
            state.selectedCustomImage = action.payload;
        },
        updateErrorTitleMessage(state, action: PayloadAction<string | null>) {
            state.errorTitleMessage = action.payload;
        },
        updateErrorImageMessage(state, action: PayloadAction<string | null>) {
            state.errorImageMessage = action.payload;
        },
        updateErrorWorkspaceMessage(state, action: PayloadAction<string | null>) {
            state.errorWorkspaceMessage = action.payload;
        },
        resetModalStates(state) {
            const { boardFormData } = state;
            const { workspaceFormData } = state;
            state.errorImageMessage = '';
            state.errorTitleMessage = '';
            state.errorWorkspaceMessage = '';
            state.selectedWorkspace = null;
            state.selectedDefaultImage = null;
            // Reset the board form data properties
            boardFormData.default_image = '';
            boardFormData.description = '';
            boardFormData.title = '';
            boardFormData.workspace.name = '';
            // Reset the workspace data properties
            workspaceFormData.name = '';
            workspaceFormData.description = '';
        },
    },
});

export const {
    updateCreateBoardModal,
    updateCreateWorkspaceModal,
    updateBoardFormData,
    updateWorkspaceFormData,
    updateSelectedWorkspace,
    updateSelectedDefaultImage,
    updateSelectedCustomImage,
    updateErrorTitleMessage,
    updateErrorImageMessage,
    updateErrorWorkspaceMessage,
    resetModalStates,
} = modalSlice.actions;

export default modalSlice.reducer;
