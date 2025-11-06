import React, { useEffect, useMemo } from 'react';
import { Typography } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { selectCurrentUser, selectIsLogin, selectUserRole } from '../auth/services/authSlice';
import { useGetRoleQuery } from '../auth/services/authApi';
import { 
    RiBuilding4Line,
    RiMessage3Line,
    RiFileTextLine,
    RiCheckboxCircleLine,
    RiTimeLine
} from 'react-icons/ri';
import './dashboard.scss';
import { useGetReviewStatsQuery } from './superadmin/module/reviews/services/reviewsApi';

const { Title } = Typography;

const StatsCard = ({ title, value, subText, icon, type, index }) => (
    <motion.div
        className={`stats-card ${type}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
    >
        <motion.div 
            className={`icon-wrapper ${type}`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
        >
            {icon}
        </motion.div>
        <div className="content">
            <div className="title">{title}</div>
            <motion.div 
                className="value"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
            >
                {value}
            </motion.div>
            <div className="sub-text">{subText}</div>
        </div>
    </motion.div>
);

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const Dashboard = () => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const isLoggedIn = useSelector(selectIsLogin);
    const userRole = useSelector(selectUserRole);

    const skipRoleQuery = useMemo(() => {
        return !user?.role_id || !!userRole;
    }, [user?.role_id, userRole]);

    const { isLoading: isRoleLoading } = useGetRoleQuery(
        user?.role_id,
        { 
            skip: skipRoleQuery,
            refetchOnMountOrArgChange: true
        }
    );

    const checkAuth = useMemo(() => {
        return () => {
            if (!isLoggedIn) {
                navigate('/login', { replace: true });
            }
        };
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (!user) {
        return null;
    }

    const { data: reviewStatsData } = useGetReviewStatsQuery();
    const stats = reviewStatsData?.data || {};

    const overviewCards = [
        {
            title: 'Total Companies',
            value: stats.totalCompanies || 0,
            subText: `${stats.activeCompanies || 0} Active • ${stats.inactiveCompanies || 0} Inactive`,
            icon: <RiBuilding4Line size={24} />,
            type: 'purple'
        },
        {
            title: 'Total Inquiries',
            value: stats.totalInquiries || 0,
            subText: 'From all companies',
            icon: <RiMessage3Line size={24} />,
            type: 'cyan'
        }
    ];

    const reviewCards = [
        {
            title: 'Total Reviews',
            value: stats.totalReviews || 0,
            subText: `${stats.totalReviewLists || 0} Review Lists`,
            icon: <RiFileTextLine size={24} />,
            type: 'blue'
        },
        {
            title: 'Used Reviews',
            value: stats.usedReviews || 0,
            subText: `${stats.usedPercentage || 0}% of total`,
            icon: <RiCheckboxCircleLine size={24} />,
            type: 'green'
        },
        {
            title: 'Unused Reviews',
            value: stats.unusedReviews || 0,
            subText: `${stats.unusedPercentage || 0}% of total`,
            icon: <RiTimeLine size={24} />,
            type: 'orange'
        }
    ];

    return (
        <motion.div 
            className="dashboard-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Title level={2} className="dashboard-welcome-title">
                    {getGreeting()}, {user?.username || 'Info One'}!
                </Title>
                <Title level={4} className="dashboard-subtitle">
                    {userRole === 'super-admin' ? 'Super Admin Dashboard' : 'Dashboard'}
                </Title>
            </motion.div>
            
            <motion.div 
                className="overview-cards-container"
                variants={containerVariants}
            >
                {overviewCards.map((card, index) => (
                    <StatsCard key={index} {...card} index={index} />
                ))}
            </motion.div>

            <motion.div 
                className="stats-cards-container"
                variants={containerVariants}
            >
                {reviewCards.map((card, index) => (
                    <StatsCard key={index} {...card} index={index + 2} />
                ))}
            </motion.div>
        </motion.div>
    );
};

export default Dashboard; 