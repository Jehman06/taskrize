import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Workspace {
    id: number;
    name: string;
    description: string;
    owner: number;
    members: Member[];
    boards: Board[];
}

export interface Member {
    id: number;
    email: string;
    name: string;
    nickname: string;
}

interface Board {
    id: number;
    title: string;
    description: string;
    favorite: number[];
    default_image: string;
    workspace: number;
    workspace_name: string;
    starFilled: any;
    workspaces: Workspace[];
}

export interface WorkspaceState {
    workspaces: Workspace[];
    boards: Board[];
    workspaceName: string;
    editing: boolean;
    editingWorkspaceId: number | null;
    workspaceFormData: {
        name: string;
        description: string;
    };
    members: Member[];
}

export const initialState: WorkspaceState = {
    workspaces: [],
    boards: [],
    workspaceName: '',
    editing: false,
    editingWorkspaceId: null,
    workspaceFormData: {
        name: '',
        description: '',
    },
    members: [],
};

const workspaceSLice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setWorkspaces(state, action: PayloadAction<Workspace[]>) {
            state.workspaces = action.payload;
        },
        setWorkspaceName(state, action: PayloadAction<string>) {
            state.workspaceName = action.payload;
        },
        setEditing(state, action: PayloadAction<boolean>) {
            state.editing = action.payload;
        },
        setEditingWorkspaceId(state, action: PayloadAction<number | null>) {
            state.editingWorkspaceId = action.payload;
        },
        setWorkspaceFormData(
            state,
            action: PayloadAction<Partial<WorkspaceState['workspaceFormData']>>
        ) {
            state.workspaceFormData = { ...state.workspaceFormData, ...action.payload };
        },
        setMembers(state, action: PayloadAction<Member[]>) {
            state.members = action.payload;
        },
    },
});

export const {
    setWorkspaces,
    setWorkspaceName,
    setEditing,
    setEditingWorkspaceId,
    setWorkspaceFormData,
    setMembers,
} = workspaceSLice.actions;
export default workspaceSLice.reducer;
