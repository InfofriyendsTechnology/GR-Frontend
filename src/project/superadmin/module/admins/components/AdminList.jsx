import React from 'react';
import { Table, Space, Button, Popconfirm, message, Row, Col, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined, LoginOutlined } from '@ant-design/icons';
import { useGetAllAdminsQuery, useDeleteAdminMutation } from '../services/adminApi';
import AdminCard from './AdminCard';
import './adminList.scss';

const AdminList = ({ onEdit, viewMode }) => {
    const { data, isLoading, error } = useGetAllAdminsQuery();
    const [deleteAdmin] = useDeleteAdminMutation();

    // Transform the data to ensure it's an array
    const admins = React.useMemo(() => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.data && Array.isArray(data.data)) return data.data;
        if (data.users && Array.isArray(data.users)) return data.users;
        console.error('Unexpected data structure:', data);
        return [];
    }, [data]);

    const handleDelete = async (id) => {
        try {
            await deleteAdmin(id).unwrap();
            message.success('Admin deleted successfully');
        } catch (error) {
            message.error(error?.data?.message || 'Failed to delete admin');
        }
    };

    const getActionItems = (record) => {
        return [
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
                        title="Delete Admin"
                        description="Are you sure you want to delete this admin?"
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
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Login',
            key: 'login',
            width: 80,
            align: 'center',
            render: () => (
                <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    size="small"
                    className="login-button"
                >
                    Login
                </Button>
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
                        className="action-dot-button"
                    />
                </Dropdown>
            ),
        },
    ];

    // Handle error state
    if (error) {
        return (
            <div className="admin-list error-state">
                <p>Error loading admins: {error.message || 'Unknown error occurred'}</p>
            </div>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div className="admin-grid">
                    {admins.map(admin => (
                            <AdminCard
                                admin={admin}
                                onEdit={() => onEdit(admin)}
                                onDelete={() => handleDelete(admin.id)}
                            />
                    ))}
            </div>
        );
    }

    return (
        <div className="admin-list">
            <Table
                columns={columns}
                dataSource={admins}
                loading={isLoading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} admins`,
                }}
            />
        </div>
    );
};

export default AdminList; 