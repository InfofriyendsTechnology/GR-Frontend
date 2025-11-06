import React, { useState, useMemo } from 'react';
import { Table, Space, Button, Tag, Popconfirm, Typography, Dropdown, message, Input } from 'antd';
import { DeleteOutlined, EyeOutlined, MoreOutlined, SearchOutlined, LinkOutlined } from '@ant-design/icons';
import { useGetReviewsQuery, useDeleteReviewMutation } from '../services/reviewsApi';
import { useGetCompaniesQuery } from '../../company/services/companyApi';
import { useNavigate } from 'react-router-dom';
import ReviewCard from './ReviewCard';

const { Link } = Typography;

const ReviewList = ({ onView, viewMode }) => {
    const navigate = useNavigate();
    const { data: reviewsResponse, isLoading: isReviewsLoading } = useGetReviewsQuery();
    const { data: companiesResponse } = useGetCompaniesQuery();
    const [deleteReview] = useDeleteReviewMutation();
    const [searchText, setSearchText] = useState({});
    const [searchedColumn, setSearchedColumn] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create a map of company IDs to their status
    const companyStatusMap = useMemo(() => {
        const companies = companiesResponse?.success ? companiesResponse.data : [];
        return companies.reduce((acc, company) => {
            acc[company.id] = company.status;
            return acc;
        }, {});
    }, [companiesResponse]);

    // Filter reviews to only show those from active companies
    const reviews = useMemo(() => {
        const allReviews = reviewsResponse?.success ? reviewsResponse.data : [];
        return allReviews.filter(review => {
            const companyStatus = companyStatusMap[review.companyId];
            return companyStatus === 'active';
        });
    }, [reviewsResponse, companyStatusMap]);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText({
            ...searchText,
            [dataIndex]: selectedKeys[0]
        });
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters, dataIndex) => {
        clearFilters();
        setSearchText({
            ...searchText,
            [dataIndex]: ''
        });
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        filteredValue: searchText[dataIndex] ? [searchText[dataIndex]] : null,
    });

    const handleDelete = async (id) => {
        try {
            if (!id) {
                message.error('Invalid review ID');
                return;
            }
            const result = await deleteReview(id).unwrap();
            if (result) {
                message.success('Review deleted successfully');
            }
        } catch (error) {
            console.error('Failed to delete review:', error);
            message.error(error?.data?.message || 'Failed to delete review');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedRowKeys.length) return;
        
        setIsDeleting(true);
        try {
            const deletePromises = selectedRowKeys.map(id => deleteReview(id).unwrap());
            await Promise.all(deletePromises);
            message.success(`Successfully deleted ${selectedRowKeys.length} reviews`);
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Failed to delete reviews:', error);
            message.error('Failed to delete some reviews');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRowClick = (record) => {
        const encodedCompanyName = encodeURIComponent(record.companyName.replace(/\s+/g, '-').toLowerCase());
        navigate(`/reviews/${encodedCompanyName}/${record.id}`);
    };

    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View',
            onClick: () => onView?.(record)
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: (
                <Popconfirm
                    title="Delete Review"
                    description="Are you sure you want to delete this review?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleDelete(record.id)}
                >
                    <span>Delete</span>
                </Popconfirm>
            ),
            danger: true
        }
    ];

    const columns = [
        {
            title: 'Company Name',
            dataIndex: 'companyName',
            key: 'companyName',
            ...getColumnSearchProps('companyName'),
            sorter: (a, b) => a.companyName.localeCompare(b.companyName),
            width: '30%',
            ellipsis: true,
        },
        {
            title: 'Review',
            dataIndex: 'review',
            key: 'review',
            ellipsis: true,
            ...getColumnSearchProps('review'),
            width: '40%',
        },
        {
            title: 'Google Review Link',
            dataIndex: 'googleReviewLink',
            key: 'googleReviewLink',
            width: '15%',
            render: (link) => (
                <Button
                    type="link"
                    icon={<LinkOutlined />}
                    href={link}
                    target="_blank"
                >
                    View
                </Button>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            width: '15%',
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
    };

    if (viewMode === 'grid') {
        return (
            <div className="review-cards-container">
                {reviews.map(review => (
                    <ReviewCard
                        key={review.id}
                        review={{
                            customerName: review.companyName,
                            reviewText: review.review,
                            date: review.createdAt,
                            googleReviewLink: review.googleReviewLink
                        }}
                        onView={() => onView?.(review)}
                        onDelete={() => handleDelete(review.id)}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="review-list">
            {selectedRowKeys.length > 0 && (
                <div className="bulk-actions">
                    <Button
                        type="primary"
                        danger
                        onClick={handleBulkDelete}
                        loading={isDeleting}
                    >
                        Delete Selected ({selectedRowKeys.length})
                    </Button>
                </div>
            )}
            <Table
                columns={columns}
                dataSource={reviews}
                rowSelection={rowSelection}
                loading={isReviewsLoading}
                rowKey="id"
                onRow={(record) => ({
                    onClick: (e) => {
                        // Only prevent click on specific interactive elements
                        if (e.target.closest('.ant-checkbox') || 
                            e.target.closest('.ant-btn') || 
                            e.target.closest('a')) {
                            return;
                        }
                        const encodedCompanyName = encodeURIComponent(record.companyName.replace(/\s+/g, '-').toLowerCase());
                        navigate(`/reviews/${encodedCompanyName}/${record.id}`);
                    },
                    style: { cursor: 'pointer' }
                })}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} reviews`,
                }}
            />
        </div>
    );
};

export default ReviewList; 