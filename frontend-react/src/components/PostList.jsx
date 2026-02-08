import { Spin, Empty } from '@douyinfe/semi-ui';
import { IllustrationNoContent, IllustrationNoContentDark } from '@douyinfe/semi-illustrations';
import PostCard from './PostCard';

export default function PostList({ posts, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Empty
        image={<IllustrationNoContent style={{ width: 150, height: 150 }} />}
        darkModeImage={<IllustrationNoContentDark style={{ width: 150, height: 150 }} />}
        title="暂无数据"
        description="没有找到相关帖子"
        style={{ padding: '80px 0' }}
      />
    );
  }

  return (
    <div>
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} rank={index + 1} />
      ))}
    </div>
  );
}
