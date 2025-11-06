import React, { useState } from 'react';
import { Layout, Button, Space, Avatar, Dropdown, Badge } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCurrentUser, selectUserRole } from '../../../auth/services/authSlice';
import { useLogout } from '../../../utils/hooks/useLogout';
import { 
    RiMenuFoldLine,
    RiMenuUnfoldLine,
    RiUser3Line,
    RiLogoutCircleLine,
    RiNotification3Line,
    RiFileTextLine,
    RiTeamLine,
    RiShieldLine,
    RiSettings4Line,
    RiGroupLine,
    RiSettings3Line
} from 'react-icons/ri';
import ThemeDrawer from '../../../common/theme/ThemeDrawer';
import './styles.scss';

const { Header } = Layout;

const DashboardHeader = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const userRole = useSelector(selectUserRole);
    const handleLogout = useLogout();
    const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);

    const handleProfileClick = () => {
        const basePath = userRole === 'super-admin' ? '/super-admin' : '/dashboard';
        navigate(`${basePath}/profile`);
    };

    const items = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <RiUser3Line />,
            onClick: handleProfileClick
        },
        {
            key: 'theme',
            label: 'Theme',
            icon: <RiSettings3Line />,
            onClick: () => setThemeDrawerOpen(true)
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <RiLogoutCircleLine />,
            onClick: handleLogout,
            danger: true,
            className: 'ant-dropdown-menu-item-danger'
        }
    ];

    const notificationItems = [
        {
            key: '1',
            icon: <RiGroupLine />,
            label: 'New family registered',
            onClick: () => {}
        },
        {
            key: '2',
            icon: <RiTeamLine />,
            label: 'New member added',
            onClick: () => {}
        },
        {
            key: '3',
            icon: <RiFileTextLine />,
            label: 'Document updated',
            onClick: () => {}
        },
        {
            key: '4',
            icon: <RiShieldLine />,
            label: 'Security alert',
            onClick: () => {}
        }
    ];

    return (
        <>
            <motion.div
                className="dashboard-header"
                initial={false}
                animate={{
                    width: `calc(100% - ${collapsed ? '80px' : '256px'})`,
                    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
                }}
            >
                <Button
                    type="text"
                    icon={collapsed ? 
                        <RiMenuUnfoldLine className="toggle-icon" /> : 
                        <RiMenuFoldLine className="toggle-icon" />
                    }
                    onClick={() => setCollapsed(!collapsed)}
                    className="dashboard-header-toggle"
                />
                
                <div className="dashboard-header-actions">
                    <Dropdown 
                        menu={{ items: notificationItems }} 
                        placement="bottomRight" 
                        arrow
                        trigger={['click']}
                    >
                        <div className="dashboard-header-notification">
                            <Badge count={5}>
                                <RiNotification3Line className="notification-icon" />
                            </Badge>
                        </div>
                    </Dropdown>
                
                    <Dropdown 
                        menu={{ items }} 
                        placement="bottomRight" 
                        arrow
                        overlayClassName="dashboard-header-profile-dropdown"
                    >
                        <div className="dashboard-header-profile">
                            <Avatar 
                                size={36} 
                                icon={<RiUser3Line />}
                                className="dashboard-header-avatar"
                            />
                            {!collapsed && (
                                <span className="dashboard-header-username" style={{ marginLeft: '12px' }}>
                                    {user?.username || 'User'}
                                </span>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </motion.div>

            <ThemeDrawer
                open={themeDrawerOpen}
                onClose={() => setThemeDrawerOpen(false)}
            />
        </>
    );
};

export default DashboardHeader;
