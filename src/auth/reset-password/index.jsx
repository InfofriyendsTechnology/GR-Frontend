import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { PiLockSimpleLight, PiEyeLight, PiEyeSlashLight, PiShieldCheckLight } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';
import AuthLayout, { InputWrapper } from '../layout/AuthLayout';


const { Title, Text } = Typography;

const ResetPassword = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');

    // Add responsive states
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 480);
    const [isTinyScreen, setIsTinyScreen] = useState(window.innerWidth <= 350);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            setIsSmallScreen(width <= 480);
            setIsTinyScreen(width <= 350);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const resetEmail = sessionStorage.getItem('resetEmail');
        if (!resetEmail) {
            message.error('Please complete the verification process first');
            navigate('/forgot-password');
            return;
        }
        setEmail(resetEmail);
    }, [navigate]);

    const onFinish = async (values) => {
        try {
            setIsLoading(true);
            // Add your reset password logic here
            console.log('Reset password for:', email, 'New password:', values.password);
            
            // Clear the email from session storage
            sessionStorage.removeItem('resetEmail');
            
            message.success('Password reset successfully');
            
            // Add a small delay before navigation for smooth transition
            await new Promise(resolve => setTimeout(resolve, 300));
            navigate('/login', { replace: true });
        } catch (err) {
            message.error('Failed to reset password');
            console.error('Reset password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            {message.useMessage()[1]}
            
            <div style={{
                marginBottom: isMobile ? '20px' : '40px'
            }}>
                <Title level={2} style={{ 
                    marginBottom: '8px',
                    fontSize: isSmallScreen ? '22px' : '32px',
                    color: '#000000',
                    fontWeight: '600'
                }}>
                    Set New Password
                </Title>
                <Text style={{ 
                    display: 'block', 
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontSize: isSmallScreen ? '13px' : '15px',
                    marginBottom: '4px'
                }}>
                    Please enter your new password
                </Text>
                {email && (
                    <Text style={{ 
                        display: 'block', 
                        color: '#19a7ce',
                        fontSize: isSmallScreen ? '13px' : '15px',
                        fontWeight: '500',
                        wordBreak: 'break-all'
                    }}>
                        {email}
                    </Text>
                )}
            </div>

            <Form
                form={form}
                name="resetPassword"
                onFinish={onFinish}
                layout="vertical"
                size={isMobile ? "middle" : "large"}
            >
                <InputWrapper label="New Password">
                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your new password!' },
                            { min: 8, message: 'Password must be at least 8 characters' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                message: isTinyScreen ? 
                                    'Must include: A-Z, a-z, 0-9, @$!%*?&' : 
                                    'Password must contain uppercase, lowercase, number and special character'
                            }
                        ]}
                        style={{ marginBottom: isMobile ? '16px' : '24px' }}
                    >
                        <Input.Password
                            prefix={<PiLockSimpleLight style={{ 
                                color: '#19a7ce', 
                                fontSize: isTinyScreen ? '16px' : '20px' 
                            }} />}
                            placeholder="Enter your new password"
                            style={{ 
                                height: isTinyScreen ? '40px' : '52px',
                                borderRadius: isTinyScreen ? '8px' : '12px',
                                border: '1.5px solid rgba(25, 167, 206, 0.2)',
                                fontSize: isTinyScreen ? '13px' : '15px',
                                transition: 'all 0.3s ease',
                                backgroundColor: 'rgba(25, 167, 206, 0.02)',
                                padding: '0 16px'
                            }}
                            className="custom-input"
                            disabled={isLoading}
                            iconRender={visible => (
                                visible ? 
                                    <PiEyeLight style={{ 
                                        color: '#19a7ce', 
                                        fontSize: isTinyScreen ? '16px' : '20px' 
                                    }} /> : 
                                    <PiEyeSlashLight style={{ 
                                        color: '#19a7ce', 
                                        fontSize: isTinyScreen ? '16px' : '20px' 
                                    }} />
                            )}
                        />
                    </Form.Item>
                </InputWrapper>

                <InputWrapper label="Confirm Password">
                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match!'));
                                },
                            }),
                        ]}
                        style={{ marginBottom: isMobile ? '16px' : '24px' }}
                    >
                        <Input.Password
                            prefix={<PiLockSimpleLight style={{ 
                                color: '#19a7ce', 
                                fontSize: isTinyScreen ? '16px' : '20px' 
                            }} />}
                            placeholder="Confirm your new password"
                            style={{ 
                                height: isTinyScreen ? '40px' : '52px',
                                borderRadius: isTinyScreen ? '8px' : '12px',
                                border: '1.5px solid rgba(25, 167, 206, 0.2)',
                                fontSize: isTinyScreen ? '13px' : '15px',
                                transition: 'all 0.3s ease',
                                backgroundColor: 'rgba(25, 167, 206, 0.02)',
                                padding: '0 16px'
                            }}
                            className="custom-input"
                            disabled={isLoading}
                            iconRender={visible => (
                                visible ? 
                                    <PiEyeLight style={{ 
                                        color: '#19a7ce', 
                                        fontSize: isTinyScreen ? '16px' : '20px' 
                                    }} /> : 
                                    <PiEyeSlashLight style={{ 
                                        color: '#19a7ce', 
                                        fontSize: isTinyScreen ? '16px' : '20px' 
                                    }} />
                            )}
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
                        style={{
                            height: isTinyScreen ? '40px' : '52px',
                            borderRadius: isTinyScreen ? '8px' : '12px',
                            fontSize: isTinyScreen ? '14px' : '16px',
                            fontWeight: '600',
                            background: 'linear-gradient(45deg, #19a7ce 0%, #19a7ce 100%)',
                            border: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(25, 167, 206, 0.2)',
                            marginTop: isMobile ? '8px' : '16px'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                            {!isLoading && <span style={{ fontSize: isTinyScreen ? '16px' : '20px' }}>→</span>}
                        </div>
                    </Button>
                </Form.Item>

                {!isMobile && (
                    <div style={{
                        marginTop: '32px',
                        textAlign: 'center',
                        padding: isTinyScreen ? '12px' : '16px',
                        background: 'rgba(25, 167, 206, 0.05)',
                        borderRadius: isTinyScreen ? '8px' : '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <PiShieldCheckLight style={{ 
                            color: '#19a7ce', 
                            fontSize: isTinyScreen ? '16px' : '20px' 
                        }} />
                        <Text style={{
                            color: 'rgba(0, 0, 0, 0.6)',
                            fontSize: isTinyScreen ? '12px' : '14px',
                            margin: 0
                        }}>
                            Your password will be securely updated
                        </Text>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
};

export default ResetPassword; 