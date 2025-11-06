import React from 'react';
import { Layout, Menu, Typography, Avatar, Tooltip } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, selectUserRole } from '../../../auth/services/authSlice';
import { 
    RiDashboardFill,
    RiGroupLine,
    RiLogoutCircleFill,
    RiUserLine,
    RiQuestionAnswerLine,
    RiBuildingLine,
    RiStarLine,
    RiPriceTag3Line,
    RiCalendarCheckLine,
    RiAdminLine
} from 'react-icons/ri';
import './styles.scss';
import { useLogout } from '../../../utils/hooks/useLogout';
const { Sider } = Layout;

const DashboardSidebar = ({ collapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const userRole = useSelector(selectUserRole);
    const handleLogout = useLogout();

    const getBasePath = () => {
        return userRole === 'super-admin' ? '/super-admin' : '/dashboard';
    };

    const menuItems = [
        {
            key: `${getBasePath()}/dashboard`,
            icon: <RiDashboardFill />,
            label: 'Dashboard'
        },
        {
            key: `${getBasePath()}/admins`,
            icon: <RiAdminLine />,
            label: 'Admins'
        },
        {
            key: `${getBasePath()}/inquiry`,
            icon: <RiQuestionAnswerLine />,
            label: 'Inquiry'
        },
        {
            key: `${getBasePath()}/company`,
            icon: <RiBuildingLine />,
            label: 'Company'
        },
        {
            key: `${getBasePath()}/subscriptions`,
            icon: <RiCalendarCheckLine />,
            label: 'Subscriptions'
        },
        {
            key: `${getBasePath()}/reviews`,
            icon: <RiStarLine />,
            label: 'Reviews'
        },
        {
            key: `${getBasePath()}/plans`,
            icon: <RiPriceTag3Line />,
            label: 'Plans'
        },
    ];

    const logoVariants = {
        expanded: { 
            fontSize: '24px',
            transition: { duration: 0.2, ease: 'easeInOut' }
        },
        collapsed: { 
            fontSize: '20px',
            transition: { duration: 0.2, ease: 'easeInOut' }
        }
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={256}
            collapsedWidth={80}
            className="dashboard-sidebar"
            style={{
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                background: 'var(--bg-primary)',
                boxShadow: '0 1px 4px var(--shadow-color)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out'
            }}
        >
            <motion.div className="sidebar-logo">
                <motion.div
                    variants={logoVariants}
                    animate={collapsed ? 'collapsed' : 'expanded'}
                    className="sidebar-logo-text"
                >
                    {collapsed ? 'SA' : userRole}
                </motion.div>
            </motion.div>

            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
            />

            <div className="sidebar-footer">
                {collapsed ? (
                    <div className="sidebar-footer-collapsed">
                        <Tooltip title={user?.username || 'User'} placement="right">
                            <Avatar className="sidebar-footer-avatar">
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                        </Tooltip>
                        <Tooltip title="Profile" placement="right">
                            <div className="profile-link" onClick={() => navigate(`${getBasePath()}/profile`)}>
                                <RiUserLine />
                            </div>
                        </Tooltip>
                        <Tooltip title="Logout" placement="right">
                            <div className="sidebar-footer-logout" onClick={handleLogout}>
                                <RiLogoutCircleFill />
                            </div>
                        </Tooltip>
                    </div>
                ) : (
                    <div className="sidebar-footer-expanded">
                        <div className="sidebar-footer-user">
                            <Avatar className="sidebar-footer-avatar">
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <div className="sidebar-footer-info">
                                <div className="sidebar-footer-name">
                                    {user?.username || 'User'}
                                </div>
                                <div className="sidebar-footer-role">
                                    {userRole}
                                </div>
                            </div>
                        </div>
                        <div className="profile-link" onClick={() => navigate(`${getBasePath()}/profile`)}>
                            <RiUserLine />
                            <span>Profile</span>
                        </div>
                        <div className="sidebar-footer-logout" onClick={handleLogout}>
                            <RiLogoutCircleFill />
                            <span>Logout</span>
                        </div>
                    </div>
                )}
            </div>
        </Sider>
    );
};

export default DashboardSidebar;
