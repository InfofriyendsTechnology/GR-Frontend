import React, { useState } from 'react';
import { Card, Typography, Button, Space, message } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import './AnimatedReviewCard.scss';

const { Text, Paragraph } = Typography;

const Balloon = ({ color, delay, duration, height }) => (
  <div
    className="balloon"
    style={{
      '--start-color': color[0],
      '--end-color': color[1],
      '--animation-delay': `${delay}s`,
      '--animation-duration': `${duration}s`,
      '--float-height': `${height}vh`
    }}
  >
    <div className="balloon-string"></div>
  </div>
);

const AnimatedReviewCard = ({ review, onRefresh }) => {
  const [copied, setCopied] = useState(false);

  const balloons = [
    { colors: ['#ff69b4', '#ff1493'], delay: 0.2, duration: 4.0, height: 70 },
    { colors: ['#00bfff', '#1e90ff'], delay: 0.5, duration: 4.2, height: 75 },
    { colors: ['#9370db', '#8a2be2'], delay: 0.7, duration: 4.4, height: 80 },
    { colors: ['#ffd700', '#ffa500'], delay: 0.9, duration: 4.6, height: 85 },
    { colors: ['#32cd32', '#228b22'], delay: 1.1, duration: 4.8, height: 90 },
    { colors: ['#ff7f50', '#ff4500'], delay: 0.3, duration: 4.3, height: 82 }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(review.text)
      .then(() => {
        setCopied(true);
        message.success('Review copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => message.error('Failed to copy review'));
  };

  return (
    <div className="animated-review-container">
      <Card
        className="animated-review-card"
        extra={
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            className="refresh-button"
          />
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="review-header">
            <Text strong>{review.customerName}</Text>
            <Text type="secondary">{new Date(review.date).toLocaleDateString()}</Text>
          </div>
          
          <Paragraph className="review-text">
            {review.text}
          </Paragraph>

          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={handleCopy}
            className="copy-button"
          >
            {copied ? 'Copied!' : 'Copy & Continue'}
          </Button>
        </Space>

        <div className="gradient-strips">
          <div className="strip strip-1"></div>
          <div className="strip strip-2"></div>
          <div className="strip strip-3"></div>
        </div>
      </Card>

      <div className="balloons-container">
        {balloons.map((balloon, index) => (
          <Balloon
            key={index}
            color={balloon.colors}
            delay={balloon.delay}
            duration={balloon.duration}
            height={balloon.height}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedReviewCard; 