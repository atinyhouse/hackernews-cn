import { Layout, Button, Input, Space, Typography, Tag } from '@douyinfe/semi-ui';
import { IconSearch, IconRefresh, IconComment, IconLikeHeart, IconMoon, IconSun } from '@douyinfe/semi-icons';
import { formatTime } from '../utils/helpers';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../styles/theme';

const { Header: SemiHeader } = Layout;
const { Title } = Typography;

export default function Header({
  currentSort,
  onSortChange,
  onSearch,
  lastUpdate,
  onRefresh
}) {
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);

  return (
    <SemiHeader
      style={{
        background: theme.bgPrimary,
        borderBottom: `1px solid ${theme.borderPrimary}`,
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
             onMouseEnter={(e) => e.currentTarget.style.background = theme.bgHover}
             onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <span style={{ fontSize: '20px' }}>🔥</span>
          <Title heading={5} style={{
            color: theme.textPrimary,
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
              color: currentSort === 'comments' ? theme.accent : theme.textTertiary,
              background: currentSort === 'comments' ? `${theme.accent}1a` : 'transparent',
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
              color: currentSort === 'points' ? theme.accent : theme.textTertiary,
              background: currentSort === 'points' ? `${theme.accent}1a` : 'transparent',
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
          prefix={<IconSearch style={{ color: theme.textMuted }} />}
          placeholder="Search..."
          size="small"
          style={{
            width: 200,
            background: theme.bgTertiary,
            border: '1px solid transparent',
            fontSize: '13px',
            color: theme.textPrimary
          }}
          onEnterPress={onSearch}
          onChange={(value) => !value && onSearch('')}
        />

        <Button
          theme="borderless"
          size="small"
          icon={isDark ? <IconSun /> : <IconMoon />}
          onClick={toggleTheme}
          style={{
            color: theme.textTertiary,
            fontSize: '13px',
            padding: '4px 10px'
          }}
        >
          {isDark ? 'Light' : 'Dark'}
        </Button>

        <Button
          theme="borderless"
          size="small"
          icon={<IconRefresh />}
          onClick={onRefresh}
          style={{
            color: theme.textTertiary,
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
              color: theme.textQuaternary,
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
