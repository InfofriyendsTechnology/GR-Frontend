import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../auth/services/authSlice";
import { authApi } from "../auth/services/authApi";
import { inquiryApi } from "../project/superadmin/module/inquiry/services/inquiryApi";
import { companyApi } from "../project/superadmin/module/company/services/companyApi";
import { reviewsApi } from "../project/superadmin/module/reviews/services/reviewsApi";
import { planApi } from "../project/superadmin/module/plan/services/planApi";
import { subscriptionApi } from "../project/superadmin/module/subscription/services/subscriptionApi";
import { adminApi } from "../project/superadmin/module/admins/services/adminApi";

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth"]
};

const rootReducer = combineReducers({
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [inquiryApi.reducerPath]: inquiryApi.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [planApi.reducerPath]: planApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(
            authApi.middleware,
            inquiryApi.middleware,
            companyApi.middleware,
            reviewsApi.middleware,
            planApi.middleware,
            subscriptionApi.middleware,
            adminApi.middleware
        ),
});

export const persistor = persistStore(store);

export default store; 