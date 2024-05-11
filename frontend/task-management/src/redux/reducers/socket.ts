import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../store';
import { updateSelectedCard } from './cardSlice';
import { setLists } from './listSlice';

// Redux middleware to handle WebSocket messages
export const socketMiddleware =
    (store: any) => (next: any) => (action: any) => {
        const response = action.payload;
        if (
            action.type === 'WEBSOCKET_CARD_UPDATE' &&
            response &&
            response.card
        ) {
            store.dispatch(updateSelectedCard(response.card));
        }

        if (
            action.type === 'WEBSOCKET_LIST_UPDATE' &&
            response &&
            response.lists
        ) {
            store.dispatch(setLists(response.lists));
        }

        return next(action);
    };
