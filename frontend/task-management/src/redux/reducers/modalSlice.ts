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
        custom_image: File | string | null; // Allow both string (for default images) and File (for custom images)
        default_image: string | null;
    };
    workspaceFormData: {
        name: string;
        description: string;
    };
    workspaces: Workspace[]; // Add workspaces to modal state
    selectedWorkspace: Workspace | null; // Add selectedWorkspace to modal state
    selectedDefaultImage: string | null; // Add selectedDefaultImage to modal state
    selectedCustomImage: File | null; // Add selectedCustomImage to modal state
}

const initialState: ModalState = {
    createBoardModal: false,
    createWorkspaceModal: false,
    boardFormData: {
        title: '',
        description: '',
        workspace: null,
        custom_image: null,
        default_image: null,
    },
    workspaceFormData: {
        name: '',
        description: '',
    },
    workspaces: [],
    selectedWorkspace: null,
    selectedDefaultImage: null,
    selectedCustomImage: null,
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
        updateWorkspaces(state, action: PayloadAction<Workspace[]>) {
            state.workspaces = action.payload;
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
    },
});

export const {
    updateCreateBoardModal,
    updateCreateWorkspaceModal,
    updateBoardFormData,
    updateWorkspaceFormData,
    updateWorkspaces,
    updateSelectedWorkspace,
    updateSelectedDefaultImage,
    updateSelectedCustomImage,
} = modalSlice.actions;

export default modalSlice.reducer;
