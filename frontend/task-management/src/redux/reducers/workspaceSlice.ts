import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface Workspace {
    id: number;
    name: string;
    description: string;
    owner: number;
    members: number[];
    boards: Board[];
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
}

interface workspaceState {
    workspaces: Workspace[];
    boards: Board[];
    workspaceName: string;
    editing: boolean;
    editingWorkspaceId: number | null;
}

const initialState: workspaceState = {
    workspaces: [],
    boards: [],
    workspaceName: '',
    editing: false,
    editingWorkspaceId: null,
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
    },
});

export const { setWorkspaces, setWorkspaceName, setEditing, setEditingWorkspaceId } =
    workspaceSLice.actions;
export default workspaceSLice.reducer;
