import React from 'react';
import { Card, Typography, Space, Button, Popconfirm } from 'antd';
import { DeleteOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const ReviewCard = ({ review, onView, onDelete }) => {
    const { customerName, reviewText, date, googleReviewLink } = review;

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
                    href={googleReviewLink}
                    target="_blank"
                >
                    View on Google
                </Button>
            </Space>
        </Card>
    );
};

export default ReviewCard; 