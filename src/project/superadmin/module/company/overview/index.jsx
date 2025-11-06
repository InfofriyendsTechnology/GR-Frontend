import React from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Result } from 'antd';
import { useGetCompanyQuery } from '../services/companyApi';
import CompanyProfileCard from './comananyCard/CompanyProfileCard';
import './companyOverview.scss';
import StatsCards from './statsCards/StatsCards';
import ReviewList from './reviewList/reviewList';

const CompanyOverview = () => {
    const { id } = useParams();
    const { data: response, isLoading, error } = useGetCompanyQuery(id);

    if (isLoading) {
        return (
            <div className="company-overview-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Result
                status="error"
                title="Failed to load company details"
                subTitle={error?.data?.message || 'Please try again later'}
            />
        );
    }

    if (!response?.success || !response?.data) {
        return (
            <Result
                status="warning"
                title="No Company Found"
                subTitle="The company you're looking for doesn't exist"
            />
        );
    }

    return (
        <div className="company-overview">
            <CompanyProfileCard company={response.data} />
            <StatsCards companyId={id} />
            <ReviewList companyId={id}/>
        </div>
    );
};

export default CompanyOverview;