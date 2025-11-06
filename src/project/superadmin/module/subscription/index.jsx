import React, { useState } from 'react';
import { Button, Modal, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SubscriptionList from './components/SubscriptionList';
import SubscriptionForm from './components/SubscriptionForm';
import './subscription.scss';

const { Title } = Typography;

const Subscription = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);

    const handleEdit = (subscription) => {
        setSelectedSubscription(subscription);
        setIsModalOpen(true);
    };

    const handleView = (subscription) => {
        // Implement view functionality
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedSubscription(null);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        setSelectedSubscription(null);
    };

    return (
        <div className="subscription-module">
            <div className="module-header ">
                <Title className="mfh_title" level={2}>Subscriptions</Title>
                <div className="module-header-actions">
                <button 
                            className="btn btn-primary btn-lg"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <PlusOutlined />
                            Add Subscription
                        </button>
                </div>
            </div>

            <SubscriptionList
                onEdit={handleEdit}
                onView={handleView}
            />

            <Modal
                title={selectedSubscription ? 'Edit Subscription' : 'Add Subscription'}
                open={isModalOpen}
                onCancel={handleModalClose}
                footer={null}
                destroyOnClose
                width={800}
            >
                <SubscriptionForm
                    initialValues={selectedSubscription}
                    onSuccess={handleSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </div>
    );
};

export default Subscription; 