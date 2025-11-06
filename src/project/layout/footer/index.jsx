import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { GithubOutlined, TwitterOutlined, LinkedinOutlined } from '@ant-design/icons';
import './styles.scss';

const { Footer } = Layout;
const { Link } = Typography;

const DashboardFooter = () => {
    return (
        <Footer className="dashboard-footer">
            <div className="dashboard-footer-content">
                <Typography.Text className="dashboard-footer-copyright">
                    © {new Date().getFullYear()} Google Reviews. All rights reserved.
                </Typography.Text>

                <Space className="dashboard-footer-links">
                    <Link href="/privacy-policy">
                        Privacy Policy
                    </Link>
                    <Link href="/terms-of-service">
                        Terms of Service
                    </Link>
                    <Space className="dashboard-footer-social">
                        <Link href="https://github.com" target="_blank">
                            <GithubOutlined />
                        </Link>
                        <Link href="https://twitter.com" target="_blank">
                            <TwitterOutlined />
                        </Link>
                        <Link href="https://linkedin.com" target="_blank">
                            <LinkedinOutlined />
                        </Link>
                    </Space>
                </Space>
            </div>
        </Footer>
    );
};

export default DashboardFooter;
