import { useState, useEffect } from 'react';
import { Layout, Card, Space, Typography, Toast } from '@douyinfe/semi-ui';
import Header from '../components/Header';
import PostList from '../components/PostList';
import { formatNumber } from '../utils/helpers';

const { Content } = Layout;
const { Title, Text } = Typography;

const DATA_FILE = import.meta.env.BASE_URL + 'data/posts.json';

export default function HomePage() {
  const [allPosts, setAllPosts] = useState([]);
  const [currentPosts, setCurrentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSort, setCurrentSort] = useState('comments');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 加载数据
  useEffect(() => {
    loadPosts();
  }, []);

  // 当排序或搜索改变时更新帖子列表
  useEffect(() => {
    applySortAndFilter();
  }, [allPosts, currentSort, searchKeyword]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(DATA_FILE);
      const data = await response.json();

      const posts = data.posts.map((post, index) => ({
        ...post,
        id: index + 1,
        comment_count: post.comments?.length || 0
      }));

      setAllPosts(posts);
      setLastUpdate(data.lastUpdate);
    } catch (error) {
      console.error('加载数据失败:', error);
      Toast.error('无法加载数据文件，请确保数据文件已生成');
    } finally {
      setLoading(false);
    }
  };

  const applySortAndFilter = () => {
    let filtered = [...allPosts];

    // 搜索过滤
    if (searchKeyword) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (post.title_cn && post.title_cn.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    // 排序
    if (currentSort === 'comments') {
      filtered.sort((a, b) => b.comment_count - a.comment_count);
    } else if (currentSort === 'points') {
      filtered.sort((a, b) => b.points - a.points);
    }

    setCurrentPosts(filtered.slice(0, 20));
  };

  const handleSortChange = (sortBy) => {
    setCurrentSort(sortBy);
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
  };

  const handleRefresh = () => {
    Toast.info('GitHub Pages 版本每天会自动更新数据,无需手动刷新。数据将在北京时间每天 8:00 自动更新。');
  };

  // 统计数据
  const totalComments = allPosts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
  const totalPoints = allPosts.reduce((sum, p) => sum + p.points, 0);

  return (
    <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header
        currentSort={currentSort}
        onSortChange={handleSortChange}
        onSearch={handleSearch}
        lastUpdate={lastUpdate}
        onRefresh={handleRefresh}
      />

      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* 统计卡片 */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <Card
              style={{
                flex: 1,
                border: '1px solid rgba(55, 53, 47, 0.09)',
                borderRadius: '6px',
                background: '#ffffff',
                transition: 'all 0.2s ease'
              }}
              bodyStyle={{ padding: '16px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(242, 241, 238, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.09)';
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Title heading={2} style={{ color: 'rgb(99, 102, 241)', margin: 0, fontWeight: 600, fontSize: '28px' }}>
                  {allPosts.length}
                </Title>
                <Text type="tertiary" style={{ fontSize: '12px' }}>Posts</Text>
              </div>
            </Card>
            <Card
              style={{
                flex: 1,
                border: '1px solid rgba(55, 53, 47, 0.09)',
                borderRadius: '6px',
                background: '#ffffff',
                transition: 'all 0.2s ease'
              }}
              bodyStyle={{ padding: '16px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(242, 241, 238, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.09)';
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Title heading={2} style={{ color: 'rgb(99, 102, 241)', margin: 0, fontWeight: 600, fontSize: '28px' }}>
                  {formatNumber(totalComments)}
                </Title>
                <Text type="tertiary" style={{ fontSize: '12px' }}>Comments</Text>
              </div>
            </Card>
            <Card
              style={{
                flex: 1,
                border: '1px solid rgba(55, 53, 47, 0.09)',
                borderRadius: '6px',
                background: '#ffffff',
                transition: 'all 0.2s ease'
              }}
              bodyStyle={{ padding: '16px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(242, 241, 238, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.09)';
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Title heading={2} style={{ color: 'rgb(99, 102, 241)', margin: 0, fontWeight: 600, fontSize: '28px' }}>
                  {formatNumber(totalPoints)}
                </Title>
                <Text type="tertiary" style={{ fontSize: '12px' }}>Points</Text>
              </div>
            </Card>
          </div>

          {/* 帖子列表 */}
          <PostList posts={currentPosts} loading={loading} />
        </div>
      </Content>
    </Layout>
  );
}
