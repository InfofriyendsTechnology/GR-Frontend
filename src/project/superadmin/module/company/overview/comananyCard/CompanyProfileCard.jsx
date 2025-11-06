import React from 'react';
import { Typography, Tag, Avatar } from 'antd';
import { 
    MailOutlined, 
    PhoneOutlined, 
    EnvironmentOutlined, 
    TagOutlined,
    ClockCircleOutlined,
    BuildOutlined
} from '@ant-design/icons';
import ReviewLink from '../reviewLink/reviewLink.jsx';
import './companyProfileCard.scss';

const { Title, Text } = Typography;

const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const CompanyProfileCard = ({ company }) => {
    if (!company) return null;

    return (
        <div className="company-profile-wrapper">
            <div className="profile-header">
                <div className="avatar-section">
                    <Avatar size={80} className="company-avatar">
                        {getInitials(company.companyName)}
                    </Avatar>
                    <div className={`status-dot ${company.status}`} />
                </div>

                <div className="header-content">
                    <div className="title-section">
                        <Title level={2}>{company.companyName}</Title>
                        <Tag icon={<TagOutlined />} className="category-tag">
                            {company.companyCategory?.toUpperCase()}
                        </Tag>
                    </div>
                    <Text className="join-date">
                        <ClockCircleOutlined /> Member since {formatDate(company.createdAt)}
                    </Text>
                </div>
            </div>

            <div className="contact-info">
                <div className="info-item">
                    <MailOutlined />
                    <span>{company.companyEmail}</span>
                </div>
                <div className="info-item">
                    <PhoneOutlined />
                    <span>{company.companyPhone}</span>
                </div>
                <div className="info-item">
                    <EnvironmentOutlined />
                    <span>{company.companyAddress}</span>
                </div>
                
                {/* Google Review Link Component */}
                <ReviewLink company={company} />
            </div>

            {company.description && (
                <div className="about-section">
                    <h3>
                        <BuildOutlined />
                        About Company
                    </h3>
                    <p>{company.description}</p>
                </div>
            )}
        </div>
    );
};

export default CompanyProfileCard; 