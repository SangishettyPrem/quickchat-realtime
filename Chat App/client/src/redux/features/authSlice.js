import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { baseURL } from '../../config/url'
import axios from 'axios';

export const SignUp = createAsyncThunk(
    'auth/signup',
    async (userdata, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${baseURL}signup`, userdata,
                { headers: { "Content-Type": "application/json" } });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const UserLogin = createAsyncThunk(
    'auth/login',
    async (userdata, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${baseURL}login`, userdata,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                });
            return response?.data;
        } catch (error) {
            console.error("Error: ", error);
            return rejectWithValue(error.response?.data);
        }
    }
)

export const UpdateProfile = createAsyncThunk(
    'auth/updateProfile',
    async ({ form, id }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${baseURL}UpdateProfile/${id}`, form, {
                headers: { "Content-Type": 'multipart/form-data' },
                withCredentials: true,
            });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const verifyUser = createAsyncThunk(
    'auth/verify',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${baseURL}verifyUser`,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                });
            return response?.data
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
)

export const Logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${baseURL}logout`,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
)

const authSlice = createSlice({
    name: "auth",
    initialState: {
        error: null,
        isLoading: false,
        isUpdateProfileSubmitting: false,
        user: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(SignUp.pending, (state) => {
                state.error = null;
                state.isLoading = true;
            })
            .addCase(SignUp.fulfilled, (state, action) => {
                state.error = null;
                state.isLoading = false;
            })
            .addCase(SignUp.rejected, (state, action) => {
                state.error = action.error.message;
                state.isLoading = false;
            })
            .addCase(UserLogin.pending, (state) => {
                state.error = null;
                state.isLoading = true;
            })
            .addCase(UserLogin.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })
            .addCase(UserLogin.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.error = null;
                state.isLoading = false;
            })
            .addCase(verifyUser.pending, (state, action) => {
                state.error = null;
            })
            .addCase(verifyUser.fulfilled, (state, action) => {
                state.user = action.payload.user;
            })
            .addCase(verifyUser.rejected, (state, action) => {
                state.error = action.payload.message;
                state.user = null;
            })
            .addCase(Logout.rejected, (state, action) => {
                state.error = action.payload.message;
            })
            .addCase(Logout.fulfilled, (state, action) => {
                state.user = null;
                state.error = null;
            })
            .addCase(Logout.pending, (state, action) => {
                state.error = null;
            })
            .addCase(UpdateProfile.pending, (state, action) => {
                state.isUpdateProfileSubmitting = true
            })
            .addCase(UpdateProfile?.rejected, (state, action) => {
                state.isUpdateProfileSubmitting = false
            })
            .addCase(UpdateProfile.fulfilled, (state, action) => {
                state.isUpdateProfileSubmitting = false;
                state.user = action.payload?.user;
            })
    }
})

export default authSlice.reducer;