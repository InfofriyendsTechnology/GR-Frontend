import React from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { PiUserLight, PiArrowLeftLight, PiShieldCheckLight } from "react-icons/pi";
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout, { InputWrapper } from '../layout/AuthLayout';

const { Title, Text } = Typography;

const ForgotPassword = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);

    const onFinish = async (values) => {
        try {
            setIsLoading(true);
            // Add your forgot password logic here
            // After successful API call:
            message.success('Verification code sent to your email');
            // Store email in session storage for OTP verification
            sessionStorage.setItem('resetEmail', values.email);
            // Navigate to OTP verification page
            navigate('/otp-verification');
        } catch (err) {
            message.error('Failed to send verification code');
            console.error('Forgot password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            {message.useMessage()[1]}
            
            <Link to="/login" className="auth-page-back-link">
                <PiArrowLeftLight />
                Back to Login
            </Link>

            <div className="auth-page-header">
                <Title level={2}>Reset Password</Title>
                <Text className="subtitle">
                    Enter your email address to receive password reset instructions
                </Text>
            </div>

            <Form
                form={form}
                name="forgotPassword"
                onFinish={onFinish}
                layout="vertical"
                size="large"
                className="auth-page-form"
            >
                <InputWrapper label="Email Address">
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email address!' },
                            { type: 'email', message: 'Please enter a valid email address!' }
                        ]}
                    >
                        <Input
                            prefix={<PiUserLight />}
                            placeholder="Enter your email address"
                            disabled={isLoading}
                        />
                    </Form.Item>
                </InputWrapper>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={isLoading}
                        disabled={isLoading}
                        className="auth-button"
                    >
                        <div className="button-content">
                            {isLoading ? 'Sending Instructions...' : 'Send Instructions'}
                            {!isLoading && <span className="icon">→</span>}
                        </div>
                    </Button>
                </Form.Item>
            </Form>

            <div className="info-box">
                <PiShieldCheckLight />
                <Text className="text">
                    Secure password reset process
                </Text>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword; 