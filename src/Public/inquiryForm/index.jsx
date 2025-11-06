import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiHome, FiFileText, FiGrid, FiSend } from 'react-icons/fi';
import './inquiryForm.scss';
import { useCreateInquiryMutation } from '../../project/superadmin/module/inquiry/services/inquiryApi';

const { TextArea } = Input;

const PublicInquiryForm = () => {
    const [form] = Form.useForm();
    const [createInquiry, { isLoading }] = useCreateInquiryMutation();

    const onFinish = async (values) => {
        try {
            // Set default priority as low
            const dataToSubmit = {
                ...values,
                priority: 'low'
            };
            const result = await createInquiry(dataToSubmit).unwrap();
            if (result.success) {
                message.success('Thank you! Your inquiry has been submitted successfully.');
                form.resetFields();
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to submit inquiry. Please try again.');
        }
    };

    const formAnimation = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const inputAnimation = {
        hidden: { opacity: 0, x: -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="public-inquiry-form">
            <motion.div 
                className="form-container"
                initial="hidden"
                animate="visible"
                variants={formAnimation}
            >
                <motion.div 
                    className="form-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h1>Inquiry Form</h1>
                    <p className="subtitle">Please fill out the form below</p>
                </motion.div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="inquiry-form"
                    initialValues={{
                        inquiryCategory: ''
                    }}
                >
                    <motion.div 
                        variants={inputAnimation}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                    >
                            <Form.Item
                                name="inquiryName"
                                label="Full Name"
                                rules={[
                                    { required: true, message: 'Please enter your name' },
                                    { min: 2, message: 'Name must be at least 2 characters' }
                                ]}
                            >
                                <Input 
                                prefix={<FiUser className="site-form-item-icon" />}
                                    placeholder="Enter your full name"
                                />
                            </Form.Item>
                    </motion.div>

                    <div className="form-row">
                        <motion.div 
                            className="form-col"
                            variants={inputAnimation}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.4 }}
                        >
                            <Form.Item
                                name="inquiryEmail"
                                label="Email Address"
                                rules={[
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                            >
                                <Input 
                                    prefix={<FiMail className="site-form-item-icon" />}
                                    placeholder="Enter your email address"
                                />
                            </Form.Item>
                        </motion.div>

                        <motion.div 
                            className="form-col"
                            variants={inputAnimation}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.5 }}
                        >
                            <Form.Item
                                name="inquiryPhone"
                                label="Phone Number"
                                rules={[
                                    { required: true, message: 'Please enter your phone number' },
                                    { pattern: /^[0-9\-+() \.]{8,20}$/, message: 'Please enter a valid phone number' }
                                ]}
                            >
                                <Input 
                                    prefix={<FiPhone className="site-form-item-icon" />}
                                    placeholder="Enter your phone number"
                                />
                            </Form.Item>
                        </motion.div>
                    </div>

                    <motion.div 
                        variants={inputAnimation}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.6 }}
                        className="category-field"
                    >
                            <Form.Item
                                name="inquiryCategory"
                            label="Business Category"
                                rules={[
                                { required: true, message: 'Please enter your business category' },
                                { min: 2, message: 'Category must be at least 2 characters' }
                            ]}
                        >
                            <Input 
                                prefix={<FiGrid className="site-form-item-icon" />}
                                placeholder="Enter your business category (e.g. Technology, Retail, Healthcare)"
                            />
                            </Form.Item>
                    </motion.div>

                    <motion.div 
                        variants={inputAnimation}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.7 }}
                    >
                            <Form.Item
                                name="inquiryAddress"
                            label="City"
                            className="city-field"
                            >
                            <Input 
                                prefix={<FiHome className="site-form-item-icon" />}
                                placeholder="Enter your city"
                                />
                            </Form.Item>
                    </motion.div>

                    <motion.div 
                        variants={inputAnimation}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.8 }}
                    >
                            <Form.Item
                                name="description"
                                label="Message"
                                rules={[
                                    { min: 10, message: 'Description must be at least 10 characters' }
                                ]}
                            >
                                <TextArea 
                                    placeholder="Please describe your inquiry in detail"
                                    autoSize={{ minRows: 4, maxRows: 6 }}
                                />
                            </Form.Item>
                    </motion.div>

                    <motion.div 
                        className="form-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                    >
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            loading={isLoading}
                            size="large"
                            icon={<FiSend />}
                            className="submit-button"
                        >
                            Submit an inquiry
                        </Button>
                    </motion.div>
                </Form>
            </motion.div>
        </div>
    );
};

export default PublicInquiryForm;
