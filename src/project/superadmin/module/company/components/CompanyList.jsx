import React, { useState, useMemo } from 'react';
import { Table, Space, Button, Tag, Popconfirm, Typography, Dropdown, message, Input, Switch, Select, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined, SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useGetCompaniesQuery, useDeleteCompanyMutation, useUpdateCompanyMutation } from '../services/companyApi';
import { useGetSubscriptionsQuery, useUpdateSubscriptionMutation, useCreateSubscriptionMutation } from '../../subscription/services/subscriptionApi';
import { useGetPlansQuery } from '../../plan/services/planApi';
import './companyList.scss';
import { useNavigate } from 'react-router-dom';

const { Text, Link } = Typography;
const { Option } = Select;

const CompanyList = ({ onEdit, onView, viewMode }) => {
    const { data: response, isLoading } = useGetCompaniesQuery();
    const [deleteCompany] = useDeleteCompanyMutation();
    const [updateCompany] = useUpdateCompanyMutation();
    const { data: subscriptionsResponse } = useGetSubscriptionsQuery();
    const [updateSubscription] = useUpdateSubscriptionMutation();
    const [createSubscription] = useCreateSubscriptionMutation();
    const { data: plansResponse } = useGetPlansQuery();
    const [searchText, setSearchText] = useState({});
    const [searchedColumn, setSearchedColumn] = useState('');
    const [filteredStatus, setFilteredStatus] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText({
            ...searchText,
            [dataIndex]: selectedKeys[0]
        });
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters, dataIndex) => {
        clearFilters();
        setSearchText({
            ...searchText,
            [dataIndex]: ''
        });
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        filteredValue: searchText[dataIndex] ? [searchText[dataIndex]] : null,
    });

    const handleDelete = async (id) => {
        try {
            if (!id) {
                message.error('Invalid company ID');
                return;
            }
            const result = await deleteCompany(id).unwrap();
            if (result) {
                message.success('Company deleted successfully');
            }
        } catch (error) {
            console.error('Failed to delete company:', error);
            message.error(error?.data?.message || 'Failed to delete company');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedRowKeys.length) return;
        
        setIsDeleting(true);
        try {
            const deletePromises = selectedRowKeys.map(id => deleteCompany(id).unwrap());
            await Promise.all(deletePromises);
            message.success(`Successfully deleted ${selectedRowKeys.length} companies`);
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Failed to delete companies:', error);
            message.error('Failed to delete some companies');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusToggle = async (record, checked) => {
        try {
            const newStatus = checked ? 'active' : 'inactive';
            
            // If changing to inactive, also set payment status to unpaid
            if (newStatus === 'inactive') {
                await updateCompany({ 
                    id: record.id, 
                    data: { 
                        ...record, 
                        status: newStatus,
                        paymentStatus: 'unpaid'
                    }
                }).unwrap();
                message.success(`Company status updated to ${newStatus}`);
            } else {
                // If activating an inactive company, set payment status to paid and create/update subscription
                if (record.status === 'inactive') {
                    // First update company status and payment status
                    await updateCompany({ 
                        id: record.id, 
                        data: { 
                            ...record, 
                            status: newStatus,
                            paymentStatus: 'paid' // Set to paid when activating
                        }
                    }).unwrap();
                    
                    // Find default paid plan
                    const paidPlan = plansResponse?.data?.find(plan => 
                        !plan.isTrial && plan.isActive && !plan.isLifetime
                    );
                    
                    if (paidPlan) {
                        // Find existing subscription for this company
                        const existingSubscription = subscriptionsResponse?.data?.find(
                            sub => sub.companyId === record.id
                        );
                        
                        if (existingSubscription) {
                            // Update existing subscription to paid status
                            await updateSubscription({
                                id: existingSubscription.id,
                                data: {
                                    ...existingSubscription,
                                    planId: paidPlan.id,
                                    status: 'paid',
                                    isTrial: false,
                                    startDate: new Date().toISOString(),
                                    // Calculate end date based on plan duration
                                    endDate: paidPlan.isLifetime 
                                        ? new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString()
                                        : new Date(new Date().setDate(new Date().getDate() + (paidPlan.duration * (paidPlan.durationType === 'month' ? 30 : paidPlan.durationType === 'year' ? 365 : 1)))).toISOString()
                                }
                            }).unwrap();
                        } else {
                            // Create new subscription with paid plan
                            const subscriptionData = {
                                companyId: record.id,
                                planId: paidPlan.id,
                                status: 'paid',
                                isTrial: false,
                                startDate: new Date().toISOString(),
                                // Calculate end date based on plan duration
                                endDate: paidPlan.isLifetime 
                                    ? new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString()
                                    : new Date(new Date().setDate(new Date().getDate() + (paidPlan.duration * (paidPlan.durationType === 'month' ? 30 : paidPlan.durationType === 'year' ? 365 : 1)))).toISOString()
                            };
                            
                            // Create new subscription
                            await createSubscription(subscriptionData).unwrap();
                        }
                        
                        message.success(`Company activated and assigned a paid plan successfully`);
                    } else {
                        // If no paid plan found, just update company status
                        message.warning('Company activated but no paid plan was found to assign');
                    }
                } else {
                    // Just update status for already active companies
                    await updateCompany({ 
                        id: record.id, 
                        data: { ...record, status: newStatus }
                    }).unwrap();
                    message.success(`Company status updated to ${newStatus}`);
                }
            }
        } catch (error) {
            console.error('Failed to update company status:', error);
            message.error('Failed to update status');
        }
    };

    const handlePaymentStatusToggle = async (record, checked) => {
        try {
            // If checked, set to 'paid', if unchecked, set to 'trial' for the API
            // (The API will convert 'trial' to 'unpaid' for company but keep subscription as 'trial')
            const newStatus = checked ? 'paid' : 'trial';
            
            // Update company payment status
            await updateCompany({
                id: record.id,
                data: { ...record, paymentStatus: newStatus }
            }).unwrap();

            // Find and update the associated subscription
            if (subscriptionsResponse?.data) {
                const companySubscriptions = subscriptionsResponse.data.filter(
                    sub => sub.companyId === record.id
                );
                
                if (companySubscriptions.length > 0) {
                    // Get the latest subscription
                    const latestSubscription = companySubscriptions.reduce((latest, current) => {
                        return new Date(current.startDate) > new Date(latest.startDate) ? current : latest;
                    }, companySubscriptions[0]);
                    
                    // Find plan details
                    const plan = plansResponse?.data?.find(p => p.id === latestSubscription.planId);
                    
                    // Always update the subscription status
                    if (plan && latestSubscription) {
                        // For subscription: Use 'paid' when checked is true, otherwise 'trial'
                        const subscriptionStatus = checked ? 'paid' : 'trial';
                        
                        await updateSubscription({ 
                            id: latestSubscription.id, 
                            data: {
                                ...latestSubscription,
                                status: subscriptionStatus,
                                isTrial: subscriptionStatus === 'trial'
                            }
                        }).unwrap();
                    }
                }
            }
            
            message.success(`Payment status updated to ${checked ? 'paid' : 'unpaid'}`);
        } catch (error) {
            console.error('Failed to update payment status:', error);
            message.error('Failed to update payment status');
        }
    };

    const getPaymentStatusBadge = (status) => {
        // Convert 'trial' to 'unpaid' for display purposes
        const displayStatus = status === 'trial' ? 'unpaid' : status;
        
        const config = {
            'paid': { color: 'success', text: 'Paid' },
            'unpaid': { color: 'error', text: 'Unpaid' }
        };
        const { color, text } = config[displayStatus] || { color: 'default', text: displayStatus };
        return (
            <Tag color={color} className={`payment-status-badge ${displayStatus}`}>
                {text}
            </Tag>
        );
    };

    const getActionItems = (record) => {
        return [
            {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View',
                onClick: () => handleRowClick(record)
            },
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => onEdit(record)
            },
            {
                key: 'delete',
                danger: true,
                label: (
                    <Popconfirm
                        title="Delete Company"
                        description="Are you sure you want to delete this company?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DeleteOutlined />
                            Delete
                        </div>
                    </Popconfirm>
                )
            }
        ];
    };

    const columns = [
        {
            title: 'Company Name',
            dataIndex: 'companyName',
            key: 'companyName',
            sorter: (a, b) => a.companyName.localeCompare(b.companyName),
            ...getColumnSearchProps('companyName'),
        },
        {
            title: 'Email',
            dataIndex: 'companyEmail',
            key: 'companyEmail',
            sorter: (a, b) => a.companyEmail.localeCompare(b.companyEmail),
            ...getColumnSearchProps('companyEmail'),
        },
        {
            title: 'Phone',
            dataIndex: 'companyPhone',
            key: 'companyPhone',
            ...getColumnSearchProps('companyPhone'),
        },
        {
            title: 'Payment Status',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            width: 180,
            render: (status, record) => (
                <div className="payment-status-container">
                    <div className="payment-status-toggle">
                        <Switch
                            checked={record.status === 'inactive' ? false : status === 'paid'}
                            onChange={(checked) => handlePaymentStatusToggle(record, checked)}
                            checkedChildren="Paid"
                            unCheckedChildren="Unpaid"
                            className={`payment-switch ${status === 'trial' ? 'unpaid' : status}`}
                            disabled={record.status === 'inactive'}
                        />
                    </div>
                </div>
            ),
            filters: [
                { text: 'Paid', value: 'paid' },
                { text: 'Unpaid', value: 'unpaid' },
            ],
            onFilter: (value, record) => {
                // If company is inactive, it's always considered "unpaid" for filtering
                if (record.status === 'inactive') {
                    return value === 'unpaid';
                }
                
                // Handle 'trial' status as 'unpaid' for filtering
                if (value === 'unpaid' && record.paymentStatus === 'trial') {
                    return true;
                }
                return record.paymentStatus === value;
            },
        },
        {
            title: 'Plan Type',
            key: 'planType',
            width: 120,
            render: (_, record) => {
                // If company is inactive, always show Unpaid
                if (record.status === 'inactive') {
                    return (
                        <Tag color="error" className="payment-status-badge unpaid">
                            Unpaid
                        </Tag>
                    );
                }
                
                // Find the subscription for this company
                const companySubscriptions = subscriptionsResponse?.data?.filter(
                    sub => sub.companyId === record.id
                ) || [];
                
                // Get the latest subscription if available
                const latestSubscription = companySubscriptions.length > 0 
                    ? companySubscriptions.reduce((latest, current) => {
                        return new Date(current.startDate) > new Date(latest.startDate) ? current : latest;
                      }, companySubscriptions[0])
                    : null;
                
                // Check if the subscription is a trial
                const isTrial = latestSubscription?.isTrial;
                
                // If it's a trial subscription, show Trial badge
                if (isTrial) {
                    return (
                        <Tag color="warning" className="payment-status-badge trial">
                            Trial
                        </Tag>
                    );
                }
                
                // Otherwise show the payment status (Paid or Unpaid)
                const displayStatus = record.paymentStatus === 'trial' ? 'unpaid' : record.paymentStatus;
                const config = {
                    'paid': { color: 'success', text: 'Paid' },
                    'unpaid': { color: 'error', text: 'Unpaid' }
                };
                const { color, text } = config[displayStatus] || { color: 'default', text: displayStatus };
                
                return (
                    <Tag color={color} className={`payment-status-badge ${displayStatus}`}>
                        {text}
                    </Tag>
                );
            },
            filters: [
                { text: 'Trial', value: 'trial' },
                { text: 'Paid', value: 'paid' },
                { text: 'Unpaid', value: 'unpaid' },
            ],
            onFilter: (value, record) => {
                // If company is inactive, it's always considered "unpaid" for filtering
                if (record.status === 'inactive') {
                    return value === 'unpaid';
                }
                
                // Find the subscription for this company
                const companySubscriptions = subscriptionsResponse?.data?.filter(
                    sub => sub.companyId === record.id
                ) || [];
                
                // Get the latest subscription if available
                const latestSubscription = companySubscriptions.length > 0 
                    ? companySubscriptions.reduce((latest, current) => {
                        return new Date(current.startDate) > new Date(latest.startDate) ? current : latest;
                      }, companySubscriptions[0])
                    : null;
                
                if (value === 'trial') {
                    // Filter by trial status
                    return latestSubscription?.isTrial === true;
                } else {
                    // For paid/unpaid, first check if it's not a trial
                    if (latestSubscription?.isTrial === true) {
                        return false;
                    }
                    
                    // Then check payment status
                    const displayStatus = record.paymentStatus === 'trial' ? 'unpaid' : record.paymentStatus;
                    return displayStatus === value;
                }
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status, record) => (
                <div className="status-toggle">
                    <Switch
                        checked={status === 'active'}
                        onChange={(checked) => handleStatusToggle(record, checked)}
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                        className={`status-switch ${status?.toLowerCase()}`}
                    />
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            align: 'center',
            className: 'actions-cell',
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

    const getFilteredData = () => {
        let data = response?.data || [];
        if (filteredStatus) {
            data = data.filter(item => item.status?.toLowerCase() === filteredStatus.toLowerCase());
        }
        return data;
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    const handleRowClick = (record) => {
        navigate(`/super-admin/company/${record.id}`);
    };

    if (viewMode === 'grid') {
        return (
            <div className="company-grid">
                {getFilteredData().map(company => (
                    <CompanyCard
                        key={company.id}
                        company={company}
                        onEdit={onEdit}
                        onView={onView}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="company-list-container">
            {selectedRowKeys.length > 0 && (
                <div className="bulk-actions">
                    <Button
                        type="primary"
                        danger
                        onClick={handleBulkDelete}
                        loading={isDeleting}
                    >
                        Delete Selected ({selectedRowKeys.length})
                    </Button>
                </div>
            )}
            <Table
                className="company-table"
                dataSource={response?.data || []}
                columns={columns}
                loading={isLoading}
                rowKey="id"
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}
                onRow={(record) => ({
                    onClick: (e) => {
                        if (e.target.closest('.ant-dropdown') ||
                            e.target.closest('.ant-select') ||
                            e.target.closest('.ant-switch') ||
                            e.target.closest('.ant-btn') ||
                            e.target.closest('.ant-popover') ||
                            e.target.closest('.actions-cell')) {
                            return;
                        }
                        handleRowClick(record);
                    },
                    style: { cursor: 'pointer' }
                })}
            />
        </div>
    );
};

export default CompanyList; 