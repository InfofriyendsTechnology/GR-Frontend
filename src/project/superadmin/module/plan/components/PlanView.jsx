import React from 'react';
import { Modal, Descriptions, Tag, Space } from 'antd';

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

const PlanView = ({ plan, visible, onClose }) => {
    if (!plan) return null;

    return (
        <Modal
            title="Plan Details"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            className="plan-view-modal"
        >
            <Descriptions column={1} bordered>
                <Descriptions.Item label="Plan Name">
                    {plan.planName}
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                    ₹{plan.price}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                    {formatDuration(plan.duration, plan.durationType, plan.isLifetime)}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Space>
                        {plan.isLifetime && <Tag color="purple">Lifetime</Tag>}
                        {plan.isTrial && <Tag color="blue">Trial</Tag>}
                        {plan.isDefault && <Tag color="gold">Default</Tag>}
                        {plan.isActive ? 
                            <Tag color="success">Active</Tag> : 
                            <Tag color="error">Inactive</Tag>
                        }
                    </Space>
                </Descriptions.Item>
                {plan.isTrial && (
                    <Descriptions.Item label="Trial Days">
                        {plan.trialDays} days
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Created At">
                    {new Date(plan.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                    {new Date(plan.updatedAt).toLocaleString()}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default PlanView; 