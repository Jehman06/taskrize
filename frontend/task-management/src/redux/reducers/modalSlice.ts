import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Workspace {
    id: number | null;
    name: string;
}

export interface Image {
    id: number;
    alt: string;
    owner: string;
    url: string;
}

export interface ModalState {
    createBoardModal: boolean;
    createWorkspaceModal: boolean;
    showDeleteAccountModal: boolean;
    showUpdateEmailModal: boolean;
    showDeleteWorkspaceModal: boolean;
    showUpdatePasswordModal: boolean;
    showWorkspaceMembersModal: boolean;
    showListModal: number | null;
    showImageModal: boolean;
    showCardModal: boolean;
    workspaceIdToShowModal: number | null;
    workspaceIdToDelete: number | null;
    selectedWorkspace: Workspace | null;
    selectedDefaultImage: Image | null;
    selectedCustomImage: File | null;
    errorTitleMessage: string | null;
    errorImageMessage: string | null;
    errorWorkspaceMessage: string | null;
    images: Image[];
    sampleImages: Image[];
}

export const initialState: ModalState = {
    createBoardModal: false,
    createWorkspaceModal: false,
    showDeleteAccountModal: false,
    showUpdateEmailModal: false,
    showDeleteWorkspaceModal: false,
    showUpdatePasswordModal: false,
    showWorkspaceMembersModal: false,
    showListModal: null,
    showImageModal: false,
    showCardModal: false,
    workspaceIdToShowModal: null,
    workspaceIdToDelete: null,
    selectedWorkspace: null,
    selectedDefaultImage: null,
    selectedCustomImage: null,
    errorTitleMessage: '',
    errorImageMessage: '',
    errorWorkspaceMessage: '',
    images: [],
    sampleImages: [],
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
        setShowDeleteAccountModal(state, action: PayloadAction<boolean>) {
            state.showDeleteAccountModal = action.payload;
        },
        setShowUpdateEmailModal(state, action: PayloadAction<boolean>) {
            state.showUpdateEmailModal = action.payload;
        },
        setShowDeleteWorkspaceModal(state, action: PayloadAction<boolean>) {
            state.showDeleteWorkspaceModal = action.payload;
        },
        setShowUpdatePasswordModal(state, action: PayloadAction<boolean>) {
            state.showUpdatePasswordModal = action.payload;
        },
        setShowWorkspaceMembersModal: (
            state,
            action: PayloadAction<{ show: boolean; id: number | null }>,
        ) => {
            state.showWorkspaceMembersModal = action.payload.show;
            state.workspaceIdToShowModal = action.payload.id;
        },
        setSelectedWorkspace(state, action: PayloadAction<Workspace | null>) {
            state.selectedWorkspace = action.payload;
        },
        setWorkspaceIdToDelete(state, action: PayloadAction<number | null>) {
            state.workspaceIdToDelete = action.payload;
        },
        setSelectedDefaultImage(state, action: PayloadAction<Image | null>) {
            state.selectedDefaultImage = action.payload;
        },
        setSelectedCustomImage(state, action: PayloadAction<File | null>) {
            state.selectedCustomImage = action.payload;
        },
        setErrorTitleMessage(state, action: PayloadAction<string | null>) {
            state.errorTitleMessage = action.payload;
        },
        setErrorImageMessage(state, action: PayloadAction<string | null>) {
            state.errorImageMessage = action.payload;
        },
        setErrorWorkspaceMessage(state, action: PayloadAction<string | null>) {
            state.errorWorkspaceMessage = action.payload;
        },
        setShowListModal(state, action: PayloadAction<number | null>) {
            state.showListModal = action.payload;
        },
        setSampleImages(state, action: PayloadAction<Image[]>) {
            state.sampleImages = action.payload;
        },
        setImages(state, action: PayloadAction<Image[]>) {
            state.images = action.payload;
        },
        setShowImageModal(state, action: PayloadAction<boolean>) {
            state.showImageModal = action.payload;
        },
        setShowCardModal(state, action: PayloadAction<boolean>) {
            state.showCardModal = action.payload;
        },
        resetModalStates(state) {
            state.errorImageMessage = '';
            state.errorTitleMessage = '';
            state.errorWorkspaceMessage = '';
            state.selectedWorkspace = null;
            state.selectedDefaultImage = null;
        },
    },
});

export const {
    updateCreateBoardModal,
    updateCreateWorkspaceModal,
    setShowDeleteAccountModal,
    setShowUpdateEmailModal,
    setShowDeleteWorkspaceModal,
    setShowUpdatePasswordModal,
    setShowWorkspaceMembersModal,
    setSelectedWorkspace,
    setSelectedDefaultImage,
    setSelectedCustomImage,
    setErrorTitleMessage,
    setErrorImageMessage,
    setErrorWorkspaceMessage,
    setShowListModal,
    resetModalStates,
    setSampleImages,
    setImages,
    setShowImageModal,
    setShowCardModal,
    setWorkspaceIdToDelete,
} = modalSlice.actions;

export default modalSlice.reducer;
