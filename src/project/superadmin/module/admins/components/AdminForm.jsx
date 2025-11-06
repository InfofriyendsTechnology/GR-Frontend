import React from 'react';
import { Form, Input, Button, Space, message } from 'antd';
import { useCreateAdminMutation, useUpdateAdminMutation } from '../services/adminApi';

const AdminForm = ({ initialValues, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [createAdmin] = useCreateAdminMutation();
    const [updateAdmin] = useUpdateAdminMutation();

    const handleSubmit = async (values) => {
        try {
            if (initialValues) {
                await updateAdmin({ 
                    id: initialValues.id, 
                    data: values
                }).unwrap();
                message.success('Admin updated successfully');
            } else {
                await createAdmin(values).unwrap();
                message.success('Admin created successfully');
            }
            onSuccess();
        } catch (error) {
            message.error(error?.data?.message || 'Operation failed');
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={initialValues}
            className="admin-form"
        >
            <Form.Item
                name="username"
                label="Username"
                rules={[
                    { required: true, message: 'Please input username!' },
                    { min: 3, message: 'Username must be at least 3 characters!' }
                ]}
            >
                <Input placeholder="Enter username" />
            </Form.Item>

            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: 'Please input email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                ]}
            >
                <Input placeholder="Enter email" />
            </Form.Item>

            {!initialValues && (
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        { required: true, message: 'Please input password!' },
                        { min: 6, message: 'Password must be at least 6 characters!' }
                    ]}
                >
                    <Input.Password placeholder="Enter password" />
                </Form.Item>
            )}

            <Form.Item className="form-actions">
                <Space>
                    <Button type="primary" htmlType="submit">
                        {initialValues ? 'Update' : 'Create'}
                    </Button>
                    <Button onClick={onCancel}>Cancel</Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default AdminForm; 