import React from 'react';
import { motion } from 'framer-motion';
import { 
    RiFileTextLine,
    RiCheckboxCircleLine,
    RiTimeLine
} from 'react-icons/ri';
import { useGetCompanyReviewStatsQuery } from '../../../reviews/services/reviewsApi';
import './statsCards.scss';

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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const StatsCards = ({ companyId }) => {
    const { data: statsData } = useGetCompanyReviewStatsQuery(companyId, {
        skip: !companyId
    });

    const stats = statsData?.data || {};

    const usedPercentage = stats?.usedPercentage || 0;
    const unusedPercentage = stats?.unusedPercentage || 0;
    const totalReviews = stats?.totalReviews || 0;
    const totalReviewLists = stats?.totalReviewLists || 0;
    const usedReviews = stats?.usedReviews || 0;
    const unusedReviews = stats?.unusedReviews || 0;

    if (!companyId) {
        return null;
    }

    const cards = [
        {
            title: 'Total Reviews',
            value: totalReviews,
            subText: `in ${totalReviewLists} lists`,
            icon: <RiFileTextLine size={24} />,
            type: 'blue'
        },
        {
            title: 'Used Reviews',
            value: usedReviews,
            subText: `${usedPercentage}% of total`,
            icon: <RiCheckboxCircleLine size={24} />,
            type: 'green'
        },
        {
            title: 'Unused Reviews',
            value: unusedReviews,
            subText: `${unusedPercentage}% of total`,
            icon: <RiTimeLine size={24} />,
            type: 'orange'
        }
    ];

    return (
        <motion.div 
            className="stats-cards-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {cards.map((card, index) => (
                <StatsCard key={index} {...card} index={index} />
            ))}
        </motion.div>
    );
};

export default StatsCards; 