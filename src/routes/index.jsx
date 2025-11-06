import { createBrowserRouter, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import Login from "../auth/login/index.jsx";
import ForgotPassword from "../auth/forgot-password/index.jsx";
import OtpVerification from "../auth/otp-verification/index.jsx";
import ResetPassword from "../auth/reset-password/index.jsx";
import Dashboard from "../project/index.jsx";
import DashboardLayout from "../project/layout/index.jsx";
import NotFound from "../common/notFound/index.jsx";
import { selectIsLogin, selectUserRole } from "../auth/services/authSlice";
import Profile from "../project/superadmin/module/profile/index.jsx";
import React, { lazy, Suspense } from 'react';
import { MdOutlineContactSupport } from 'react-icons/md';
import { BsBuildingsFill } from 'react-icons/bs';
import { Spin } from 'antd';
import InquiryForm from "../Public/inquiryForm/index.jsx";
import CompanyReviews from "../Public/companyReviews/CompanyReviews.jsx";
import { RiStarLine, RiPriceTag3Line } from 'react-icons/ri';
import { AiOutlineSchedule } from 'react-icons/ai';
import { FaUserCog } from 'react-icons/fa';
import CompanyOverview from "../project/superadmin/module/company/overview";
const InquiryModule = lazy(() => import('../project/superadmin/module/inquiry'));
const CompanyModule = lazy(() => import('../project/superadmin/module/company'));
const LazyReviewsModule = React.lazy(() => import('../project/superadmin/module/reviews'));
const LazyPlanModule = React.lazy(() => import('../project/superadmin/module/plan'));
const LazySubscriptionModule = React.lazy(() => import('../project/superadmin/module/subscription'));
const LazyAdminModule = React.lazy(() => import('../project/superadmin/module/admins'));

// Loading Fallback Component
const LoadingFallback = () => (
    <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
    }}>
        <Spin size="large" />
    </div>
);

// Lazy Component Wrapper
const LazyComponent = ({ component: Component }) => (
    <Suspense fallback={<LoadingFallback />}>
        <Component />
    </Suspense>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const isLoggedIn = useSelector(selectIsLogin);
    const userRole = useSelector(selectUserRole);
    
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to role-specific dashboard
    if (userRole === 'super-admin') {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/super-admin')) {
            return <Navigate to={`/super-admin${currentPath}`} replace />;
        }
    }

    return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const isLoggedIn = useSelector(selectIsLogin);
    const userRole = useSelector(selectUserRole);
    
    if (isLoggedIn) {
        return userRole === 'super-admin' 
            ? <Navigate to="/super-admin/dashboard" replace />
            : <Navigate to="/" replace />;
    }
    return children;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <PublicRoute><Login /></PublicRoute>,
    },
    {
        path: "/login",
        element: <PublicRoute><Login /></PublicRoute>,
    },
    {
        path: "/forgot-password",
        element: <PublicRoute><ForgotPassword /></PublicRoute>,
    },
    {
        path: "/otp-verification",
        element: <PublicRoute><OtpVerification /></PublicRoute>,
    },
    {
        path: "/reset-password",
        element: <PublicRoute><ResetPassword /></PublicRoute>,
    },
    // Super Admin Routes
    {
        path: "/super-admin",
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="dashboard" replace />
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "plans",
                element: <LazyComponent component={LazyPlanModule} />,
                name: 'Plans',
                icon: <RiPriceTag3Line />,
                showInSidebar: true
            },
            {
                path: "profile",
                element: <Profile/>
            },
            {
                path: "company",
                element: <LazyComponent component={CompanyModule} />,
                name: 'Companies',
                icon: <BsBuildingsFill />,
                showInSidebar: true
            },
            {
                path: "company/:id",
                element: <CompanyOverview />,
            },
            {
                path: "inquiry",
                element: <LazyComponent component={InquiryModule} />,
                name: 'Inquiries',
                icon: <MdOutlineContactSupport />,
                showInSidebar: true
            },
            {
                path: "reviews",
                element: <LazyComponent component={LazyReviewsModule} />,
                name: 'Google Reviews',
                icon: <RiStarLine />,
                showInSidebar: true
            },
            {
                path: "subscriptions",
                element: <LazyComponent component={LazySubscriptionModule} />,
                name: 'Subscriptions',
                icon: <AiOutlineSchedule />,
                showInSidebar: true
            },
            {
                path: "admins",
                element: <LazyComponent component={LazyAdminModule} />,
                name: 'Admins',
                icon: <FaUserCog />,
                showInSidebar: true
            }
        ]
    },
    {
        path: "/inquiry",
        element: <InquiryForm />
    },
    {
        path: "/reviews/:companyName/:id",
        element: <CompanyReviews />
    },
    {
        path: "*",
        element: <NotFound />,
    }
]);

export default router;
