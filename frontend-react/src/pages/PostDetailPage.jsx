import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Space, Typography, Spin, Toast } from '@douyinfe/semi-ui';
import { IconArrowLeft } from '@douyinfe/semi-icons';
import CommentTree from '../components/CommentTree';
import { formatTime, buildCommentTree } from '../utils/helpers';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../styles/theme';

const { Content } = Layout;
const { Title, Text } = Typography;

const DATA_FILE = '/hackernews-cn/data/posts.json';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [commentTree, setCommentTree] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(DATA_FILE);
      const data = await response.json();

      const posts = data.posts.map((p, index) => ({
        ...p,
        id: index + 1,
        comment_count: p.comments?.length || 0
      }));

      const foundPost = posts.find(p => p.id === parseInt(id));

      if (!foundPost) {
        Toast.error('帖子不存在');
        navigate('/');
        return;
      }

      setPost(foundPost);

      if (foundPost.comments && foundPost.comments.length > 0) {
        const tree = buildCommentTree(foundPost.comments);
        setCommentTree(tree);
      }
    } catch (error) {
      console.error('加载详情失败:', error);
      Toast.error('加载详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: theme.bgSecondary }}>
        <Content style={{ padding: '24px' }}>
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" tip="Loading..." />
          </div>
        </Content>
      </Layout>
    );
  }

  if (!post) {
    return null;
  }

  const timeAgo = formatTime(post.created_at);

  return (
    <Layout style={{ minHeight: '100vh', background: theme.bgSecondary }}>
      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* 返回按钮 */}
          <Button
            icon={<IconArrowLeft />}
            onClick={() => navigate('/')}
            style={{
              marginBottom: '16px',
              color: theme.textTertiary,
              border: `1px solid ${theme.borderPrimary}`,
              background: theme.bgPrimary
            }}
            size="small"
          >
            Back to List
          </Button>

          {/* 帖子信息 */}
          <Card
            bordered={false}
            title={
              <div>
                {post.title_cn && (
                  <Title heading={4} style={{ marginBottom: '8px', color: theme.textPrimary, fontWeight: 600, fontSize: '18px' }}>
                    {post.title_cn}
                  </Title>
                )}
                {post.title && (
                  <Text type="tertiary" style={{ fontStyle: 'italic', fontSize: '13px', color: theme.textTertiary }}>
                    {post.title}
                  </Text>
                )}
              </div>
            }
            style={{
              marginBottom: '24px',
              border: `1px solid ${theme.borderPrimary}`,
              borderRadius: '6px',
              background: theme.bgPrimary
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: theme.textSecondary }}>
              <div>👍 点赞数: <Text strong>{post.points || 0}</Text></div>
              <div>💬 评论数: <Text strong>{post.comment_count || 0}</Text></div>
              <div>👤 作者: <Text strong>{post.author || '匿名'}</Text></div>
              <div>🕐 发布时间: <Text strong>{timeAgo}</Text></div>
              {post.url && (
                <div>
                  🔗 原文链接:{' '}
                  <a href={post.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.accent, textDecoration: 'none' }}>
                    访问原文 ↗
                  </a>
                </div>
              )}
            </div>

            {post.abstract && (
              <div style={{
                marginTop: '16px',
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
          </Card>

          {/* 评论区 */}
          <Card
            bordered={false}
            title={
              <Space>
                <span>💬</span>
                <Text strong style={{ fontSize: '14px', color: theme.textPrimary }}>评论</Text>
              </Space>
            }
            style={{
              border: `1px solid ${theme.borderPrimary}`,
              borderRadius: '6px',
              background: theme.bgPrimary
            }}
          >
            <CommentTree comments={commentTree} />
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
