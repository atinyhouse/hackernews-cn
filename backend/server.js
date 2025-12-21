require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const DatabaseManager = require('./database');
const HackerNewsAPI = require('./hackerNewsAPI');
const DeepSeekTranslator = require('./deepseekTranslator');

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化数据库、API 和翻译服务
const db = new DatabaseManager();
const hnAPI = new HackerNewsAPI();
const translator = new DeepSeekTranslator();

// 中间件
app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 数据库初始化中间件
app.use(async (req, res, next) => {
  await db.initPromise;
  next();
});

// ============ API 路由 ============

// 获取最新的热门帖子（支持排序）
app.get('/api/posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'comments'; // 默认按评论数
    const posts = db.getLatestPosts(limit, sortBy);
    res.json({
      success: true,
      data: posts,
      count: posts.length,
      sortBy: sortBy
    });
  } catch (error) {
    console.error('获取帖子失败:', error);
    res.status(500).json({
      success: false,
      error: '获取帖子失败'
    });
  }
});

// 根据日期获取帖子
app.get('/api/posts/date/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const limit = parseInt(req.query.limit) || 20;
    const posts = db.getPostsByDate(date, limit);
    res.json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (error) {
    console.error('获取帖子失败:', error);
    res.status(500).json({
      success: false,
      error: '获取帖子失败'
    });
  }
});

// 搜索帖子
app.get('/api/posts/search', async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: '请提供搜索关键词'
      });
    }

    const posts = db.searchPosts(keyword, limit);
    res.json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      success: false,
      error: '搜索失败'
    });
  }
});

// 获取单个帖子详情
app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = db.getPostById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: '帖子不存在'
      });
    }

    const comments = db.getCommentsByPostId(id);

    res.json({
      success: true,
      data: {
        post,
        comments
      }
    });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取帖子详情失败'
    });
  }
});

// 获取统计数据
app.get('/api/stats', async (req, res) => {
  try {
    const stats = db.getStats();
    const latestPosts = db.getLatestPosts(1);
    const lastUpdate = latestPosts.length > 0 ? latestPosts[0].fetched_at : null;

    res.json({
      success: true,
      data: {
        ...stats,
        lastUpdate
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      error: '获取统计数据失败'
    });
  }
});

// 手动触发数据抓取
app.post('/api/fetch', async (req, res) => {
  try {
    console.log('手动触发数据抓取...');
    await fetchAndStoreData();
    res.json({
      success: true,
      message: '数据抓取完成'
    });
  } catch (error) {
    console.error('数据抓取失败:', error);
    res.status(500).json({
      success: false,
      error: '数据抓取失败'
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now()
  });
});

// ============ 数据抓取功能 ============

async function fetchAndStoreData() {
  await db.initPromise;

  console.log('\n========== 开始抓取 HackerNews 数据 ==========');
  console.log('时间:', new Date().toLocaleString('zh-CN'));

  try {
    // 获取两种排序的热门帖子
    console.log('\n1. 按评论数获取热门帖子...');
    const postsByComments = await hnAPI.getTopPostsByComments(20);

    console.log('\n2. 按点赞数获取热门帖子...');
    const postsByPoints = await hnAPI.getTopPostsByPoints(20);

    // 合并去重（使用 Map 以 hn_id 为键）
    const postsMap = new Map();
    [...postsByComments, ...postsByPoints].forEach(post => {
      if (!postsMap.has(post.hn_id)) {
        postsMap.set(post.hn_id, post);
      }
    });

    const posts = Array.from(postsMap.values());

    if (posts.length === 0) {
      console.log('未获取到任何帖子');
      return;
    }

    console.log(`\n成功获取 ${posts.length} 个不重复的帖子`);

    // 翻译帖子标题和内容
    console.log('\n开始翻译帖子...');
    const translatedPosts = [];
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`[${i + 1}/${posts.length}] 翻译: ${post.title.substring(0, 50)}...`);

      try {
        const translated = await translator.translatePost(post);
        translatedPosts.push(translated);
      } catch (error) {
        console.error(`  翻译失败: ${error.message}`);
        translatedPosts.push(post); // 失败时保留原帖子
      }
    }

    console.log('帖子翻译完成，保存到数据库...');
    db.batchUpsertPosts(translatedPosts);
    console.log('帖子保存完成！');

    // 获取并保存评论，并生成摘要
    console.log('\n开始获取评论、生成摘要...');
    for (let i = 0; i < translatedPosts.length; i++) {
      const post = translatedPosts[i];
      console.log(`\n[${i + 1}/${translatedPosts.length}] 处理帖子: ${post.title.substring(0, 40)}...`);

      const item = await hnAPI.getItem(post.hn_id);
      if (item && item.kids) {
        const comments = await hnAPI.getComments(item);

        if (comments.length > 0) {
          console.log(`  获取到 ${comments.length} 条评论`);

          // 翻译评论（翻译前20条，保持效率和完整性的平衡）
          const translatedComments = await translator.translateComments(comments, 20);

          // 获取数据库中的帖子ID
          const dbPost = db.getPostByHnId(post.hn_id);

          if (dbPost) {
            // 添加 post_id 到评论
            const commentsWithPostId = translatedComments.map(comment => ({
              ...comment,
              post_id: dbPost.id
            }));

            db.batchInsertComments(commentsWithPostId);
            console.log(`  保存了 ${comments.length} 条评论`);

            // 生成摘要并更新帖子
            if (!post.abstract) {
              console.log(`  生成摘要...`);
              const summary = await translator.generatePostSummary(post, comments);
              if (summary) {
                db.updatePostAbstract(dbPost.id, summary);
                console.log(`  摘要已保存`);
              }
            }
          }
        }
      }
    }

    console.log('\n========== 数据抓取完成 ==========\n');

    // 显示统计信息
    const stats = db.getStats();
    console.log('数据库统计:');
    console.log(`  总帖子数: ${stats.totalPosts}`);
    console.log(`  总评论数: ${stats.totalComments}`);
    console.log(`  总点赞数: ${stats.totalPoints}`);

  } catch (error) {
    console.error('数据抓取过程出错:', error);
    throw error;
  }
}

// ============ 定时任务 ============

// 每3小时自动抓取数据（保持内容新鲜）
cron.schedule('0 */3 * * *', () => {
  console.log('\n定时任务触发 (每3小时)...');
  fetchAndStoreData().catch(error => {
    console.error('定时任务执行失败:', error);
  });
});

// 每天凌晨清理7天前的旧数据
cron.schedule('0 3 * * *', () => {
  console.log('\n清理旧数据任务触发...');
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  db.deleteOldPosts(sevenDaysAgo);
  console.log('旧数据清理完成');
});

// ============ 启动服务器 ============

app.listen(PORT, async () => {
  await db.initPromise;

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   HackerNews 中文热议榜 - 后端服务启动    ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n🚀 服务器运行在: http://localhost:${PORT}`);
  console.log('\n📡 可用的 API 端点:');
  console.log(`   GET  /api/posts              - 获取最新热门帖子`);
  console.log(`   GET  /api/posts/:id          - 获取帖子详情`);
  console.log(`   GET  /api/posts/date/:date   - 获取指定日期的帖子`);
  console.log(`   GET  /api/posts/search?q=    - 搜索帖子`);
  console.log(`   GET  /api/stats              - 获取统计数据`);
  console.log(`   POST /api/fetch              - 手动触发数据抓取`);
  console.log(`   GET  /health                 - 健康检查`);
  console.log('\n⏰ 定时任务已启动:');
  console.log('   - 每 3 小时自动抓取最新数据（保持内容新鲜）');
  console.log('   - 每天凌晨 3:00 清理 7 天前的旧数据');

  // 检查数据库是否有数据
  const stats = db.getStats();
  console.log('\n📊 当前数据库状态:');
  console.log(`   帖子数: ${stats.totalPosts}`);
  console.log(`   评论数: ${stats.totalComments}`);
  console.log(`   点赞数: ${stats.totalPoints}`);

  // 如果数据库为空，执行首次抓取
  if (stats.totalPosts === 0) {
    console.log('\n📥 数据库为空，开始首次数据抓取...');
    console.log('   (这可能需要几分钟时间，请耐心等待)');
    try {
      await fetchAndStoreData();
      console.log('\n✅ 首次数据抓取完成！');
    } catch (error) {
      console.error('\n❌ 首次数据抓取失败:', error.message);
      console.log('   您可以稍后通过 POST /api/fetch 手动触发抓取');
    }
  }

  console.log('\n════════════════════════════════════════════\n');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n\n正在关闭服务器...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n正在关闭服务器...');
  db.close();
  process.exit(0);
});
