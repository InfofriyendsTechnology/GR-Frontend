import React, { useEffect } from 'react';
import { Form, Input, Select, Row, Col, Button } from 'antd';
import { useCreateInquiryMutation, useUpdateInquiryMutation } from '../services/inquiryApi';

const { TextArea } = Input;

const InquiryForm = ({ initialValues, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [createInquiry, { isLoading: isCreating }] = useCreateInquiryMutation();
    const [updateInquiry, { isLoading: isUpdating }] = useUpdateInquiryMutation();

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    const onFinish = async (values) => {
        try {
            if (initialValues?.id) {
                await updateInquiry({ id: initialValues.id, data: values }).unwrap();
            } else {
                await createInquiry(values).unwrap();
            }
            onSuccess?.();
            form.resetFields();
        } catch (error) {
            console.error('Failed to save inquiry:', error);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="inquiry-form"
            initialValues={{
                priority: 'low',
                status: 'open'
            }}
        >
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="inquiryName"
                        label="Name"
                        rules={[
                            { required: true, message: 'Please enter name' },
                            { min: 2, message: 'Name must be at least 2 characters' }
                        ]}
                    >
                        <Input placeholder="Enter name" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="inquiryEmail"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="Enter email" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="inquiryPhone"
                        label="Phone"
                        rules={[
                            { required: true, message: 'Please enter phone number' },
                            { 
                                pattern: /^[0-9+\-\s().]{8,20}$/, 
                                message: 'Please enter a valid phone number' 
                            }
                        ]}
                    >
                        <Input
                            placeholder="Enter phone number"
                            maxLength={20}
                            onKeyPress={(e) => {
                                // Allow only digits, +, -, (, ), spaces, and .
                                const regex = /[0-9+\-() .]/;
                                const key = String.fromCharCode(e.charCode);
                                if (!regex.test(key)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="inquiryCategory"
                        label="Category"
                        rules={[
                            { required: true, message: 'Please select category' }
                        ]}
                    >
                        <Select placeholder="Select category">
                            <Select.Option value="general">General</Select.Option>
                            <Select.Option value="technical">Technical</Select.Option>
                            <Select.Option value="billing">Billing</Select.Option>
                            <Select.Option value="support">Support</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="priority"
                        label="Priority"
                        rules={[
                            { required: true, message: 'Please select priority' }
                        ]}
                    >
                        <Select placeholder="Select priority">
                            <Select.Option value="low">Low</Select.Option>
                            <Select.Option value="medium">Medium</Select.Option>
                            <Select.Option value="high">High</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="inquiryAddress"
                        label="Address"
                    >
                        <TextArea 
                            placeholder="Enter address"
                            autoSize={{ minRows: 2, maxRows: 3 }}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            { required: true, message: 'Please enter description' }
                        ]}
                    >
                        <TextArea 
                            placeholder="Enter description"
                            autoSize={{ minRows: 2, maxRows: 3 }}
                        />
                    </Form.Item>
                </Col>
            </Row>

            {initialValues?.id && (
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[
                                { required: true, message: 'Please select status' }
                            ]}
                        >
                            <Select placeholder="Select status">
                                <Select.Option value="open">Open</Select.Option>
                                <Select.Option value="closed">Closed</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            )}

            <div className="form-actions">
                <Button onClick={onCancel}>Cancel</Button>
                <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={isCreating || isUpdating}
                >
                    {initialValues?.id ? 'Update' : 'Create'} Inquiry
                </Button>
            </div>
        </Form>
    );
};

export default InquiryForm; 