import { Layout, Button, Input, Space, Typography, Tag } from '@douyinfe/semi-ui';
import { IconSearch, IconRefresh, IconComment, IconLikeHeart } from '@douyinfe/semi-icons';
import { formatTime } from '../utils/helpers';

const { Header: SemiHeader } = Layout;
const { Title } = Typography;

export default function Header({
  currentSort,
  onSortChange,
  onSearch,
  lastUpdate,
  onRefresh
}) {
  return (
    <SemiHeader
      style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
        padding: '12px 24px',
      }}
    >
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background 0.15s ease'
        }}
             onClick={() => window.location.reload()}
             onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(55, 53, 47, 0.06)'}
             onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <span style={{ fontSize: '20px' }}>🔥</span>
          <Title heading={5} style={{
            color: 'rgb(55, 53, 47)',
            margin: 0,
            fontWeight: 600,
            fontSize: '14px'
          }}>
            HackerNews Trending
          </Title>
        </div>

        <Space size={4}>
          <Button
            theme="borderless"
            size="small"
            icon={<IconComment />}
            onClick={() => onSortChange('comments')}
            style={{
              color: currentSort === 'comments' ? 'rgb(99, 102, 241)' : 'rgba(55, 53, 47, 0.6)',
              background: currentSort === 'comments' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              fontSize: '13px',
              fontWeight: currentSort === 'comments' ? 500 : 400,
              padding: '4px 10px',
              transition: 'all 0.15s ease'
            }}
          >
            Most Discussed
          </Button>
          <Button
            theme="borderless"
            size="small"
            icon={<IconLikeHeart />}
            onClick={() => onSortChange('points')}
            style={{
              color: currentSort === 'points' ? 'rgb(99, 102, 241)' : 'rgba(55, 53, 47, 0.6)',
              background: currentSort === 'points' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              fontSize: '13px',
              fontWeight: currentSort === 'points' ? 500 : 400,
              padding: '4px 10px',
              transition: 'all 0.15s ease'
            }}
          >
            Top Points
          </Button>
        </Space>

        <Input
          prefix={<IconSearch style={{ color: 'rgba(55, 53, 47, 0.4)' }} />}
          placeholder="Search..."
          size="small"
          style={{
            width: 200,
            background: 'rgba(242, 241, 238, 0.6)',
            border: '1px solid transparent',
            fontSize: '13px'
          }}
          onEnterPress={onSearch}
          onChange={(value) => !value && onSearch('')}
        />

        <Button
          theme="borderless"
          size="small"
          icon={<IconRefresh />}
          onClick={onRefresh}
          style={{
            color: 'rgba(55, 53, 47, 0.6)',
            fontSize: '13px',
            padding: '4px 10px'
          }}
        >
          Refresh
        </Button>

        {lastUpdate && (
          <Tag
            size="small"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(55, 53, 47, 0.5)',
              fontSize: '12px',
              padding: '2px 6px'
            }}
          >
            {formatTime(lastUpdate)}
          </Tag>
        )}
      </div>
    </SemiHeader>
  );
}
