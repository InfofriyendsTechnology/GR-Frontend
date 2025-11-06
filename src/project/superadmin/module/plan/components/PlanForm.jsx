import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, Row, Col, Select, Switch, message, Space, Modal } from 'antd';
import { useCreatePlanMutation, useUpdatePlanMutation, useGetPlansQuery } from '../services/planApi';

const { Option } = Select;
const { confirm } = Modal;

const PlanForm = ({ initialValues, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [createPlan, { isLoading: isCreating }]  = useCreatePlanMutation();
    const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
    const { data: plansData, isLoading: isLoadingPlans } = useGetPlansQuery();
    const [isTrial, setIsTrial] = useState(initialValues?.isTrial || false);
    const [isLifetime, setIsLifetime] = useState(initialValues?.isLifetime || false);
    const [isActive, setIsActive] = useState(initialValues?.isActive !== undefined ? initialValues.isActive : true);
    const [isDefault, setIsDefault] = useState(initialValues?.isDefault || false);
    const [durationType, setDurationType] = useState(initialValues?.durationType || 'month');

    // Extract plans array from the response
    const plans = Array.isArray(plansData) ? plansData : plansData?.data || [];

    useEffect(() => {
        if (initialValues) {
            const values = {
                ...initialValues,
                price: typeof initialValues.price === 'string' 
                    ? Number(initialValues.price) 
                    : initialValues.price,
            };
            form.setFieldsValue(values);
            setIsTrial(values.isTrial || false);
            setIsLifetime(values.isLifetime || false);
            setIsActive(values.isActive !== undefined ? values.isActive : true);
            setIsDefault(values.isDefault || false);
            setDurationType(values.durationType || 'month');
        } else {
            // Set default values for new plans
            form.setFieldsValue({
                price: 0,
                trialDays: 0,
                duration: 1,
                durationType: 'month',
                isTrial: false,
                isLifetime: false,
                isActive: true,
                isDefault: false
            });
        }
    }, [initialValues, form]);

    // Handle default toggle - show confirmation if needed
    const handleDefaultToggle = (checked) => {
        if (checked) {
            // Find if there's already a default plan
            const existingDefaultPlan = plans.find(p => p.isDefault && (!initialValues || p.id !== initialValues.id));
            
            if (existingDefaultPlan) {
                // Show confirmation modal
                Modal.confirm({
                    title: 'Change Default Plan',
                    content: `"${existingDefaultPlan.planName}" is currently set as the default plan. Do you want to make this plan the new default plan instead?`,
                    okText: 'Yes, Change Default',
                    cancelText: 'No, Cancel',
                    onOk() {
                        setIsDefault(true);
                    },
                    onCancel() {
                        setIsDefault(false);
                    }
                });
            } else {
                setIsDefault(checked);
            }
        } else {
            setIsDefault(checked);
        }
    };

    const handleSubmit = async (values) => {
        try {
            const planData = {
                ...values,
                isTrial: isTrial,
                isLifetime: isLifetime,
                isActive: isActive,
                isDefault: isDefault,
                // If lifetime is selected, set duration to 0 and durationType to 'lifetime'
                duration: isLifetime ? 0 : values.duration,
                durationType: isLifetime ? 'lifetime' : values.durationType,
                // If not trial, set trialDays to 0
                trialDays: isTrial ? values.trialDays : 0
            };

            if (initialValues) {
                await updatePlan({ 
                    id: initialValues.id, 
                    data: planData 
                }).unwrap();
                message.success("Plan updated successfully");
            } else {
                await createPlan(planData).unwrap();
                message.success("Plan created successfully");
                // Reset form fields after creating a plan
                form.resetFields();
                // Set default values again
                form.setFieldsValue({
                    price: 0,
                    trialDays: 0,
                    duration: 1,
                    durationType: 'month',
                    isTrial: false,
                    isLifetime: false,
                    isActive: true,
                    isDefault: false
                });
                setIsTrial(false);
                setIsLifetime(false);
                setIsActive(true);
                setIsDefault(false);
                setDurationType('month');
            }
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to save plan:', error);
            message.error(error?.data?.message || "Failed to save plan");
        }
    };

    const handleDurationTypeChange = (value) => {
        setDurationType(value);
        if (value === 'lifetime') {
            setIsLifetime(true);
            form.setFieldsValue({ duration: 0 });
        } else {
            setIsLifetime(false);
            if (form.getFieldValue('duration') === 0) {
                form.setFieldsValue({ duration: 1 });
            }
        }
    };

    const handleTrialToggle = (checked) => {
        setIsTrial(checked);
        if (!checked) {
            form.setFieldsValue({ trialDays: 0 });
        } else if (form.getFieldValue('trialDays') === 0) {
            form.setFieldsValue({ trialDays: 15 });
        }
    };

    const handleLifetimeToggle = (checked) => {
        setIsLifetime(checked);
        if (checked) {
            setDurationType('lifetime');
            form.setFieldsValue({ 
                durationType: 'lifetime',
                duration: 0 
            });
        } else {
            setDurationType('month');
            form.setFieldsValue({ 
                durationType: 'month',
                duration: 1 
            });
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="plan-form"
            validateTrigger={['onChange', 'onBlur']}
        >
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="planName"
                        label="Plan Name"
                        rules={[
                            { required: true, message: 'Please enter plan name' },
                            { min: 2, message: 'Plan name must be at least 2 characters' }
                        ]}
                    >
                        <Input placeholder="Enter plan name" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="price"
                        label="Price (₹)"
                        rules={[
                            { required: true, message: 'Please enter price' },
                            { type: 'number', min: 0, message: 'Price must be at least 0' }
                        ]}
                    >
                        <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="Enter price"
                            precision={2}
                            min={0}
                        />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item label="Lifetime Plan">
                        <Switch 
                            checked={isLifetime} 
                            onChange={handleLifetimeToggle}
                        />
                        <span style={{ marginLeft: '8px' }}>
                            {isLifetime ? 'Yes' : 'No'}
                        </span>
                    </Form.Item>
                </Col>
            </Row>

            {!isLifetime && (
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Duration"
                            required={!isLifetime}
                            className="duration-combined-field"
                        >
                            <Input.Group compact>
                    <Form.Item
                                    name="duration"
                                    noStyle
                        rules={[
                                        { required: !isLifetime, message: 'Please enter duration' },
                                        { type: 'number', min: 1, message: 'Duration must be at least 1' }
                        ]}
                    >
                        <InputNumber 
                                        style={{ width: '60%' }} 
                                        placeholder="Enter duration"
                                        min={1}
                                        disabled={isLifetime}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="durationType"
                                    noStyle
                                    rules={[{ required: true, message: 'Please select duration type' }]}
                                >
                                    <Select 
                                        style={{ width: '40%' }}
                                        placeholder="Select" 
                                        onChange={handleDurationTypeChange}
                                        value={durationType}
                                        disabled={isLifetime}
                                    >
                                        <Option value="day">Day(s)</Option>
                                        <Option value="month">Month(s)</Option>
                                        <Option value="year">Year(s)</Option>
                                    </Select>
                                </Form.Item>
                            </Input.Group>
                        </Form.Item>
                    </Col>
                </Row>
            )}

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Trial Plan">
                        <Switch 
                            checked={isTrial} 
                            onChange={handleTrialToggle}
                        />
                        <span style={{ marginLeft: '8px' }}>
                            {isTrial ? 'Yes' : 'No'}
                        </span>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Default Plan">
                        <Switch 
                            checked={isDefault} 
                            onChange={handleDefaultToggle}
                        />
                        <span style={{ marginLeft: '8px' }}>
                            {isDefault ? 'Yes' : 'No'}
                        </span>
                    </Form.Item>
                </Col>
            </Row>

            {isTrial && (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="trialDays"
                            label="Trial Days"
                            rules={[
                                { required: isTrial, message: 'Please enter trial days' },
                                { type: 'number', min: 1, message: 'Trial days must be at least 1' }
                            ]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                placeholder="Enter trial days"
                                min={1}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            )}

            {initialValues && (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Active">
                            <Switch 
                                checked={isActive} 
                                onChange={(checked) => setIsActive(checked)}
                            />
                            <span style={{ marginLeft: '8px' }}>
                                {isActive ? 'Yes' : 'No'}
                            </span>
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
                    {initialValues ? 'Update' : 'Create'} Plan
                </Button>
            </div>
        </Form>
    );
};

export default PlanForm; 