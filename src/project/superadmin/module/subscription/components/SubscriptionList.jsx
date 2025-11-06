import React, { useState, useMemo } from 'react';
import { Table, Space, Button, Tag, Popconfirm, Typography, Dropdown, message, Input } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetSubscriptionsQuery, useDeleteSubscriptionMutation } from '../services/subscriptionApi';
import { useGetCompaniesQuery } from '../../company/services/companyApi';
import { useGetPlansQuery } from '../../plan/services/planApi';
import moment from 'moment';

const { Link, Text } = Typography;

const SubscriptionList = ({ onEdit, onView }) => {
    const { data: response, isLoading } = useGetSubscriptionsQuery();
    const { data: companiesResponse } = useGetCompaniesQuery();
    const { data: plansResponse } = useGetPlansQuery();
    const [deleteSubscription] = useDeleteSubscriptionMutation();
    const [searchText, setSearchText] = useState({});
    const [searchedColumn, setSearchedColumn] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create maps for quick lookup of company and plan names
    const companyMap = useMemo(() => {
        const map = new Map();
        if (companiesResponse?.data) {
            companiesResponse.data.forEach(company => {
                map.set(company.id, {
                    name: company.companyName,
                    paymentStatus: company.paymentStatus,
                    status: company.status
                });
            });
        }
        return map;
    }, [companiesResponse]);

    const planMap = useMemo(() => {
        const map = new Map();
        if (plansResponse?.data) {
            plansResponse.data.forEach(plan => {
                map.set(plan.id, {
                    name: plan.planName,
                    isTrial: plan.isTrial,
                    trialDays: plan.trialDays,
                    price: plan.price,
                    duration: plan.duration,
                    durationType: plan.durationType,
                    isLifetime: plan.isLifetime
                });
            });
        }
        return map;
    }, [plansResponse]);

    // Transform subscription data to include company and plan names
    const subscriptionData = useMemo(() => {
        if (!response?.data) return [];
        
        const now = moment();
        
        return response.data.map(subscription => {
            const planInfo = planMap.get(subscription.planId) || { 
                name: subscription.planId,
                isTrial: false,
                trialDays: 0,
                price: 0,
                duration: 0,
                durationType: 'month',
                isLifetime: false
            };
            
            const companyInfo = companyMap.get(subscription.companyId) || {
                name: subscription.companyId,
                paymentStatus: 'unpaid',
                status: 'active'
            };
            
            // Calculate subscription status
            const startDate = moment(subscription.startDate);
            const endDate = moment(subscription.endDate);
            const isExpired = endDate.isBefore(now);
            
            // Calculate days left differently for trial and regular plans
            let daysLeft;
            
            if (subscription.isTrial || subscription.status === 'trial') {
                // For trial subscriptions, calculate days left from start date based on trial days
                const trialEndDate = moment(startDate).add(subscription.trialDays || planInfo.trialDays, 'days');
                daysLeft = trialEndDate.diff(now, 'days');
            } else {
                // For regular plans, use end date
                daysLeft = endDate.diff(now, 'days');
            }
            
            // Calculate active status
            let subscriptionStatus = 'active';
            if (companyInfo.status === 'inactive') {
                subscriptionStatus = 'deactivated';
            } else if (isExpired) {
                subscriptionStatus = 'expired';
            } else if (daysLeft < 3) {
                subscriptionStatus = 'expiring';
            }
            
            return {
                ...subscription,
                companyName: companyInfo.name,
                companyPaymentStatus: companyInfo.paymentStatus,
                companyStatus: companyInfo.status,
                planName: planInfo.name,
                planIsTrial: planInfo.isTrial,
                planTrialDays: planInfo.trialDays,
                planPrice: planInfo.price,
                planDuration: planInfo.duration,
                planDurationType: planInfo.durationType,
                planIsLifetime: planInfo.isLifetime,
                subscriptionStatus,
                daysLeft: isExpired ? 0 : Math.max(0, daysLeft)
            };
        });
    }, [response, companyMap, planMap]);

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
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
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
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => {
            return record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '';
        },
        filteredValue: searchText[dataIndex] ? [searchText[dataIndex]] : null,
    });

    const handleDelete = async (id, companyName) => {
        try {
            await deleteSubscription(id).unwrap();
            message.success(`Subscription deleted successfully. Company "${companyName}" has been set to inactive.`);
        } catch (error) {
            console.error('Failed to delete subscription:', error);
            message.error(error?.data?.message || 'Failed to delete subscription');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedRowKeys.length) return;
        
        setIsDeleting(true);
        try {
            const deletePromises = selectedRowKeys.map(id => deleteSubscription(id).unwrap());
            await Promise.all(deletePromises);
            message.success(`Successfully deleted ${selectedRowKeys.length} subscriptions. Associated companies have been set to inactive.`);
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Failed to delete subscriptions:', error);
            message.error('Failed to delete some subscriptions');
        } finally {
            setIsDeleting(false);
        }
    };

    const getActionItems = (record) => [
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
            danger: true,
            label: (
                <Popconfirm
                    title="Delete Subscription"
                    description="Are you sure you want to delete this subscription? This will set the company to inactive."
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleDelete(record.id, record.companyName)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DeleteOutlined />
                        Delete
                    </div>
                </Popconfirm>
            )
        }
    ];

    // Generate appropriate tag for subscription status
    const getSubscriptionStatusTag = (status, record) => {
        const tagStyle = {
            fontWeight: '600',
            fontSize: '13px',
            backgroundColor: 'transparent',
            border: 'none',
            padding: '0',
            margin: '0'
        };
        
        // Check if company is inactive
        if (record.companyStatus === 'inactive') {
            return <Text strong style={{ ...tagStyle, color: '#999999' }}>Deactivated</Text>;
        }
        
        // Check if this is a trial subscription based on subscription status or isTrial flag
        if (record.status === 'trial' || record.isTrial === true) {
            return <Text strong style={{ ...tagStyle, color: '#fa8c16' }}>Trial</Text>;
        } else {
            return <Text strong style={{ ...tagStyle, color: '#52c41a' }}>Active</Text>;
        }
    };

    const columns = [
        {
            title: 'Company',
            dataIndex: 'companyName',
            key: 'companyName',
            ...getColumnSearchProps('companyName'),
            sorter: (a, b) => a.companyName.localeCompare(b.companyName),
        },
        {
            title: 'Plan',
            dataIndex: 'planName',
            key: 'planName',
            ...getColumnSearchProps('planName'),
            render: (text) => <div>{text}</div>,
            sorter: (a, b) => a.planName.localeCompare(b.planName),
            filters: [
                { text: 'Trial Companies', value: 'trial' },
                { text: 'Active Companies', value: 'paid' },
            ],
            onFilter: (value, record) => record.companyPaymentStatus === value,
        },
        {
            title: 'Trial Days',
            dataIndex: 'trialDays',
            key: 'trialDays',
            render: (_, record) => {
                if (record.companyStatus === 'inactive') {
                    return '-';
                }
                if (record.status === 'trial' || record.isTrial === true) {
                    return `${record.daysLeft} days left`;
                }
                return '0';
            },
            sorter: (a, b) => {
                if ((a.status === 'trial' || a.isTrial) && (b.status === 'trial' || b.isTrial)) {
                    return a.daysLeft - b.daysLeft;
                }
                return (a.status === 'trial' || a.isTrial) ? -1 : 1;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => getSubscriptionStatusTag(status, record),
            filters: [
                { text: 'Trial Plans', value: 'trial' },
                { text: 'Active Plans', value: 'paid' },
                { text: 'Deactivated', value: 'deactivated' },
                { text: 'Lifetime', value: 'lifetime' },
            ],
            onFilter: (value, record) => {
                if (value === 'deactivated') {
                    return record.companyStatus === 'inactive';
                }
                if (value === 'lifetime') {
                    return record.planIsLifetime === true;
                }
                if (value === 'trial') {
                    return record.status === 'trial' || record.isTrial === true;
                }
                if (value === 'paid') {
                    return record.status === 'paid' && !record.isTrial;
                }
                return record.status === value;
            },
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => moment(date).format('DD MMM YYYY'),
            sorter: (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix(),
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date, record) => {
                if (record.companyStatus === 'inactive') {
                    return '-';
                }
                if (record.planIsLifetime) {
                    return "Lifetime";
                }
                return moment(date).format('DD MMM YYYY');
            },
            sorter: (a, b) => moment(a.endDate).unix() - moment(b.endDate).unix(),
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

    return (
        <div className="subscription-list-container">
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
                className="subscription-table"
                dataSource={subscriptionData}
                columns={columns}
                loading={isLoading}
                rowKey="id"
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}
                rowClassName={(record) => {
                    if (record.companyStatus === 'inactive') return 'subscription-row-deactivated';
                    if (record.subscriptionStatus === 'expired') return 'subscription-row-expired';
                    if (record.subscriptionStatus === 'expiring') return 'subscription-row-expiring';
                    return '';
                }}
            />
        </div>
    );
};

export default SubscriptionList; 