import React from 'react';
import { Descriptions, Rate, Typography, Card } from 'antd';

const { Text } = Typography;

const ReviewView = ({ review }) => {
    if (!review) return null;

    return (
        <Card className="review-view">
            <Descriptions
                title="Review Details"
                bordered
                column={1}
                size="small"
                layout="vertical"
            >
                <Descriptions.Item label="Customer Name">
                    <Text strong>{review.customerName}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Rating">
                    <Rate disabled defaultValue={review.rating} />
                </Descriptions.Item>

                <Descriptions.Item label="Review Text">
                    <Text>{review.reviewText}</Text>
                </Descriptions.Item>

                {review.companyName && (
                    <Descriptions.Item label="Company Name">
                        <Text>{review.companyName}</Text>
                    </Descriptions.Item>
                )}

                <Descriptions.Item label="Date">
                    <Text>{new Date(review.date).toLocaleString()}</Text>
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default ReviewView; 