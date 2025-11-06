import { createApi } from '@reduxjs/toolkit/query/react';
import { createSlice } from '@reduxjs/toolkit';
import { baseQueryWithReauth } from '../../store/baseQuery';
import  store from '../../store/store';
import { loginSuccess, loginFailure, loginStart, logout as logoutAction, updateUserRole } from './authSlice';

// Initial state for auth
const initialState = {
    success: false,
    message: '',
    data: null,
    error: null,
    isAuthenticated: false
};

// Create auth slice
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            return { ...state, ...action.payload };
        },
        clearCredentials: (state) => {
            return initialState;
        }
    }
});

// Export actions
export const { setCredentials, clearCredentials } = authSlice.actions;

// Create API slice
export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Auth', 'Role'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                dispatch(loginStart());
                try {
                    const { data: response } = await queryFulfilled;
                    if (response.success) {
                        // Store token in localStorage
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('user', JSON.stringify(response.data.user));

                        dispatch(loginSuccess({
                            user: response.data.user,
                            token: response.data.token,
                            message: response.message
                        }));

                        // Fetch role details if role_id exists
                        if (response.data.user.role_id) {
                            dispatch(authApi.endpoints.getRole.initiate(response.data.user.role_id));
                        }
                    } else {
                        dispatch(loginFailure(response.message || 'Login failed'));
                    }
                } catch (error) {
                    dispatch(loginFailure(error.error?.message || 'Login failed'));
                }
            },
        }),
        adminLogin: builder.mutation({
            query: (credentials) => ({
                url: '/auth/admin-login',
                method: 'POST',
                body: {
                    email: credentials.email,
                    isClientPage: credentials.isClientPage
                },
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                dispatch(loginStart());
                try {
                    const { data: response } = await queryFulfilled;
                if (response.success) {
                        // Store token in localStorage
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));

                        dispatch(loginSuccess({
                        user: response.data.user,
                        token: response.data.token,
                            message: response.message
                        }));

                        // Fetch role details if role_id exists
                        if (response.data.user.role_id) {
                            dispatch(authApi.endpoints.getRole.initiate(response.data.user.role_id));
                        }
                    } else {
                        dispatch(loginFailure(response.message || 'Login failed'));
                    }
                } catch (error) {
                    dispatch(loginFailure(error.error?.message || 'Login failed'));
                }
            },
        }),
        getRole: builder.query({
            query: (roleId) => `/role/${roleId}`,
            providesTags: ['Role'],
            async onQueryStarted(roleId, { dispatch, queryFulfilled }) {
                try {
                    const { data: response } = await queryFulfilled;
                    if (response.success) {
                        dispatch(updateUserRole(response.data));
                    }
                } catch (error) {
                    console.error('Failed to fetch role:', error);
                }
            }
        }),
    })
});

export const { useLoginMutation, useAdminLoginMutation, useGetRoleQuery } = authApi;

// Select auth state from store
export const selectAuth = (state) => state.auth;

// Updated useAuth hook
export const useAuth = () => {
    const state = store.getState();
    return selectAuth(state);
};

// Updated login handler
export const handleLogin = async (credentials, loginMutation) => {
    try {
        const response = await loginMutation(credentials).unwrap();
        return response;
    } catch (error) {
        console.error('Login error:', error);
    return {
            ...initialState,
            error: error.message || 'Login failed'
    };
    }
};

// Updated logout function
export const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch logout action
    store.dispatch(logoutAction());
    
    // Reset API state
    store.dispatch(authApi.util.resetApiState());

    // Navigate to login page with replace to prevent back navigation
    window.location.replace('/login');
};