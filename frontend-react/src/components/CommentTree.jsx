import { Card, Typography, Empty } from '@douyinfe/semi-ui';
import { formatTime } from '../utils/helpers';

const { Text, Paragraph } = Typography;

function CommentItem({ comment, isReply = false }) {
  const timeAgo = formatTime(comment.created_at);

  return (
    <div style={{ marginBottom: isReply ? '8px' : '12px' }}>
      <Card
        bordered={false}
        style={{
          background: isReply ? '#fafafa' : 'rgba(242, 241, 238, 0.6)',
          border: '1px solid rgba(55, 53, 47, 0.09)',
          borderLeft: isReply ? '2px solid rgba(55, 53, 47, 0.2)' : '2px solid rgba(99, 102, 241, 0.3)',
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
          <Text strong style={{ color: 'rgb(55, 53, 47)', fontSize: '13px', fontWeight: 500 }}>
            {comment.author}
          </Text>
          <Text type="tertiary" size="small" style={{ fontSize: '12px' }}>
            {timeAgo}
          </Text>
        </div>

        {comment.content_cn ? (
          <>
            <Paragraph style={{ marginBottom: '8px', color: 'rgb(55, 53, 47)', fontSize: '13px', lineHeight: 1.5 }}>
              {comment.content_cn}
            </Paragraph>
            <Paragraph
              type="tertiary"
              size="small"
              style={{ fontStyle: 'italic', marginBottom: 0, fontSize: '12px', color: 'rgba(55, 53, 47, 0.6)' }}
            >
              {comment.content}
            </Paragraph>
          </>
        ) : (
          <Paragraph style={{ marginBottom: 0, color: 'rgb(55, 53, 47)', fontSize: '13px', lineHeight: 1.5 }}>
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
  if (!comments || comments.length === 0) {
    return (
      <Empty
        title="暂无评论"
        description="这篇帖子还没有评论"
        style={{ padding: '40px 0' }}
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
