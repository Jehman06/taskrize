import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  loading: boolean;
  message: string | null;
  errorMessage: string | null;
}

const initialState = {
  loading: false,
  message: '',
  errorMessage: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    updateMessage(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
    updateErrorMessage(state, action: PayloadAction<string>) {
      state.errorMessage = action.payload;
    },
  },
});

export const { updateLoading, updateMessage, updateErrorMessage } =
  appSlice.actions;
export default appSlice.reducer;
