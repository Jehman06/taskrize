import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: workspaceState = {
    workspaces: [],
    boards: [],
};

const workspaceSLice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setWorkspaces(state, action: PayloadAction<Workspace[]>) {
            state.workspaces = action.payload;
        },
    },
});

export const { setWorkspaces } = workspaceSLice.actions;
export default workspaceSLice.reducer;
