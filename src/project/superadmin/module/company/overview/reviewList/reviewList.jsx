import React, { useState } from 'react';
import { Table, Space, Button, Input, Upload, message, Tabs, Typography, Popconfirm, Modal, Form } from 'antd';
import { UploadOutlined, SearchOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { 
    useBulkUploadReviewsMutation,
    useGetCompanyGoogleReviewQuery,
    useUpdateGoogleReviewIndexMutation
} from '../../../reviews/services/reviewsApi';
import "./reviewList.scss";

const { Title } = Typography;

const ReviewList = ({ companyId }) => {
    const [bulkUploadReviews] = useBulkUploadReviewsMutation();
    const [updateReview] = useUpdateGoogleReviewIndexMutation();
    const { data: reviewData, isLoading } = useGetCompanyGoogleReviewQuery(companyId);
    const [activeTab, setActiveTab] = useState('unused');
    const [searchText, setSearchText] = useState({});
    const [searchedColumn, setSearchedColumn] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [form] = Form.useForm();

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

    const handleFileUpload = async (file) => {
        try {
            // First, validate file type
            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                message.error('Please upload a JSON file');
                return false;
            }

            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    let jsonData;
                    try {
                        jsonData = JSON.parse(e.target.result);
                    } catch (parseError) {
                        console.error('JSON Parse Error:', parseError);
                        message.error('Invalid JSON format. Please check your file structure.');
                        return;
                    }

                    // Validate the JSON structure
                    if (!Array.isArray(jsonData)) {
                        message.error('File must contain an array of reviews. Example format: [{"index": 1, "review": "Great service!"}]');
                        return;
                    }

                    // Validate each review object
                    const invalidReviews = jsonData.filter(item => 
                        !item || 
                        typeof item !== 'object' || 
                        !('index' in item) || 
                        !('review' in item) || 
                        typeof item.review !== 'string' ||
                        typeof item.index !== 'number'
                    );

                    if (invalidReviews.length > 0) {
                        console.error('Invalid reviews:', invalidReviews);
                        message.error(`Invalid review format found. Each review must have: {"index": number, "review": "string"}. Check console for details.`);
                        return;
                    }

                    try {
                        // Use the RTK Query mutation
                        await bulkUploadReviews({
                            companyId,
                            reviews: jsonData
                        }).unwrap();
                        
                        message.success(`Successfully uploaded ${jsonData.length} reviews`);
                    } catch (apiError) {
                        console.error('API Error:', apiError);
                        message.error(apiError?.data?.message || 'Failed to upload reviews');
                    }
                } catch (error) {
                    console.error('File Processing Error:', error);
                    message.error('Error processing the file. Please check the file format and try again.');
                }
            };

            reader.onerror = (error) => {
                console.error('FileReader Error:', error);
                message.error('Error reading the file. Please try again.');
            };

            reader.readAsText(file);
        } catch (error) {
            console.error('Upload Error:', error);
            message.error('Error processing file. Please try again.');
        }
        return false; // Prevent default upload behavior
    };

    const uploadProps = {
        beforeUpload: handleFileUpload,
        accept: '.json',
        showUploadList: false,
    };

    const handleDelete = async (record) => {
        try {
            if (!record || !record.index) {
                message.error('Invalid review');
                return;
            }
            
            await updateReview({
                companyId,
                index: record.index,
                review: null
            }).unwrap();
            
            message.success('Review deleted successfully');
        } catch (error) {
            console.error('Failed to delete review:', error);
            message.error(error?.data?.message || 'Failed to delete review');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedRowKeys.length) return;
        
        setIsDeleting(true);
        try {
            // Update each selected review to null
            const updatePromises = selectedRowKeys.map(index => 
                updateReview({
                    companyId,
                    index,
                    review: null
                }).unwrap()
            );
            
            await Promise.all(updatePromises);
            message.success(`Successfully deleted ${selectedRowKeys.length} reviews`);
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('Failed to delete reviews:', error);
            message.error('Failed to delete some reviews');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (record) => {
        setEditingReview(record);
        form.setFieldsValue({
            review: record.review
        });
        setIsEditModalVisible(true);
    };

    const handleUpdateReview = async () => {
        try {
            const values = await form.validateFields();
            await updateReview({
                companyId,
                index: editingReview.index,
                review: values.review
            }).unwrap();
            
            message.success('Review updated successfully');
            setIsEditModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Failed to update review:', error);
            message.error(error?.data?.message || 'Failed to update review');
        }
    };

    const columns = [
        {
            title: 'Index',
            dataIndex: 'index',
            key: 'index',
            width: 100,
            sorter: (a, b) => a.index - b.index,
        },
        {
            title: 'Review',
            dataIndex: 'review',
            key: 'review',
            ...getColumnSearchProps('review'),
            sorter: (a, b) => a.review.localeCompare(b.review),
            render: (text) => (
                <div className="review-content">
                    {text}
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Delete Review"
                        description="Are you sure you want to delete this review?"
                        onConfirm={() => handleDelete(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
    };

    // Get unused reviews by filtering out used ones
    const unusedReviews = reviewData?.data?.reviewList?.reviewList?.filter(review => {
        const isUsed = Array.isArray(reviewData?.data?.usedReviews?.usedReviews) && 
            reviewData?.data?.usedReviews?.usedReviews.some(
                usedReview => usedReview.index === review.index
            );
        return !isUsed && review.review !== null;
    }) || [];

    // Get used reviews
    const usedReviews = reviewData?.data?.usedReviews?.usedReviews || [];

    if (isLoading) {
        return <div className="review-list-loading">Loading reviews...</div>;
    }

    return (
        <div className="review-list-container">
            <div className="reviews-header">
                <Title level={2} className="mfh_title">
                    Review List
                </Title>
                <div className="reviews-header-actions">
                    <Space size={8}>
                        <div className="upload-section">
                            <Upload {...uploadProps}>
                                <Button type="primary" icon={<UploadOutlined />}>
                                    Upload JSON Reviews
                                </Button>
                            </Upload>
                        </div>
                    </Space>
                </div>
            </div>
            <div className="review-list-content">
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
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'unused',
                            label: `Unused Reviews (${unusedReviews.length})`,
                            children: (
                                <Table 
                                    dataSource={unusedReviews}
                                    columns={columns}
                                    rowSelection={rowSelection}
                                    rowKey="index"
                                    pagination={{ 
                                        pageSize: 10,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Total ${total} reviews`
                                    }}
                                    className="review-table"
                                />
                            )
                        },
                        {
                            key: 'used',
                            label: `Used Reviews (${usedReviews.length})`,
                            children: (
                                <Table 
                                    dataSource={usedReviews}
                                    columns={columns}
                                    rowSelection={rowSelection}
                                    rowKey="index"
                                    pagination={{ 
                                        pageSize: 10,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Total ${total} reviews`
                                    }}
                                    className="review-table"
                                />
                            )
                        }
                    ]}
                />
            </div>
            <Modal
                title="Edit Review"
                open={isEditModalVisible}
                onOk={handleUpdateReview}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    form.resetFields();
                }}
                okText="Update"
                cancelText="Cancel"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="review"
                        label="Review"
                        rules={[{ required: true, message: 'Please enter the review' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ReviewList;
