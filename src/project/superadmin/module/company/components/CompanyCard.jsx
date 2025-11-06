import React from 'react';
import { Card, Tag, Typography, Dropdown, Button } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { BiBuildingHouse } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';

const { Text, Link } = Typography;

const CompanyCard = ({ company, onEdit, onDelete }) => {
    const navigate = useNavigate();

    const handleViewClick = () => {
        navigate(`/super-admin/company/${company.id}`);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'default';
            default:
                return 'default';
        }
    };

    const items = [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View',
            onClick: handleViewClick
        },
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit',
            onClick: () => onEdit?.(company)
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
            onClick: () => onDelete?.(company.id),
            danger: true
        }
    ];

    return (
        <Card className="company-card">
            <div className="company-card-header">
                <div className="company-card-title">
                    <BiBuildingHouse className="company-icon" />
                    <Link onClick={handleViewClick}>
                        {company.companyName}
                    </Link>
                </div>
                <Dropdown
                    menu={{ items }}
                    trigger={['click']}
                    placement="bottomRight"
                    arrow={{ pointAtCenter: true }}
                >
                    <Button 
                        type="text" 
                        icon={<MoreOutlined />}
                        className="action-button"
                    />
                </Dropdown>
            </div>

            <div className="company-card-content">
                <div className="info-item">
                    <Text type="secondary">Email:</Text>
                    <Text>{company.companyEmail}</Text>
                </div>
                <div className="info-item">
                    <Text type="secondary">Phone:</Text>
                    <Text>{company.companyPhone}</Text>
                </div>
                {company.companyCategory && (
                    <div className="info-item">
                        <Text type="secondary">Category:</Text>
                        <Text>{company.companyCategory}</Text>
                    </div>
                )}
            </div>

            <div className="company-card-footer">
                <Tag color={getStatusColor(company.status)}>
                    {company.status?.charAt(0).toUpperCase() + company.status?.slice(1)}
                </Tag>
            </div>
        </Card>
    );
};

export default CompanyCard; 