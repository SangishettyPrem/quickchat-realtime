import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../../config/url";

export const fetchUsers = createAsyncThunk(
    "chat/fetchUsers",
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const response = await axios.get(`${baseURL}fetchUsers`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            })
            return {
                users: response.data,
                currentUser: auth.user
            };
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const fetchMessages = createAsyncThunk(
    "chat/fetchMessages",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${baseURL}messages/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
);

export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async (message, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${baseURL}messages/send`, message, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const GetOrCreateConversationId = createAsyncThunk(
    "chat/get-or-create",
    async (request, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${baseURL}conversation/getOrCreate`, request, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true
            });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const MarkAsRead = createAsyncThunk(
    "chat/MarkAsRead",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${baseURL}messages/mark-as-read/${id}`, {}, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true
            });
            return response?.data
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
)

const Chat = createSlice({
    name: "chats",
    initialState: {
        users: null,
        messages: null,
        error: null,
        conversationId: '',
        messagesError: null,
        isChatLoading: false,
        isMessageSending: false,
        unReadMsgCount: null,
    },
    reducers: {
        setMessage: (state, action) => {
            state.messages = [...state.messages, action.payload];
        },
        setConversationId: (state, action) => {
            state.conversationId = action.payload;
        },
        setUsers: (state, action) => {
            state.users = action.payload;
        },
        setUnReadMsgCount: (state, action) => {
            const { sender_id, increment } = action.payload;
            const existing = state.unReadMsgCount.find(item => item.sender_id === sender_id);
            if (existing) {
                existing.unreadCount += increment;
            } else {
                state.unReadMsgCount.push({ sender_id, unreadCount: increment });
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isChatLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isChatLoading = false;
                state.users = action.payload?.users;
                const currentUser = action.payload?.currentUser;
                state.users = action.payload?.users?.users?.filter(user => user.id !== currentUser?.id);
                state.unReadMsgCount = action.payload?.users?.unReadMsgCount;
            })
            .addCase(fetchUsers.pending, (state, action) => {
                state.isChatLoading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.isMessageSending = false
                state.messages = action.payload.messages;
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isMessageSending = false;
                state.messagesError = action.payload.message
            })
            .addCase(sendMessage.pending, (state, action) => {
                state.isMessageSending = true
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.messages = [...state.messages, action?.payload?.message];
                state.isMessageSending = false
            })
    }
});

export const { setMessage, setConversationId, setUsers, setUnReadMsgCount } = Chat.actions;
export default Chat.reducer;