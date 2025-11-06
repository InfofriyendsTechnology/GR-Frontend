import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './header';
import DashboardSidebar from './sidebar';
import DashboardFooter from './footer';
import './styles.scss';

const { Content } = Layout;

const DashboardLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout className="dashboard-layout">
            <DashboardSidebar collapsed={collapsed} />
            
            <Layout 
                className={`dashboard-layout-main ${!collapsed ? 'expanded' : ''}`}
            >
                <DashboardHeader 
                    collapsed={collapsed} 
                    setCollapsed={setCollapsed} 
                />
                
                <Content className="dashboard-layout-content">
                    <Outlet />
                </Content>

                <DashboardFooter />
            </Layout>
        </Layout>
    );
};

export default DashboardLayout; 