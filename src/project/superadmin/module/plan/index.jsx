import React, { useState } from 'react';
import { Typography, Modal, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { RiLayoutGridLine, RiListUnordered } from 'react-icons/ri';
import { MdOutlinePayments } from 'react-icons/md';
import PlanList from './components/PlanList';
import PlanForm from './components/PlanForm';
import PlanView from './components/PlanView';
import './plan.scss';

const { Title } = Typography;

const PlanModule = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [viewingPlan, setViewingPlan] = useState(null);
    const [viewMode, setViewMode] = useState('list');

    const handleAddPlan = () => {
        setEditingPlan(null);
        setIsModalVisible(true);
    };

    const handleEditPlan = (plan) => {
        setEditingPlan(plan);
        setIsModalVisible(true);
    };

    const handleViewPlan = (plan) => {
        setViewingPlan(plan);
        setIsViewModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingPlan(null);
    };

    const handleViewModalClose = () => {
        setIsViewModalVisible(false);
        setViewingPlan(null);
    };

    const handleFormSuccess = () => {
        setIsModalVisible(false);
        setEditingPlan(null);
    };

    const modalTitle = (
        <div className="plan-modal-header">
            <div className="plan-modal-header-content">
                <div className="plan-modal-header-title">
                    <MdOutlinePayments /> {editingPlan ? 'Edit Plan' : 'Add Plan'}
                </div>
            </div>
        </div>
    );

    return (
        <div className="plan">
            <div className="plan-header">
                <Title level={2} className="mfh_title">
                    Plans
                </Title>
                <div className="plan-header-actions">
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
                            onClick={handleAddPlan}
                        >
                            <PlusOutlined />
                            Add Plan
                        </button>
                    </Space>
                </div>
            </div>

            <PlanList 
                onEdit={handleEditPlan}
                onView={handleViewPlan}
                viewMode={viewMode}
            />

            <Modal
                title={modalTitle}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
                className="plan-modal"
                maskClosable={true}
            >
                <PlanForm
                    initialValues={editingPlan}
                    onSuccess={handleFormSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>

            <PlanView 
                plan={viewingPlan}
                visible={isViewModalVisible}
                onClose={handleViewModalClose}
            />
        </div>
    );
};

export default PlanModule; 