import { createSlice } from '@reduxjs/toolkit';

// Initialize state from localStorage
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
const parsedUser = user ? JSON.parse(user) : null;

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isLogin: false,
    message: null,
    success: false,
    userRole: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            const { user, token, message } = action.payload;
            state.isLoading = false;
            state.user = user;
            state.token = token;
            state.isLogin = true;
            state.error = null;
            state.success = true;
            state.message = message;
            state.userRole = user?.roleName || null;
        },
        loginFailure: (state, action) => {
            return {
                ...initialState,
                error: action.payload,
                message: action.payload
            };
        },
        updateUserRole: (state, action) => {
            state.userRole = action.payload.role_name;
            if (state.user) {
                state.user = {
                    ...state.user,
                    roleName: action.payload.role_name
                };
            }
        },
        logout: () => {
            localStorage.clear();
            return initialState;
        },
        clearError: (state) => {
            state.error = null;
            state.message = null;
        }
    }
});

// Export actions
export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    clearError,
    updateUserRole
} = authSlice.actions;

// Export selectors
export const selectCurrentUser = (state) => state.auth?.user || null;
export const selectCurrentToken = (state) => state.auth?.token || null;
export const selectAuthLoading = (state) => Boolean(state.auth?.isLoading);
export const selectAuthError = (state) => state.auth?.error || null;
export const selectIsLogin = (state) => Boolean(state.auth?.isLogin);
export const selectAuthMessage = (state) => state.auth?.message || null;
export const selectAuthSuccess = (state) => Boolean(state.auth?.success);
export const selectUserRole = (state) => state.auth?.userRole || null;

export default authSlice.reducer; 