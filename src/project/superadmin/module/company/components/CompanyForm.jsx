import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, Row, Col, Button } from 'antd';
import { useCreateCompanyMutation, useUpdateCompanyMutation } from '../services/companyApi';

const { TextArea } = Input;

const CompanyForm = ({ initialValues, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
    const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    const onFinish = async (values) => {
        try {
            if (initialValues?.id) {
                await updateCompany({ id: initialValues.id, data: values }).unwrap();
            } else {
                await createCompany(values).unwrap();
            }
            onSuccess?.();
            form.resetFields();
        } catch (error) {
            console.error('Failed to save company:', error);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="company-form"
            initialValues={{
                status: 'active'
            }}
        >
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="companyName"
                        label="Company Name"
                        rules={[
                            { required: true, message: 'Please enter company name' },
                            { min: 2, message: 'Company name must be at least 2 characters' }
                        ]}
                    >
                        <Input placeholder="Enter company name" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="companyEmail"
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
                        name="companyPhone"
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
                <Col span={24}>
                    <Form.Item
                        name="companyCategory"
                        label="Category"
                        rules={[
                            { required: true, message: 'Please select category' }
                        ]}
                    >
                        <Select placeholder="Select category">
                            <Select.Option value="technology">Technology</Select.Option>
                            <Select.Option value="healthcare">Healthcare</Select.Option>
                            <Select.Option value="finance">Finance</Select.Option>
                            <Select.Option value="education">Education</Select.Option>
                            <Select.Option value="other">Other</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="companyAddress"
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
                                <Select.Option value="active">Active</Select.Option>
                                <Select.Option value="inactive">Inactive</Select.Option>
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
                    {initialValues?.id ? 'Update' : 'Create'} Company
                </Button>
            </div>
        </Form>
    );
};

export default CompanyForm; 