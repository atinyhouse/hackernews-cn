import { Card, Tag, Space, Typography } from '@douyinfe/semi-ui';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/helpers';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../styles/theme';

const { Text } = Typography;

export default function PostCard({ post, rank }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const isHot = post.comment_count > 100;
  const timeAgo = formatTime(post.created_at);

  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };

  const cardStyle = {
    cursor: 'pointer',
    border: `1px solid ${theme.borderPrimary}`,
    borderRadius: '6px',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    position: 'relative',
    background: theme.bgPrimary
  };

  return (
    <Card
      bordered={false}
      onClick={handleClick}
      style={cardStyle}
      bodyStyle={{ padding: '16px' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = theme.bgHover;
        e.currentTarget.style.borderColor = theme.borderSecondary;
        const leftBorder = e.currentTarget.querySelector('.left-border');
        if (leftBorder) leftBorder.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = theme.bgPrimary;
        e.currentTarget.style.borderColor = theme.borderPrimary;
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
          background: theme.accent,
          opacity: 0,
          transition: 'opacity 0.2s ease',
          borderRadius: '6px 0 0 6px'
        }}
      />

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: theme.textMuted,
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
                color: theme.textPrimary,
                marginBottom: '6px',
                lineHeight: 1.5
              }}>
                {post.title_cn}
              </div>
              <Text type="tertiary" size="small" style={{ fontStyle: 'italic', color: theme.textTertiary }}>
                {post.title}
              </Text>
            </>
          ) : (
            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: theme.textPrimary,
              lineHeight: 1.5
            }}>
              {post.title}
            </div>
          )}

          {post.abstract && (
            <div style={{
              marginTop: '8px',
              padding: '10px 12px',
              background: theme.bgTertiary,
              borderLeft: `2px solid ${theme.borderAccent}`,
              borderRadius: '3px',
              fontSize: '13px',
              color: theme.textSecondary,
              lineHeight: 1.5
            }}>
              📝 {post.abstract}
            </div>
          )}

          <Space wrap style={{ marginTop: '8px', fontSize: '12px', color: theme.textQuaternary }}>
            <span>👍 {post.points} points</span>
            <span>💬 {post.comment_count} comments</span>
            <span>👤 {post.author}</span>
            <span>🕐 {timeAgo}</span>
            {isHot && (
              <Tag
                size="small"
                style={{
                  background: theme.tagBg,
                  color: theme.tagText,
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
