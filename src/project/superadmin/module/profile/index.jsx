import React from 'react';
import { Typography, Button } from 'antd';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { RiUser3Line, RiMailLine, RiPhoneLine, RiShieldUserLine, RiTimeLine, RiLockPasswordLine } from 'react-icons/ri';
import './styles.scss';

const { Title, Text } = Typography;

const Profile = () => {
    const user = useSelector(selectCurrentUser);

    return (
        <div className="profile">
            <div className="profile-header">
            <Title level={2} className="mfh_title">
                    Profile Settings
            </Title>
                <Button type="primary" className="edit-profile-btn">
                    Edit Profile
                </Button>
            </div>

            <div className="profile-content">
                <div className="profile-card main-info">
                    <div className="profile-card-header">
                        <div className="profile-avatar">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="profile-title">
                            <Title level={3}>{user?.username || 'Username'}</Title>
                            <div className="profile-subtitle">
                                <div className={`status-badge ${user?.status || 'active'}`}>
                                    {user?.status || 'Active'}
                                </div>
                                <div className="role-badge">
                                    {user?.role || 'Super Admin'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-info-grid">
                        <div className="info-item">
                            <div className="info-icon">
                                <RiUser3Line />
                            </div>
                            <div className="info-content">
                                <Text type="secondary">Username</Text>
                                <Text strong>{user?.username}</Text>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <RiMailLine />
                            </div>
                            <div className="info-content">
                                <Text type="secondary">Email</Text>
                                <Text strong>{user?.email}</Text>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <RiPhoneLine />
                            </div>
                            <div className="info-content">
                                <Text type="secondary">Phone</Text>
                                <Text strong>{user?.phone || '999999999'}</Text>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <RiShieldUserLine />
                            </div>
                            <div className="info-content">
                                <Text type="secondary">Created By</Text>
                                <Text strong>{user?.created_by || 'SUPER_ADMIN'}</Text>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-card security-info">
                    <Title level={4} className="section-title">
                        Security Settings
                    </Title>

                    <div className="security-items">
                        <div className="security-item">
                            <div className="security-icon">
                                <RiLockPasswordLine />
                            </div>
                            <div className="security-content">
                                <div className="security-text">
                                    <Text strong>Two Factor Authentication</Text>
                                    <Text type="secondary">Add an extra layer of security to your account</Text>
                                </div>
                                <div className="status-badge inactive">Disabled</div>
                            </div>
                        </div>

                        <div className="security-item">
                            <div className="security-icon">
                                <RiTimeLine />
                            </div>
                            <div className="security-content">
                                <div className="security-text">
                                    <Text strong>Last Login</Text>
                                    <Text type="secondary">{new Date().toLocaleString()}</Text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 