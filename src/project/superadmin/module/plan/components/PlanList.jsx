import React from 'react';
import { Table, Card, Button, Space, Tooltip, Empty, Popconfirm, message, Dropdown, Typography, Tag } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, MoreOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useGetPlansQuery, useDeletePlanMutation } from '../services/planApi';

const { Title, Text } = Typography;

// Helper function to format duration based on type
const formatDuration = (duration, durationType, isLifetime) => {
    if (isLifetime) {
        return 'Lifetime';
        }
        
    if (!duration) {
        return 'N/A';
    }
    
    if (duration === 1) {
        return `1 ${durationType}`;
    }
    
    switch (durationType) {
        case 'day':
            return `${duration} days`;
        case 'month':
            return `${duration} months`;
        case 'year':
            return `${duration} years`;
        default:
            return `${duration} ${durationType}s`;
    }
};

const PlanList = ({ onEdit, onView, viewMode }) => {
    const { data: plans = [], isLoading } = useGetPlansQuery();
    const [deletePlan] = useDeletePlanMutation();

    const handleDelete = async (id) => {
        try {
            message.loading({ content: 'Deleting plan...', key: 'deleteMessage' });
            await deletePlan(id).unwrap();
            message.success({ content: 'Plan deleted successfully', key: 'deleteMessage', duration: 2 });
        } catch (error) {
            console.error('Failed to delete plan:', error);
            message.error({ 
                content: error?.data?.message || 'Failed to delete plan', 
                key: 'deleteMessage', 
                duration: 2 
            });
        }
    };

    const getActionItems = (record) => {
        return [
            {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View',
                onClick: () => onView(record)
            },
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => onEdit(record)
            },
            {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: (
                    <Popconfirm
                        title="Delete Plan"
                        description="Are you sure you want to delete this plan? Note: Plans assigned to companies cannot be deleted."
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <div style={{ width: '100%', color: '#ff4d4f' }}>Delete</div>
                    </Popconfirm>
                ),
                danger: true
            }
        ];
    };

    const columns = [
        {
            title: 'Plan Name',
            dataIndex: 'planName',
            key: 'planName',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    {!record.isActive && (
                        <Tag color="error">Inactive</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `₹${price}`,
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => (
                <Tooltip title={record.isLifetime ? 'Lifetime access' : `${record.duration} ${record.durationType}${record.duration > 1 ? 's' : ''}`}>
                    <span>{formatDuration(record.duration, record.durationType, record.isLifetime)}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Trial',
            key: 'trial',
            render: (_, record) => {
                if (!record.isTrial) {
                    return <Tag color="default">No Trial</Tag>;
                }
                return (
                    <Tooltip title={`${record.trialDays} days trial period`}>
                        <Tag color="blue" icon={<ClockCircleOutlined />}>
                            {record.trialDays} days
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Space>
                    {record.isLifetime && <Tag color="purple">Lifetime</Tag>}
                    {record.isTrial && <Tag color="blue">Trial</Tag>}
                    {record.isDefault && <Tag color="gold">Default</Tag>}
                    {record.isActive ? 
                        <Tag color="success">Active</Tag> : 
                        <Tag color="error">Inactive</Tag>
                    }
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={{ items: getActionItems(record) }}
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
            ),
        },
    ];

    // Ensure plans is an array
    const plansData = Array.isArray(plans) ? plans : plans?.data || [];

    if (viewMode === 'grid') {
        return (
            <div className="plan-grid">
                {plansData.length === 0 ? (
                    <Empty description="No plans found" />
                ) : (
                    plansData.map((plan) => (
                        <div key={plan.id} className={`pricing-card ${!plan.isActive ? 'inactive' : ''}`}>
                            <div className={`pricing-header ${plan.planName.toLowerCase()}`}>
                                <Text className="plan-type">
                                    {plan.planName.toUpperCase()}
                                    {!plan.isActive && <Tag color="error" style={{ marginLeft: 8 }}>Inactive</Tag>}
                                </Text>
                                <Title level={2} className="price">
                                    {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                                </Title>
                                <div className="plan-duration">
                                    {formatDuration(plan.duration, plan.durationType, plan.isLifetime)}
                                </div>
                            </div>
                            <div className="pricing-content">
                                <div className="features">
                                    {plan.isTrial && (
                                        <div className="feature-item">
                                            <CheckOutlined className="check-icon" />
                                            <Text>Trial Period: {plan.trialDays} days</Text>
                                        </div>
                                    )}
                                    <div className="feature-item">
                                        <CheckOutlined className="check-icon" />
                                        <Text>{plan.isLifetime ? 'Lifetime Access' : `Duration: ${formatDuration(plan.duration, plan.durationType, plan.isLifetime)}`}</Text>
                                    </div>
                                    <div className="feature-item">
                                        <CheckOutlined className="check-icon" />
                                        <Text>Status: {plan.isActive ? 'Active' : 'Inactive'}</Text>
                                    </div>
                                    {plan.isDefault && (
                                        <div className="feature-item">
                                            <CheckOutlined className="check-icon" />
                                            <Text><Tag color="gold">Default Plan</Tag></Text>
                                        </div>
                                    )}
                                </div>
                                <div className="pricing-actions">
                                    <Button 
                                        type="primary" 
                                        className="action-button"
                                        onClick={() => onEdit(plan)}
                                    >
                                        Edit Plan
                                    </Button>
                                    <Dropdown
                                        menu={{ items: getActionItems(plan) }}
                                        trigger={['click']}
                                        placement="bottomRight"
                                        arrow={{ pointAtCenter: true }}
                                    >
                                        <Button 
                                            type="text" 
                                            icon={<MoreOutlined />}
                                            className="more-actions"
                                        />
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    }

    return (
        <Table
            columns={columns}
            dataSource={plansData}
            loading={isLoading}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} plans`,
            }}
        />
    );
};

export default PlanList; 