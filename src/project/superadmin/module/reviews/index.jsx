import React, { useState } from 'react';
import { Typography, Modal, Space } from 'antd';
import { RiLayoutGridLine, RiListUnordered } from 'react-icons/ri';
import { MdOutlineStar } from 'react-icons/md';
import ReviewList from './components/ReviewList';
import ReviewView from './components/ReviewView';
import './reviews.scss';

const { Title } = Typography;

const ReviewsModule = () => {
    const [viewMode, setViewMode] = useState('list');
    const [selectedReview, setSelectedReview] = useState(null);
    const [isViewVisible, setIsViewVisible] = useState(false);

    const handleView = (review) => {
        setSelectedReview(review);
        setIsViewVisible(true);
    };

    const handleViewClose = () => {
        setIsViewVisible(false);
        setSelectedReview(null);
    };

    const modalTitle = (
        <div className="review-modal-header">
            <div className="review-modal-header-content">
                <div className="review-modal-header-title">
                    <MdOutlineStar /> Review Details
                </div>
            </div>
        </div>
    );

    return (
        <div className="reviews">
            <div className="reviews-header">
                <Title level={2} className="mfh_title">
                    Reviews
                </Title>
                <div className="reviews-header-actions">
                    <Space size={8}>
                        <div className="view-toggle" data-mode={viewMode}>
                            <button 
                                className={`btn btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('list')}
                            >
                                <RiListUnordered />
                            </button>
                            <button 
                                className={`btn btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <RiLayoutGridLine />
                            </button>
                        </div>
                    </Space>
                </div>
            </div>

            <ReviewList
                viewMode={viewMode}
                onView={handleView}
            />

            <Modal
                title={modalTitle}
                open={isViewVisible}
                onCancel={handleViewClose}
                footer={null}
                width={800}
                className="review-modal"
                maskClosable={true}
            >
                <ReviewView review={selectedReview} />
            </Modal>
        </div>
    );
};

export default ReviewsModule;