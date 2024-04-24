import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
    id: number;
    recipient: number;
    sender_name?: string;
    workspace_name: number;
    notificationType: string;
    content: string;
    created_at: Date;
    read: boolean;
}

interface NotificationsState {
    newNotifications: boolean;
    notifications: Notification[];
    notificationsFetched: boolean;
}

const initialState: NotificationsState = {
    newNotifications: false,
    notifications: [],
    notificationsFetched: false,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNewNotifications(state, action: PayloadAction<boolean>) {
            state.newNotifications = action.payload;
        },
        setNotifications(state, action: PayloadAction<Notification[]>) {
            state.notifications = action.payload;
        },
        setNotificationsFetched(state, action: PayloadAction<boolean>) {
            state.notificationsFetched = action.payload;
        },
    },
});

export const { setNewNotifications, setNotifications, setNotificationsFetched } =
    notificationSlice.actions;
export default notificationSlice.reducer;
