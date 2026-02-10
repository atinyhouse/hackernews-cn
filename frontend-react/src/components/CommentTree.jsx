import { Card, Typography, Empty } from '@douyinfe/semi-ui';
import { formatTime } from '../utils/helpers';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../styles/theme';

const { Text, Paragraph } = Typography;

function CommentItem({ comment, isReply = false }) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const timeAgo = formatTime(comment.created_at);

  return (
    <div style={{ marginBottom: isReply ? '8px' : '12px' }}>
      <Card
        bordered={false}
        style={{
          background: isReply ? theme.bgHover : theme.bgTertiary,
          border: `1px solid ${theme.borderPrimary}`,
          borderLeft: isReply ? `2px solid ${theme.borderSecondary}` : `2px solid ${theme.borderAccent}`,
          borderRadius: '3px',
          marginLeft: isReply ? '32px' : '0'
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <Text strong style={{ color: theme.textPrimary, fontSize: '13px', fontWeight: 500 }}>
            {comment.author}
          </Text>
          <Text type="tertiary" size="small" style={{ fontSize: '12px', color: theme.textTertiary }}>
            {timeAgo}
          </Text>
        </div>

        {comment.content_cn ? (
          <>
            <Paragraph style={{ marginBottom: '8px', color: theme.textPrimary, fontSize: '13px', lineHeight: 1.5 }}>
              {comment.content_cn}
            </Paragraph>
            <Paragraph
              type="tertiary"
              size="small"
              style={{ fontStyle: 'italic', marginBottom: 0, fontSize: '12px', color: theme.textTertiary }}
            >
              {comment.content}
            </Paragraph>
          </>
        ) : (
          <Paragraph style={{ marginBottom: 0, color: theme.textPrimary, fontSize: '13px', lineHeight: 1.5 }}>
            {comment.content}
          </Paragraph>
        )}
      </Card>

      {comment.children && comment.children.length > 0 && (
        <div>
          {comment.children.map(child => (
            <CommentItem key={child.hn_comment_id} comment={child} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentTree({ comments }) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  if (!comments || comments.length === 0) {
    return (
      <Empty
        title="暂无评论"
        description="这篇帖子还没有评论"
        style={{ padding: '40px 0', color: theme.textSecondary }}
      />
    );
  }

  return (
    <div>
      {comments.map(comment => (
        <CommentItem key={comment.hn_comment_id} comment={comment} />
      ))}
    </div>
  );
}
