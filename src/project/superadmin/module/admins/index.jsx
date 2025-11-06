import React, { useState } from 'react';
import { Typography, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FaUserCog } from 'react-icons/fa';
import { RiLayoutGridLine, RiListUnordered } from 'react-icons/ri';
import AdminList from './components/AdminList';
import AdminForm from './components/AdminForm';
import './admins.scss';

const { Title } = Typography;

const AdminModule = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const handleAddAdmin = () => {
        setEditingAdmin(null);
        setIsModalVisible(true);
    };

    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingAdmin(null);
    };

    const handleFormSuccess = () => {
        setIsModalVisible(false);
        setEditingAdmin(null);
    };

    const modalTitle = (
        <div className="modal-title">
            <FaUserCog className="modal-icon" />
            <span>{editingAdmin ? 'Edit Admin' : 'Add Admin'}</span>
        </div>
    );

    return (
        <div className="admin-module">
            <div className="admin-header">
                <Title level={2} className="mfh_title">
                    Admins
                </Title>
                <div className="admin-header-actions">
                    <div className="view-toggle">
                        <button 
                            className={`btn-icon ${viewMode === 'list' ? 'btn-primary' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <RiListUnordered />
                        </button>
                        <button 
                            className={`btn-icon ${viewMode === 'grid' ? 'btn-primary' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <RiLayoutGridLine />
                        </button>
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={handleAddAdmin}
                    >
                        <PlusOutlined />
                        Add Admin
                    </button>
                </div>
            </div>

            <AdminList 
                onEdit={handleEditAdmin}
                viewMode={viewMode}
            />

            <Modal
                title={modalTitle}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                className="admin-modal"
                maskClosable={false}
                width={600}
                centered
            >
                <AdminForm
                    initialValues={editingAdmin}
                    onSuccess={handleFormSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </div>
    );
};

export default AdminModule;