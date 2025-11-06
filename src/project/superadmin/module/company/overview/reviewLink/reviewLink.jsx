import React, { useState } from 'react';
import { Button, Modal, Form, Input, message, Space } from 'antd';
import { LinkOutlined, EditOutlined } from '@ant-design/icons';
import { useUpdateReviewMutation, useCreateReviewMutation } from '../../../reviews/services/reviewsApi';
import { companyApi } from '../../../company/services/companyApi';
import { useDispatch } from 'react-redux';
import './reviewLink.scss';

const ReviewLink = ({ company }) => {
    const [isEditLinkModalVisible, setIsEditLinkModalVisible] = useState(false);
    const [updateReview] = useUpdateReviewMutation();
    const [createReview] = useCreateReviewMutation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    
    const googleReview = company?.googleReview;

    const handleEditLink = () => {
        const initialLink = googleReview?.googleReviewLink || '';
        form.setFieldsValue({
            googleReviewLink: initialLink
        });
        setIsEditLinkModalVisible(true);
    };

    const handleUpdateLink = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            
            if (googleReview) {
                // Optimistic update for existing review
                const optimisticData = {
                    ...googleReview,
                    googleReviewLink: values.googleReviewLink
                };
                
                // Update the cache immediately
                dispatch(
                    companyApi.util.updateQueryData('getCompany', company.id, (draft) => {
                        if (draft?.data?.googleReview) {
                            draft.data.googleReview.googleReviewLink = values.googleReviewLink;
                        }
                    })
                );
                
                // Make the API call
                await updateReview({ 
                    id: googleReview.id, 
                    data: optimisticData
                }).unwrap();
                
                message.success('Google review link updated successfully');
            } else {
                // Create a new review with optimistic update
                const newReviewData = {
                    companyId: company.id,
                    companyName: company.companyName,
                    googleReviewLink: values.googleReviewLink
                };
                
                // Update the cache immediately
                dispatch(
                    companyApi.util.updateQueryData('getCompany', company.id, (draft) => {
                        if (draft?.data) {
                            draft.data.googleReview = {
                                id: 'temp-id', // Will be replaced when API returns
                                ...newReviewData
                            };
                        }
                    })
                );
                
                // Make the API call
                await createReview(newReviewData).unwrap();
                
                message.success('Google review link added successfully');
            }
            
            setIsEditLinkModalVisible(false);
        } catch (error) {
            console.error('Failed to update Google review link:', error);
            message.error(error?.data?.message || 'Failed to update Google review link');
            
            // Revert the optimistic update on error
            dispatch(
                companyApi.util.invalidateTags([{ type: 'Company', id: company.id }])
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="info-item">
                <LinkOutlined />
                <div className="link-container">
                    {googleReview?.googleReviewLink ? (
                        <div className="google-review-link">
                            <div className="link-text-container">
                                <a href={googleReview.googleReviewLink} target="_blank" rel="noopener noreferrer">
                                    {googleReview.googleReviewLink}
                                </a>
                            </div>
                            <Button 
                                type="text" 
                                icon={<EditOutlined />} 
                                onClick={handleEditLink}
                                size="small"
                                className="edit-link-button"
                            />
                        </div>
                    ) : (
                        <Button 
                            type="link"
                            size="small"
                            onClick={handleEditLink}
                            className="add-link-button"
                        >
                            Add Review Link
                        </Button>
                    )}
                </div>
            </div>

            <Modal
                title="Edit Google Review Link"
                open={isEditLinkModalVisible}
                onCancel={() => setIsEditLinkModalVisible(false)}
                footer={null}
                className="google-review-modal"
                maskClosable={false}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="googleReviewLink"
                        label="Google Review Link"
                        rules={[
                            { required: true, message: 'Please enter the Google Review Link' },
                            { type: 'url', message: 'Please enter a valid URL' }
                        ]}
                    >
                        <Input placeholder="https://www.google.com/maps/place/..." />
                    </Form.Item>
                    
                    <div className="modal-footer">
                        <Space>
                            <Button onClick={() => setIsEditLinkModalVisible(false)} className="cancel-button">
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                onClick={handleUpdateLink}
                                loading={loading}
                                className="ok-button"
                            >
                                OK
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default ReviewLink; 