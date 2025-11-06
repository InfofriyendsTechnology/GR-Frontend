import React from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { PiUserLight, PiLockSimpleLight, PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation, useAuth } from '../services/authApi';
import AuthLayout, { InputWrapper } from '../layout/AuthLayout';

const { Title } = Typography;

const Login = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [login, { isLoading }] = useLoginMutation();
    const { error } = useAuth();

    React.useEffect(() => {
        if (error) {
            message.error({
                content: error,
                duration: 3
            });
        }
    }, [error]);

    const onFinish = async (values) => {
        try {
            const result = await login(values).unwrap();
            if (!result.error) {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    return (
        <AuthLayout>
            {message.useMessage()[1]}
            
            <div className="auth-page-header">
                <Title level={2}>
                    Welcome to GoogleReview
                </Title>
            </div>

            <Form
                form={form}
                name="login"
                onFinish={onFinish}
                layout="vertical"
                size="large"
                className="auth-page-form"
            >
                <InputWrapper label="Email / Username">
                    <Form.Item
                        name="login"
                        rules={[
                            { required: true, message: 'Please input your email or username!' },
                            { min: 3, message: 'Must be at least 3 characters' }
                        ]}
                    >
                        <Input
                            prefix={<PiUserLight />}
                            placeholder="Enter your email or username"
                            disabled={isLoading}
                        />
                    </Form.Item>
                </InputWrapper>

                <InputWrapper label="Password">
                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                    >
                        <Input.Password
                            prefix={<PiLockSimpleLight />}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            iconRender={visible => (
                                visible ? <PiEyeSlashLight /> : <PiEyeLight />
                            )}
                        />
                    </Form.Item>
                </InputWrapper>

                <Form.Item style={{ marginBottom: '24px', textAlign: 'right' }}>
                    <Link to="/forgot-password" className="forgot-password-link">
                        Forgot Password?
                    </Link>
                </Form.Item>

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
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </div>
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default Login;
