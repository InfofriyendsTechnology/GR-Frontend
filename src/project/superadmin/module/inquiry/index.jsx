import React, { useState } from 'react';
import { Button, Typography, Modal, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { RiLayoutGridLine, RiListUnordered } from 'react-icons/ri';
import { MdOutlineContactSupport } from 'react-icons/md';
import InquiryList from './components/InquiryList';
import InquiryForm from './components/InquiryForm';
import InquiryView from './components/InquiryView';
import './inquiry.scss';

const { Title } = Typography;

const InquiryModule = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingInquiry, setEditingInquiry] = useState(null);
    const [viewingInquiry, setViewingInquiry] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const handleAddInquiry = () => {
        setEditingInquiry(null);
        setIsModalVisible(true);
    };

    const handleEditInquiry = (inquiry) => {
        setEditingInquiry(inquiry);
        setIsModalVisible(true);
    };

    const handleViewInquiry = (inquiry) => {
        setViewingInquiry(inquiry);
        setIsViewModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingInquiry(null);
    };

    const handleViewModalClose = () => {
        setIsViewModalVisible(false);
        setViewingInquiry(null);
    };

    const handleFormSuccess = () => {
        setIsModalVisible(false);
        setEditingInquiry(null);
    };

    const modalTitle = (
        <div className="inquiry-modal-header">
            <div className="inquiry-modal-header-content">
                <div className="inquiry-modal-header-title">
                    <MdOutlineContactSupport /> {editingInquiry ? 'Edit Inquiry' : 'Add Inquiry'}
                </div>
            </div>
        </div>
    );

    return (
        <div className="inquiry">
            <div className="inquiry-header">
                <Title level={2} className="mfh_title">
                    Inquiries
                </Title>
                <div className="inquiry-header-actions">
                    <Space size={8}>
                        <div className="view-toggle" data-mode={viewMode}>
                            <button 
                                className={`btn btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('list')}
                            >
                                <RiListUnordered />
                            </button>
                            <button 
                                className={`btn btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <RiLayoutGridLine />
                            </button>
                        </div>
                        <button 
                            className="btn btn-primary btn-lg"
                            onClick={handleAddInquiry}
                        >
                            <PlusOutlined />
                            Add Inquiry
                        </button>
                    </Space>
                </div>
            </div>

            <InquiryList 
                onEdit={handleEditInquiry}
                onView={handleViewInquiry}
                viewMode={viewMode}
            />

            <Modal
                title={modalTitle}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
                className="inquiry-modal"
                maskClosable={true}
            >
                <InquiryForm
                    initialValues={editingInquiry}
                    onSuccess={handleFormSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>

            <InquiryView 
                inquiry={viewingInquiry}
                visible={isViewModalVisible}
                onClose={handleViewModalClose}
            />
        </div>
    );
};

export default InquiryModule; 