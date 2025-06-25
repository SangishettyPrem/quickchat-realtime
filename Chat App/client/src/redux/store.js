import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import chatsReducer from './features/ChatSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chats: chatsReducer
    },
})