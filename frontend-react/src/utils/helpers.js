// 格式化时间
export function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
}

// 格式化数字
export function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// 构建评论树
export function buildCommentTree(comments) {
  const commentMap = {};
  const rootComments = [];

  // 创建评论映射
  comments.forEach(comment => {
    commentMap[comment.hn_comment_id] = {
      ...comment,
      children: []
    };
  });

  // 构建树结构
  comments.forEach(comment => {
    if (comment.parent_id && commentMap[comment.parent_id]) {
      commentMap[comment.parent_id].children.push(commentMap[comment.hn_comment_id]);
    } else {
      rootComments.push(commentMap[comment.hn_comment_id]);
    }
  });

  return rootComments;
}
