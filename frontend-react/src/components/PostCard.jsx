import { Card, Tag, Space, Typography } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/helpers';

const { Text } = Typography;

export default function PostCard({ post, rank }) {
  const navigate = useNavigate();
  const isHot = post.comment_count > 100;
  const timeAgo = formatTime(post.created_at);

  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };

  const cardStyle = {
    cursor: 'pointer',
    border: '1px solid rgba(55, 53, 47, 0.09)',
    borderRadius: '6px',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    position: 'relative'
  };

  return (
    <Card
      bordered={false}
      onClick={handleClick}
      style={cardStyle}
      bodyStyle={{ padding: '16px' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(242, 241, 238, 0.3)';
        e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.12)';
        const leftBorder = e.currentTarget.querySelector('.left-border');
        if (leftBorder) leftBorder.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#ffffff';
        e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.09)';
        const leftBorder = e.currentTarget.querySelector('.left-border');
        if (leftBorder) leftBorder.style.opacity = '0';
      }}
    >
      <div
        className="left-border"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: 'rgb(99, 102, 241)',
          opacity: 0,
          transition: 'opacity 0.2s ease',
          borderRadius: '6px 0 0 6px'
        }}
      />

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'rgba(55, 53, 47, 0.4)',
          minWidth: '32px',
          fontFamily: 'SF Mono, Monaco, Cascadia Code, monospace'
        }}>
          #{rank}
        </div>

        <div style={{ flex: 1 }}>
          {post.title_cn ? (
            <>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgb(55, 53, 47)',
                marginBottom: '6px',
                lineHeight: 1.5
              }}>
                {post.title_cn}
              </div>
              <Text type="tertiary" size="small" style={{ fontStyle: 'italic' }}>
                {post.title}
              </Text>
            </>
          ) : (
            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgb(55, 53, 47)',
              lineHeight: 1.5
            }}>
              {post.title}
            </div>
          )}

          {post.abstract && (
            <div style={{
              marginTop: '8px',
              padding: '10px 12px',
              background: 'rgba(242, 241, 238, 0.6)',
              borderLeft: '2px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '3px',
              fontSize: '13px',
              color: 'rgba(55, 53, 47, 0.8)',
              lineHeight: 1.5
            }}>
              📝 {post.abstract}
            </div>
          )}

          <Space wrap style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)' }}>
            <span>👍 {post.points} points</span>
            <span>💬 {post.comment_count} comments</span>
            <span>👤 {post.author}</span>
            <span>🕐 {timeAgo}</span>
            {isHot && (
              <Tag
                size="small"
                style={{
                  background: 'rgba(255, 107, 107, 0.1)',
                  color: 'rgb(212, 76, 71)',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 500
                }}
              >
                🔥 Hot
              </Tag>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
}
