import React, { useState, useRef } from 'react';
import { Button, Typography, Modal, Space, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { BsBuildingsFill } from 'react-icons/bs';
import { RiLayoutGridLine, RiListUnordered } from 'react-icons/ri';
import CompanyList from './components/CompanyList';
import CompanyForm from './components/CompanyForm';
import { useBulkCreateCompaniesMutation } from './services/companyApi';
import './company.scss';

const { Title } = Typography;

const CompanyModule = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const fileInputRef = useRef(null);
    const [bulkCreateCompanies] = useBulkCreateCompaniesMutation();

    const handleAddCompany = () => {
        setEditingCompany(null);
        setIsModalVisible(true);
    };

    const handleEditCompany = (company) => {
        setEditingCompany(company);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingCompany(null);
    };

    const handleFormSuccess = () => {
        setIsModalVisible(false);
        setEditingCompany(null);
    };

    const validateCompanyData = (company) => {
        const requiredFields = ['companyName', 'companyEmail', 'companyPhone'];
        const missingFields = requiredFields.filter(field => !company[field]);
        
        if (missingFields.length > 0) {
            return `Missing required fields: ${missingFields.join(', ')}`;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(company.companyEmail)) {
            return 'Invalid email format';
        }
        
        return null;
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === "application/json") {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const jsonData = JSON.parse(e.target.result);
                        
                        // Validate that it's an array
                        if (!Array.isArray(jsonData)) {
                            message.error('JSON file must contain an array of companies');
                            return;
                        }

                        // Validate each company's data
                        const errors = [];
                        jsonData.forEach((company, index) => {
                            const error = validateCompanyData(company);
                            if (error) {
                                errors.push(`Company ${index + 1}: ${error}`);
                            }
                        });

                        if (errors.length > 0) {
                            message.error(
                                <div>
                                    <p>Validation errors:</p>
                                    <ul>
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            );
                            return;
                        }

                        // All validations passed, proceed with bulk creation
                        try {
                            await bulkCreateCompanies(jsonData).unwrap();
                            message.success(`Successfully created ${jsonData.length} companies`);
                        } catch (error) {
                            message.error(error?.data?.message || 'Failed to create companies');
                        }
                    } catch (error) {
                        message.error('Invalid JSON file format');
                    }
                };
                reader.readAsText(file);
            } else {
                message.error('Please select a JSON file');
            }
        }
        // Reset the file input
        event.target.value = '';
    };

    const modalTitle = (
        <div className="company-modal-header">
            <div className="company-modal-header-content">
                <div className="company-modal-header-title">
                    <BsBuildingsFill /> {editingCompany ? 'Edit Company' : 'Add Company'}
                </div>
            </div>
        </div>
    );

    return (
        <div className="company">
            <div className="company-header">
                <Title level={2} className="mfh_title">
                    Companies
                </Title>
                <div className="company-header-actions">
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
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".json"
                            style={{ display: 'none' }}
                        />
                        <button 
                            className="btn btn-primary btn-lg"
                            onClick={() => fileInputRef.current.click()}
                            title="Import companies from JSON"
                        >
                            <UploadOutlined />
                            Import JSON
                        </button>
                        <button 
                            className="btn btn-primary btn-lg"
                            onClick={handleAddCompany}
                        >
                            <PlusOutlined />
                            Add Company
                        </button>
                    </Space>
                </div>
            </div>

            <CompanyList 
                onEdit={handleEditCompany}
                viewMode={viewMode}
            />

            <Modal
                title={modalTitle}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
                className="company-modal"
                maskClosable={true}
            >
                <CompanyForm
                    initialValues={editingCompany}
                    onSuccess={handleFormSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </div>
    );
};

export default CompanyModule; 