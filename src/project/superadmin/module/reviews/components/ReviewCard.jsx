import React from 'react';
import { Card, Typography, Space, Button, Popconfirm } from 'antd';
import { DeleteOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

// Generate Google review link from Place ID
const generateReviewLink = (placeId) => {
    if (!placeId) return 'https://www.google.com';
    return `https://search.google.com/local/writereview?placeid=${placeId}`;
};

const ReviewCard = ({ review, onView, onDelete }) => {
    const { customerName, reviewText, date, placeId } = review;

    return (
        <Card
            className="review-card"
            actions={[
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={onView}
                    key="view"
                />,
                <Popconfirm
                    title="Delete Review"
                    description="Are you sure you want to delete this review?"
                    onConfirm={onDelete}
                    okText="Yes"
                    cancelText="No"
                    key="delete"
                >
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                    />
                </Popconfirm>
            ]}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text strong>{customerName}</Text>
                    <Text type="secondary">{new Date(date).toLocaleDateString()}</Text>
                </Space>
                <Paragraph ellipsis={{ rows: 3 }}>{reviewText}</Paragraph>
                <Button
                    type="link"
                    icon={<LinkOutlined />}
                    href={generateReviewLink(placeId)}
                    target="_blank"
                >
                    View on Google
                </Button>
            </Space>
        </Card>
    );
};

export default ReviewCard; 