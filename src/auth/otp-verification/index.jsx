import React, { useRef, useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { PiArrowLeftLight, PiShieldCheckLight } from "react-icons/pi";
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../layout/AuthLayout';


const { Title, Text } = Typography;

const OtpVerification = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const inputs = useRef([]);

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
        const resetEmail = sessionStorage.getItem('resetEmail');
        if (!resetEmail) {
            message.error('Please submit your email first');
            navigate('/forgot-password');
            return;
        }
        setEmail(resetEmail);
    }, [navigate]);

    const handlePaste = (e, index) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        
        // If pasted data is 6 digits, distribute it across inputs
        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            // Focus the last input
            inputs.current[5].focus();
        } 
        // If pasted data is a single digit, treat it as normal input
        else if (/^\d{1}$/.test(pastedData)) {
            handleChange(pastedData, index);
        }
    };

    const handleChange = (value, index) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const onFinish = async () => {
        try {
            setIsLoading(true);
            const otpValue = otp.join('');
            // Add your OTP verification logic here
            console.log('OTP submitted:', otpValue);
            
            message.success('OTP verified successfully');
            // Navigate to reset password page (email is still in sessionStorage)
            setTimeout(() => {
                navigate('/reset-password');
            }, 1500);
        } catch (err) {
            message.error('Invalid OTP. Please try again.');
            console.error('OTP verification error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = () => {
        message.loading('Sending new code...', 1.5)
            .then(() => {
                // Add your resend code logic here
                message.success('New verification code sent');
            })
            .catch(() => {
                message.error('Failed to send new code');
            });
    };

    return (
        <AuthLayout>
            {message.useMessage()[1]}
            
            <Link 
                to="/forgot-password"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#19a7ce',
                    marginBottom: '32px',
                    fontSize: '15px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                }}
            >
                <PiArrowLeftLight style={{ fontSize: '20px' }} />
                Back to Reset Password
            </Link>

            <div style={{
                marginBottom: '40px'
            }}>
                <Title level={2} style={{ 
                    marginBottom: '8px',
                    fontSize: window.innerWidth <= 480 ? '24px' : '32px',
                    color: '#000000',
                    fontWeight: '600'
                }}>
                    Enter Verification Code
                </Title>
                <Text style={{ 
                    display: 'block', 
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontSize: window.innerWidth <= 480 ? '14px' : '15px',
                    marginBottom: '8px'
                }}>
                    We've sent a 6-digit code to your email address
                </Text>
                {email && (
                    <Text style={{ 
                        display: 'block', 
                        color: '#19a7ce',
                        fontSize: window.innerWidth <= 480 ? '14px' : '15px',
                        fontWeight: '500',
                        wordBreak: 'break-all'
                    }}>
                        {email}
                    </Text>
                )}
            </div>

            <Form
                form={form}
                name="otpVerification"
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
                <div style={{
                    display: 'flex',
                    gap: window.innerWidth <= 350 ? '8px' : '12px',
                    justifyContent: 'center',
                    marginBottom: '32px',
                    flexWrap: 'wrap'
                }}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <Input
                            key={index}
                            ref={el => inputs.current[index] = el}
                            value={otp[index]}
                            onChange={e => handleChange(e.target.value, index)}
                            onKeyDown={e => handleKeyDown(e, index)}
                            onPaste={e => handlePaste(e, index)}
                            maxLength={1}
                            style={{
                                width: window.innerWidth <= 350 ? '40px' : '52px',
                                height: window.innerWidth <= 350 ? '40px' : '52px',
                                textAlign: 'center',
                                fontSize: window.innerWidth <= 350 ? '16px' : '20px',
                                fontWeight: '600',
                                borderRadius: window.innerWidth <= 350 ? '8px' : '12px',
                                border: '1.5px solid rgba(25, 167, 206, 0.2)',
                                transition: 'all 0.3s ease',
                                backgroundColor: 'rgba(25, 167, 206, 0.02)',
                                padding: '0',
                            }}
                            className="custom-input"
                            disabled={isLoading}
                        />
                    ))}
                </div>

                <Text style={{
                    display: 'block',
                    textAlign: 'center',
                    color: 'rgba(0, 0, 0, 0.45)',
                    fontSize: window.innerWidth <= 350 ? '12px' : '13px',
                    marginBottom: '24px'
                }}>
                    You can paste your complete verification code
                </Text>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={isLoading}
                        disabled={isLoading || otp.some(digit => !digit)}
                        style={{
                            height: window.innerWidth <= 350 ? '44px' : '52px',
                            borderRadius: window.innerWidth <= 350 ? '8px' : '12px',
                            fontSize: window.innerWidth <= 350 ? '14px' : '16px',
                            fontWeight: '600',
                            background: 'linear-gradient(45deg, #19a7ce 0%, #19a7ce 100%)',
                            border: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(25, 167, 206, 0.2)'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                            {!isLoading && <span style={{ fontSize: '20px' }}>→</span>}
                        </div>
                    </Button>
                </Form.Item>

                <div style={{
                    marginTop: '24px',
                    textAlign: 'center'
                }}>
                    <Text style={{
                        color: 'rgba(0, 0, 0, 0.6)',
                        fontSize: window.innerWidth <= 350 ? '12px' : '14px'
                    }}>
                        Didn't receive the code?{' '}
                        <Button
                            type="link"
                            style={{
                                padding: 0,
                                fontSize: window.innerWidth <= 350 ? '12px' : '14px',
                                fontWeight: '500',
                                color: '#19a7ce'
                            }}
                            onClick={handleResendCode}
                        >
                            Resend Code
                        </Button>
                    </Text>
                </div>
            </Form>

            <div style={{
                marginTop: '32px',
                textAlign: 'center',
                padding: window.innerWidth <= 350 ? '12px' : '16px',
                background: 'rgba(25, 167, 206, 0.05)',
                borderRadius: window.innerWidth <= 350 ? '8px' : '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}>
                <PiShieldCheckLight style={{ 
                    color: '#19a7ce', 
                    fontSize: window.innerWidth <= 350 ? '16px' : '20px' 
                }} />
                <Text style={{
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontSize: window.innerWidth <= 350 ? '12px' : '14px',
                    margin: 0
                }}>
                    Secure verification process
                </Text>
            </div>
        </AuthLayout>
    );
};

export default OtpVerification; 