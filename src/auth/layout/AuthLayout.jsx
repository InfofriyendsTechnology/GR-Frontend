import React from 'react';
import { Layout } from 'antd';
import './authLayout.scss';

export const InputWrapper = ({ children, label, error }) => (
    <div className={`input-wrapper ${error ? 'has-error' : ''}`}>
        <div className="input-wrapper-label">
            {label}
        </div>
        {children}
    </div>
);

const AuthLayout = ({ children }) => {
    return (
        <Layout className="auth-layout">
            <div className="auth-layout-container">
                {children}
            </div>
        </Layout>
    );
};

export default AuthLayout; 