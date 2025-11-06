import React from 'react';
import { Card, Tag, Typography, Dropdown, Button, Popconfirm, message } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ShopOutlined } from '@ant-design/icons';
import { MdOutlineContactSupport } from 'react-icons/md';
import { useCreateCompanyMutation } from '../../company/services/companyApi';
import { useUpdateInquiryMutation } from '../services/inquiryApi';

const { Text, Link } = Typography;

const InquiryCard = ({ inquiry, onEdit, onView, onDelete }) => {
    const [createCompany] = useCreateCompanyMutation();
    const [updateInquiry] = useUpdateInquiryMutation();

    const handleConvertToCompany = async () => {
        try {
            // Convert inquiry data to company format
            const companyData = {
                companyName: inquiry.inquiryName,
                companyEmail: inquiry.inquiryEmail,
                companyPhone: inquiry.inquiryPhone,
                companyCategory: inquiry.inquiryCategory || 'other',
                companyAddress: inquiry.inquiryAddress || '',
                description: inquiry.description || '',
                status: 'active'
            };

            // Create new company
            await createCompany(companyData).unwrap();
            
            // Delete the inquiry after successful conversion
            await onDelete(inquiry.id);
            
            message.success('Successfully converted inquiry to company and removed the inquiry');

        } catch (error) {
            console.error('Failed to convert to company:', error);
            message.error(error?.data?.message || 'Failed to convert to company');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return 'success';
            case 'closed':
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
            onClick: () => onView?.(inquiry)
        },
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit',
            onClick: () => onEdit?.(inquiry)
        }
    ];
    
    // Only show "Convert to Company" option for open inquiries
    if (inquiry.status === 'open') {
        items.push({
            key: 'convert',
            icon: <ShopOutlined />,
            label: (
                <Popconfirm
                    title="Convert to Company"
                    description="Are you sure you want to convert this inquiry to a company?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={handleConvertToCompany}
                >
                    <div style={{ width: '100%' }}>Convert to Company</div>
                </Popconfirm>
            )
        });
    }
    
    items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: (
            <Popconfirm
                title="Delete Inquiry"
                description="Are you sure you want to delete this inquiry?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => onDelete(inquiry.id)}
            >
                <div style={{ width: '100%', color: '#ff4d4f' }}>Delete</div>
            </Popconfirm>
        ),
        danger: true
    });

    return (
        <Card className="inquiry-card">
            <div className="inquiry-card-header">
                <div className="inquiry-card-title">
                    <MdOutlineContactSupport className="inquiry-icon" />
                    <Link onClick={() => onView?.(inquiry)}>
                        {inquiry.inquiryName}
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

            <div className="inquiry-card-content">
                <div className="info-item">
                    <Text type="secondary">Email:</Text>
                    <Text>{inquiry.inquiryEmail}</Text>
                </div>
                <div className="info-item">
                    <Text type="secondary">Phone:</Text>
                    <Text>{inquiry.inquiryPhone}</Text>
                </div>
                {inquiry.inquiryCategory && (
                    <div className="info-item">
                        <Text type="secondary">Category:</Text>
                        <Text>{inquiry.inquiryCategory}</Text>
                    </div>
                )}
            </div>

            <div className="inquiry-card-footer">
                <Tag color={getPriorityColor(inquiry.priority)}>
                    {inquiry.priority?.charAt(0).toUpperCase() + inquiry.priority?.slice(1)}
                </Tag>
                <Tag color={getStatusColor(inquiry.status)}>
                    {inquiry.status?.charAt(0).toUpperCase() + inquiry.status?.slice(1)}
                </Tag>
            </div>
        </Card>
    );
};

export default InquiryCard; 