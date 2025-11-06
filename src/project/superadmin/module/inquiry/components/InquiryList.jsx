import React, { useState } from 'react';
import { Table, Space, Button, Tag, Popconfirm, Typography, Dropdown, message, Input, Switch, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined, SearchOutlined, ShopOutlined } from '@ant-design/icons';
import { useGetInquiriesQuery, useDeleteInquiryMutation, useUpdateInquiryMutation } from '../services/inquiryApi';
import { useCreateCompanyMutation } from '../../company/services/companyApi';
import InquiryCard from './InquiryCard';

const { Link } = Typography;

const InquiryList = ({ onEdit, onView, viewMode }) => {
    const { data: response, isLoading } = useGetInquiriesQuery();
    const [deleteInquiry] = useDeleteInquiryMutation();
    const [updateInquiry] = useUpdateInquiryMutation();
    const [createCompany] = useCreateCompanyMutation();
    const [searchText, setSearchText] = useState({});
    const [searchedColumn, setSearchedColumn] = useState('');
    const [filteredStatus, setFilteredStatus] = useState(null);
    const [filteredPriority, setFilteredPriority] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

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
                message.error('Invalid inquiry ID');
                return;
            }
            const result = await deleteInquiry(id).unwrap();
            if (result) {
                message.success('Inquiry deleted successfully');
            }
        } catch (error) {
            console.error('Failed to delete inquiry:', error);
            message.error(error?.data?.message || 'Failed to delete inquiry');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedRowKeys.length) return;
        
        setIsDeleting(true);
        try {
            const deletePromises = selectedRowKeys.map(id => deleteInquiry(id).unwrap());
            await Promise.all(deletePromises);
            message.success(`Successfully deleted ${selectedRowKeys.length} inquiries`);
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Failed to delete inquiries:', error);
            message.error('Failed to delete some inquiries');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusToggle = async (record, checked) => {
        try {
            const newStatus = checked ? 'open' : 'closed';
            await updateInquiry({ 
                id: record.id, 
                data: { ...record, status: newStatus }
            }).unwrap();
            message.success(`Inquiry status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update inquiry status:', error);
            message.error('Failed to update status');
        }
    };

    const handleConvertToCompany = async (inquiry) => {
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
            await deleteInquiry(inquiry.id).unwrap();
            
            message.success('Successfully converted inquiry to company and removed the inquiry');

        } catch (error) {
            console.error('Failed to convert to company:', error);
            message.error(error?.data?.message || 'Failed to convert to company');
        }
    };

    const getActionItems = (record) => {
        const baseItems = [
            {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View',
                onClick: () => onView?.(record)
            },
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => onEdit(record)
            }
        ];
        
        // Only show "Convert to Company" option for open inquiries
        if (record.status === 'open') {
            baseItems.push({
                key: 'convert',
                icon: <ShopOutlined />,
                label: (
                    <Popconfirm
                        title="Convert to Company"
                        description="Are you sure you want to convert this inquiry to a company?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleConvertToCompany(record)}
                    >
                        <div style={{ width: '100%' }}>Convert to Company</div>
                    </Popconfirm>
                )
            });
        }
        
        baseItems.push({
            key: 'delete',
            icon: <DeleteOutlined />,
            label: (
                <Popconfirm
                    title="Delete Inquiry"
                    description="Are you sure you want to delete this inquiry?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleDelete(record.id)}
                >
                    <div style={{ width: '100%', color: '#ff4d4f' }}>Delete</div>
                </Popconfirm>
            ),
            danger: true
        });
        
        return baseItems;
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'inquiryName',
            key: 'inquiryName',
            sorter: (a, b) => a.inquiryName.localeCompare(b.inquiryName),
            ...getColumnSearchProps('inquiryName'),
        },
        {
            title: 'Email',
            dataIndex: 'inquiryEmail',
            key: 'inquiryEmail',
            sorter: (a, b) => a.inquiryEmail.localeCompare(b.inquiryEmail),
            ...getColumnSearchProps('inquiryEmail'),
        },
        {
            title: 'Phone',
            dataIndex: 'inquiryPhone',
            key: 'inquiryPhone',
            ...getColumnSearchProps('inquiryPhone'),
        },
        {
            title: 'Category',
            dataIndex: 'inquiryCategory',
            key: 'inquiryCategory',
            filters: [
                { text: 'General', value: 'general' },
                { text: 'Technical', value: 'technical' },
                { text: 'Billing', value: 'billing' },
                { text: 'Support', value: 'support' },
            ],
            onFilter: (value, record) => record.inquiryCategory === value,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            filters: [
                { text: 'High', value: 'high' },
                { text: 'Medium', value: 'medium' },
                { text: 'Low', value: 'low' },
            ],
            filteredValue: filteredPriority ? [filteredPriority] : null,
            onFilter: (value, record) => record.priority?.toLowerCase() === value?.toLowerCase(),
            filterMultiple: false,
            render: (priority) => (
                <div className={`status-indicator ${priority?.toLowerCase()}`}>
                    {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Open', value: 'open' },
                { text: 'Closed', value: 'closed' },
            ],
            filteredValue: filteredStatus ? [filteredStatus] : null,
            onFilter: (value, record) => record.status?.toLowerCase() === value?.toLowerCase(),
            filterMultiple: false,
            render: (status, record) => (
                <div className="status-toggle">
                    <Switch
                        checked={status === 'open'}
                        onChange={(checked) => handleStatusToggle(record, checked)}
                        checkedChildren="Open"
                        unCheckedChildren="Closed"
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
        if (filteredPriority) {
            data = data.filter(item => item.priority?.toLowerCase() === filteredPriority.toLowerCase());
        }
        return data;
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    if (viewMode === 'grid') {
        return (
            <div className="inquiry-grid">
                {getFilteredData().map(inquiry => (
                    <InquiryCard
                        key={inquiry.id}
                        inquiry={inquiry}
                        onEdit={onEdit}
                        onView={onView}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="inquiry-list">
            {selectedRowKeys.length > 0 && (
                <div className="bulk-actions animate-slide">
                    <Popconfirm
                        title="Delete Selected Inquiries"
                        description={`Are you sure you want to delete ${selectedRowKeys.length} ${selectedRowKeys.length === 1 ? 'inquiry' : 'inquiries'}?`}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={handleBulkDelete}
                    >
                        <Button 
                            type="primary" 
                            danger
                            icon={<DeleteOutlined />}
                            loading={isDeleting}
                        >
                            Delete Selected ({selectedRowKeys.length})
                        </Button>
                    </Popconfirm>
                </div>
            )}
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={getFilteredData()}
                loading={isLoading}
                rowKey="id"
                onChange={(pagination, filters) => {
                    if (filters.status) {
                        setFilteredStatus(filters.status[0]);
                    } else {
                        setFilteredStatus(null);
                    }
                    if (filters.priority) {
                        setFilteredPriority(filters.priority[0]);
                    } else {
                        setFilteredPriority(null);
                    }
                }}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} inquiries`,
                }}
                className="inquiry-table"
            />
        </div>
    );
};

export default InquiryList; 