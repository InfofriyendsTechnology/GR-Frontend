import React from 'react';
import { Card, Avatar, Button, Popconfirm, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, MoreOutlined, LoginOutlined } from '@ant-design/icons';

const AdminCard = ({ admin, onEdit, onDelete }) => {
    const getActionItems = () => {
        return [
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => onEdit(admin)
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
                        onConfirm={() => onDelete(admin.id)}
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

    return (
        <Card
            className="admin-card"
            extra={
                <Dropdown
                    menu={{ items: getActionItems() }}
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
            }
        >
            <div className="admin-card-content">
                <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    className="admin-avatar"
                >
                    {admin.username?.charAt(0)?.toUpperCase()}
                </Avatar>
                <div className="admin-info">
                    <h3 className="admin-name">{admin.username}</h3>
                    <p className="admin-email">{admin.email}</p>
                </div>
            </div>
            <div className="admin-card-footer">
                <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    className="login-button"
                    block
                >
                    Login as Admin
                </Button>
            </div>
        </Card>
    );
};

export default AdminCard; 