import React, { useEffect, useState } from 'react';
import { Form, Button, Select, Row, Col, Input, Space, Alert, Typography, message } from 'antd';
import { useCreateSubscriptionMutation, useUpdateSubscriptionMutation } from '../services/subscriptionApi';
import { useGetCompaniesQuery } from '../../company/services/companyApi';
import { useGetPlansQuery } from '../../plan/services/planApi';
import moment from 'moment';

const { Option } = Select;
const { Text } = Typography;

const CustomDatePicker = ({ value, onChange, disabled = false }) => {
    // Parse the initial value if provided
    const initialDate = value ? moment(value) : moment();
    
    // State for day, month, and year
    const [day, setDay] = useState(initialDate.date());
    const [month, setMonth] = useState(initialDate.month());
    const [year, setYear] = useState(initialDate.year());
    
    // Generate options for days, months, and years
    const generateDayOptions = (selectedMonth, selectedYear) => {
        const daysInMonth = moment().year(selectedYear).month(selectedMonth).daysInMonth();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };
    
    const monthOptions = moment.months().map((month, index) => ({ 
        label: month.substring(0, 3), // Show only first 3 letters of month
        value: index 
    }));
    
    // Generate year options (current year - 2 to current year + 5)
    const currentYear = moment().year();
    const yearOptions = Array.from(
        { length: 8 }, 
        (_, i) => currentYear - 2 + i
    );
    
    const [dayOptions, setDayOptions] = useState(generateDayOptions(month, year));
    
    // Update days when month or year changes
    useEffect(() => {
        setDayOptions(generateDayOptions(month, year));
        // Adjust day if it exceeds the days in the new month
        const maxDays = moment().year(year).month(month).daysInMonth();
        if (day > maxDays) {
            setDay(maxDays);
        }
    }, [month, year]);
    
    // Update the value when day, month, or year changes
    useEffect(() => {
        if (onChange) {
            const newDate = moment().year(year).month(month).date(day);
            onChange(newDate.format('YYYY-MM-DD'));
        }
    }, [day, month, year, onChange]);
    
    return (
        <Space style={{ width: '100%' }}>
            <Select
                value={day}
                onChange={setDay}
                style={{ width: 65 }}
                disabled={disabled}
            >
                {dayOptions.map(d => (
                    <Option key={d} value={d}>{d.toString().padStart(2, '0')}</Option>
                ))}
            </Select>
            <Select
                value={month}
                onChange={setMonth}
                style={{ width: 80 }}
                disabled={disabled}
            >
                {monthOptions.map(m => (
                    <Option key={m.value} value={m.value}>{m.label}</Option>
                ))}
            </Select>
            <Select
                value={year}
                onChange={setYear}
                style={{ width: 85 }}
                disabled={disabled}
            >
                {yearOptions.map(y => (
                    <Option key={y} value={y}>{y}</Option>
                ))}
            </Select>
        </Space>
    );
};

const SubscriptionForm = ({ initialValues, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation();
    const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation();
    const [currentPlan, setCurrentPlan] = useState(null);
    const [previousPlanId, setPreviousPlanId] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    
    // Fetch companies and plans
    const { data: companiesResponse, isLoading: isLoadingCompanies } = useGetCompaniesQuery();
    const { data: plansResponse, isLoading: isLoadingPlans } = useGetPlansQuery();

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                startDate: initialValues.startDate ? initialValues.startDate : moment().format('YYYY-MM-DD'),
                endDate: initialValues.endDate ? initialValues.endDate : null
            });
            
            // Store the initial plan ID
            setPreviousPlanId(initialValues.planId);
            
            // Find and set the current plan
            if (plansResponse?.data) {
                const plan = plansResponse.data.find(p => p.id === initialValues.planId);
                if (plan) {
                    setCurrentPlan(plan);
                }
            }
            
            // Find and set the selected company
            if (companiesResponse?.data && initialValues.companyId) {
                const company = companiesResponse.data.find(c => c.id === initialValues.companyId);
                if (company) {
                    setSelectedCompany(company);
                    
                    // Set status based on company's payment status
                    const status = company.paymentStatus === 'paid' ? 'paid' : 'trial';
                    form.setFieldsValue({ status });
                }
            }
        } else {
            // Set default start date
            form.setFieldsValue({
                startDate: moment().format('YYYY-MM-DD') // Set today's date as default start date
            });
        }
    }, [initialValues, form, plansResponse, companiesResponse]);

    const onFinish = async (values) => {
        try {
            // Get company's payment status to determine subscription status
            const companyId = values.companyId;
            const company = companiesResponse?.data?.find(c => c.id === companyId);
            
            // Set status based on company's payment status
            const status = company?.paymentStatus === 'paid' ? 'paid' : 'trial';
            
            const payload = {
                ...values,
                status: status, // Ensure status is set based on company's payment status
                startDate: moment(values.startDate).toISOString(),
                endDate: values.endDate ? moment(values.endDate, 'DD/MM/YYYY').toISOString() : null,
                // Set isTrial based on status
                isTrial: status === 'trial'
            };

            if (initialValues?.id) {
                await updateSubscription({ id: initialValues.id, data: payload }).unwrap();
            } else {
                await createSubscription(payload).unwrap();
            }

            onSuccess?.();
            form.resetFields();
            message.success(`Subscription ${initialValues?.id ? 'updated' : 'created'} successfully`);
        } catch (error) {
            console.error('Failed to save subscription:', error);
            message.error(error?.data?.message || 'Failed to save subscription. Please try again.');
        }
    };

    // Handle company selection
    const handleCompanyChange = (companyId) => {
        const company = companiesResponse?.data?.find(c => c.id === companyId);
        setSelectedCompany(company);
        
        // Automatically set subscription status based on company's payment status
        if (company) {
            // Set status based on company's payment status
            const status = company.paymentStatus === 'paid' ? 'paid' : 'trial';
            form.setFieldsValue({ status });
        }
        
        // Update end date if plan is already selected
        const planId = form.getFieldValue('planId');
        if (planId && company) {
            const plan = plansResponse?.data?.find(p => p.id === planId);
            if (plan) {
                updateEndDate(plan, form.getFieldValue('startDate'));
            }
        }
    };

    // Calculate end date based on plan type and duration when plan is selected
    const handlePlanChange = (planId) => {
        const selectedPlan = plansResponse?.data?.find(plan => plan.id === planId);
        if (!selectedPlan) return;

        setCurrentPlan(selectedPlan);
        
        // Update the form fields based on the selected plan
        if (form.getFieldValue('startDate')) {
            updateEndDate(selectedPlan, form.getFieldValue('startDate'));
        }
        
        // Store the previous plan ID for comparison
        setPreviousPlanId(planId);
    };

    // Update end date when start date changes
    const handleStartDateChange = (dateString) => {
        const planId = form.getFieldValue('planId');
        if (planId && dateString) {
            const selectedPlan = plansResponse?.data?.find(plan => plan.id === planId);
            if (selectedPlan) {
                updateEndDate(selectedPlan, dateString);
            }
        }
    };

    // No longer needed as status is automatically set based on company payment status

    // Helper function to calculate end date based on plan type and start date
    const updateEndDate = (plan, startDate) => {
        let days;
        
        // Get the company's payment status
        const companyId = form.getFieldValue('companyId');
        const company = companiesResponse?.data?.find(c => c.id === companyId);
        const isPaid = company?.paymentStatus === 'paid';
        
        if (!isPaid) {
            // For trial plans - use trial days
            days = plan.trialDays > 0 ? plan.trialDays : 7; // Default to 7 days if no trial days specified
        } else {
            // For paid plans
            if (plan.isLifetime) {
                // Lifetime plans - set to 100 years
                days = 36500;
            } else {
                // Regular plans - use the plan duration
                switch (plan.durationType) {
                    case 'day':
                        days = plan.duration;
                        break;
                    case 'month':
                        days = plan.duration * 30;
                        break;
                    case 'year':
                        days = plan.duration * 365;
                        break;
                    default:
                        days = 30; // Default to 30 days
                }
            }
        }
        
        const endDate = moment(startDate).add(days, 'days').format('DD/MM/YYYY');
        form.setFieldsValue({ endDate });
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return moment(dateString).format('DD/MM/YYYY');
    };

    // Calculate the plan difference notification
    const renderPlanChangeNotification = () => {
        if (!initialValues?.id || !previousPlanId || !currentPlan) return null;
        
        const currentPlanId = form.getFieldValue('planId');
        if (previousPlanId === currentPlanId) return null;
        
        const previousPlan = plansResponse?.data?.find(p => p.id === previousPlanId);
        if (!previousPlan) return null;
        
        return (
            <Alert
                message="Plan Change Detected"
                description={`Changing from "${previousPlan.planName}" to "${currentPlan.planName}" will update the subscription's end date and status.`}
                type="info"
                showIcon
                style={{ marginBottom: '24px' }}
            />
        );
    };

    // Check if the selected plan is a combined plan
    const isSelectedPlanCombined = () => {
        const planId = form.getFieldValue('planId');
        if (!planId) return false;
        
        const selectedPlan = plansResponse?.data?.find(plan => plan.id === planId);
        return selectedPlan && selectedPlan.status === 'combined';
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="subscription-form"
        >
            {renderPlanChangeNotification()}
            
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="companyId"
                        label="Company"
                        rules={[{ required: true, message: 'Please select a company' }]}
                    >
                        <Select
                            placeholder="Select company"
                            showSearch
                            loading={isLoadingCompanies}
                            optionFilterProp="children"
                            onChange={handleCompanyChange}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {companiesResponse?.data?.map(company => (
                                <Select.Option key={company.id} value={company.id}>
                                    {company.companyName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="planId"
                        label="Plan"
                        rules={[{ required: true, message: 'Please select a plan' }]}
                    >
                        <Select
                            placeholder="Select plan"
                            showSearch
                            loading={isLoadingPlans}
                            optionFilterProp="children"
                            onChange={handlePlanChange}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {plansResponse?.data?.map(plan => (
                                <Select.Option key={plan.id} value={plan.id}>
                                    {plan.planName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="status"
                        label="Subscription Status"
                        rules={[{ required: true, message: 'Subscription status is required' }]}
                        hidden
                    >
                        <Input type="hidden" />
                    </Form.Item>
                </Col>
            </Row>

            {selectedCompany && (
                <Alert
                    message="Subscription Status"
                    description={`This company's payment status is: ${selectedCompany.paymentStatus}. The subscription will be automatically set to ${selectedCompany.paymentStatus === 'paid' ? 'Active' : 'Trial'}.`}
                    type="info"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
            )}

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="startDate"
                        label="Start Date"
                        rules={[{ required: true, message: 'Please select start date' }]}
                    >
                        <CustomDatePicker onChange={handleStartDateChange} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="endDate"
                        label="End Date"
                        rules={[{ required: true, message: 'Please select end date' }]}
                    >
                        <Input
                            style={{ width: '100%' }}
                            disabled
                            readOnly
                            placeholder="End date will be calculated"
                            value={form.getFieldValue('endDate') ? formatDate(form.getFieldValue('endDate')) : ''}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item className="form-actions">
                <Button onClick={onCancel}>Cancel</Button>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isCreating || isUpdating}
                >
                    {initialValues?.id ? 'Update' : 'Create'} Subscription
                </Button>
            </Form.Item>
        </Form>
    );
};

export default SubscriptionForm; 