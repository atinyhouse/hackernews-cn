const axios = require('axios');
const cheerio = require('cheerio');

class HackerNewsAPI {
  constructor() {
    this.baseURL = 'https://hacker-news.firebaseio.com/v0';
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 10000
    });
  }

  // 移除 HTML 标签
  stripHtml(html) {
    if (!html) return '';
    const $ = cheerio.load(html);
    return $.text().trim();
  }

  // 获取热门故事ID列表
  async getTopStories() {
    try {
      const response = await this.axios.get('/topstories.json');
      return response.data;
    } catch (error) {
      console.error('获取热门故事失败:', error.message);
      return [];
    }
  }

  // 获取最佳故事ID列表
  async getBestStories() {
    try {
      const response = await this.axios.get('/beststories.json');
      return response.data;
    } catch (error) {
      console.error('获取最佳故事失败:', error.message);
      return [];
    }
  }

  // 获取单个故事详情
  async getItem(id) {
    try {
      const response = await this.axios.get(`/item/${id}.json`);
      return response.data;
    } catch (error) {
      console.error(`获取故事 ${id} 失败:`, error.message);
      return null;
    }
  }

  // 批量获取故事详情
  async getItems(ids) {
    const promises = ids.map(id => this.getItem(id));
    const items = await Promise.all(promises);
    return items.filter(item => item !== null);
  }

  // 获取故事的所有评论
  async getComments(item, maxDepth = 2) {
    if (!item || !item.kids || item.kids.length === 0) {
      return [];
    }

    const comments = [];

    const fetchComment = async (commentId, depth = 0, parentId = null) => {
      if (depth > maxDepth) return;

      const comment = await this.getItem(commentId);
      if (!comment || comment.deleted || comment.dead) return;

      comments.push({
        hn_comment_id: comment.id,
        parent_id: parentId,
        author: comment.by || 'unknown',
        content: this.stripHtml(comment.text) || '',
        created_at: comment.time * 1000 // 转换为毫秒
      });

      // 递归获取子评论
      if (comment.kids && comment.kids.length > 0) {
        const childPromises = comment.kids.slice(0, 5).map(kidId =>
          fetchComment(kidId, depth + 1, comment.id)
        );
        await Promise.all(childPromises);
      }
    };

    // 只获取前20个顶级评论
    const topComments = item.kids.slice(0, 20);
    await Promise.all(topComments.map(commentId => fetchComment(commentId, 0, null)));

    return comments;
  }

  // 获取热门帖子（支持按评论数或点赞数排序）
  async getTopPostsByComments(limit = 20) {
    return this.getTopPosts(limit, 'comments');
  }

  // 获取热门帖子（按点赞数排序）
  async getTopPostsByPoints(limit = 20) {
    return this.getTopPosts(limit, 'points');
  }

  // 统一的获取热门帖子方法（改进算法，综合考虑时效性和热度）
  async getTopPosts(limit = 20, sortBy = 'comments') {
    console.log(`开始获取 HackerNews 热门帖子 (排序方式: ${sortBy})...`);

    // 获取热门故事ID - HackerNews的topstories本身就按热度排序
    const storyIds = await this.getTopStories();
    if (storyIds.length === 0) {
      console.log('未获取到任何故事ID');
      return [];
    }

    console.log(`获取到 ${storyIds.length} 个故事ID，开始获取详情...`);

    // 获取前100个故事的详情（topstories已经是按HN算法排序的热门内容）
    const stories = await this.getItems(storyIds.slice(0, 100));

    // 过滤掉没有评论的故事
    let filteredStories = stories.filter(
      story => story && story.type === 'story' && story.descendants > 0
    );

    // 计算热度分数（综合考虑时效性）
    const now = Date.now() / 1000; // 转换为秒
    filteredStories = filteredStories.map(story => {
      const ageInHours = (now - story.time) / 3600;

      // HackerNews式的热度算法
      // score = (points - 1) / (age + 2)^1.8
      // 越新的帖子权重越高,points越高权重越高
      const gravity = 1.8;
      const pointsScore = Math.pow((story.score - 1) / Math.pow(ageInHours + 2, gravity), 1);
      const commentsScore = Math.pow((story.descendants) / Math.pow(ageInHours + 2, gravity), 1);

      return {
        ...story,
        hotScore: pointsScore + commentsScore * 0.5, // 综合分数
        ageInHours: ageInHours
      };
    });

    // 根据排序方式排序
    if (sortBy === 'points') {
      // 点赞榜：主要按点赞数排序，同时考虑时效性
      // 对于24小时内的新帖，给予额外加权
      filteredStories.sort((a, b) => {
        // 新鲜度加成：24小时内的帖子获得20%的点赞数加成
        const aBoost = a.ageInHours < 24 ? a.score * 0.2 : 0;
        const bBoost = b.ageInHours < 24 ? b.score * 0.2 : 0;

        const finalScoreA = a.score + aBoost;
        const finalScoreB = b.score + bBoost;

        return finalScoreB - finalScoreA;
      });
      console.log(`找到 ${filteredStories.length} 个有评论的故事，按点赞数排序(24小时内新帖+20%加成)`);
    } else {
      // 评论榜：主要按评论数排序，同时考虑时效性
      // 对于24小时内的新帖，给予额外加权
      filteredStories.sort((a, b) => {
        // 新鲜度加成：24小时内的帖子获得20%的评论数加成
        const aBoost = a.ageInHours < 24 ? a.descendants * 0.2 : 0;
        const bBoost = b.ageInHours < 24 ? b.descendants * 0.2 : 0;

        const finalScoreA = a.descendants + aBoost;
        const finalScoreB = b.descendants + bBoost;

        return finalScoreB - finalScoreA;
      });
      console.log(`找到 ${filteredStories.length} 个有评论的故事，按评论数排序(24小时内新帖+20%加成)`);
    }

    // 取前N个
    const topStories = filteredStories.slice(0, limit);

    // 转换为统一格式
    const posts = topStories.map(story => ({
      hn_id: story.id,
      title: story.title || 'No title',
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      content: story.text ? this.stripHtml(story.text) : null,
      points: story.score || 0,
      comment_count: story.descendants || 0,
      author: story.by || 'unknown',
      created_at: story.time * 1000
    }));

    return posts;
  }

  // 获取帖子及其评论
  async getPostWithComments(postId) {
    const item = await this.getItem(postId);
    if (!item) return null;

    const post = {
      hn_id: item.id,
      title: item.title || 'No title',
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      points: item.score || 0,
      comment_count: item.descendants || 0,
      author: item.by || 'unknown',
      created_at: item.time * 1000
    };

    const comments = await this.getComments(item);

    return { post, comments };
  }
}

module.exports = HackerNewsAPI;
