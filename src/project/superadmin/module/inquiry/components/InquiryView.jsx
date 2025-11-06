import React from 'react';
import { Modal, Typography, Button, Tag } from 'antd';
import { MdOutlineContactSupport } from 'react-icons/md';

const { Text } = Typography;

const InquiryView = ({ inquiry, visible, onClose }) => {
    if (!inquiry) return null;

    const modalTitle = (
        <div className="inquiry-modal-header">
            <div className="inquiry-modal-header-content">
                <div className="inquiry-modal-header-title">
                    <MdOutlineContactSupport /> Inquiry Details
                </div>
            </div>
        </div>
    );

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

    return (
        <Modal
            title={modalTitle}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            className="inquiry-modal"
        >
            <div className="inquiry-view">
                <div className="info-section">
                    <div className="info-row">
                        <Text type="secondary" className="label">Name</Text>
                        <Text className="value">{inquiry.inquiryName}</Text>
                    </div>

                    <div className="info-group">
                        <div className="info-row">
                            <Text type="secondary" className="label">Email</Text>
                            <Text className="value">{inquiry.inquiryEmail}</Text>
                        </div>
                        
                        <div className="info-row">
                            <Text type="secondary" className="label">Phone</Text>
                            <Text className="value">{inquiry.inquiryPhone}</Text>
                        </div>
                    </div>

                    <div className="info-group">
                        <div className="info-row">
                            <Text type="secondary" className="label">Category</Text>
                            <Text className="value">{inquiry.inquiryCategory}</Text>
                        </div>

                        <div className="info-row">
                            <Text type="secondary" className="label">Priority</Text>
                            <Tag color={getPriorityColor(inquiry.priority)}>
                                {inquiry.priority?.charAt(0).toUpperCase() + inquiry.priority?.slice(1)}
                            </Tag>
                        </div>
                    </div>

                    <div className="info-row">
                        <Text type="secondary" className="label">Status</Text>
                        <Tag color={getStatusColor(inquiry.status)}>
                            {inquiry.status?.charAt(0).toUpperCase() + inquiry.status?.slice(1)}
                        </Tag>
                    </div>

                    {inquiry.inquiryAddress && (
                        <div className="info-row">
                            <Text type="secondary" className="label">Address</Text>
                            <Text className="value">{inquiry.inquiryAddress}</Text>
                        </div>
                    )}

                    <div className="info-row">
                        <Text type="secondary" className="label">Description</Text>
                        <Text className="value">{inquiry.description}</Text>
                    </div>

                    <div className="info-group">
                        <div className="info-row">
                            <Text type="secondary" className="label">Created By</Text>
                            <Text className="value">{inquiry.created_by || 'N/A'}</Text>
                        </div>
                        
                        <div className="info-row">
                            <Text type="secondary" className="label">Updated By</Text>
                            <Text className="value">{inquiry.updated_by || 'N/A'}</Text>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
};

export default InquiryView; 