const HackerNewsAPI = require('../hackerNewsAPI');
const DatabaseManager = require('../database');

async function main() {
  console.log('开始手动抓取 HackerNews 数据...\n');

  const hnAPI = new HackerNewsAPI();
  const db = new DatabaseManager();

  try {
    // 获取热门帖子
    console.log('1. 获取热门帖子列表...');
    const posts = await hnAPI.getTopPostsByComments(20);
    console.log(`   获取到 ${posts.length} 个帖子\n`);

    // 保存到数据库
    console.log('2. 保存帖子到数据库...');
    db.batchUpsertPosts(posts);
    console.log('   保存完成\n');

    // 获取评论（前5个帖子）
    console.log('3. 获取评论（前5个帖子）...');
    for (let i = 0; i < Math.min(5, posts.length); i++) {
      const post = posts[i];
      console.log(`   [${i + 1}/${Math.min(5, posts.length)}] ${post.title.substring(0, 50)}...`);

      const item = await hnAPI.getItem(post.hn_id);
      if (item && item.kids) {
        const comments = await hnAPI.getComments(item);

        if (comments.length > 0) {
          const dbPost = db.db.prepare('SELECT id FROM posts WHERE hn_id = ?').get(post.hn_id);

          if (dbPost) {
            const commentsWithPostId = comments.map(comment => ({
              ...comment,
              post_id: dbPost.id
            }));

            db.batchInsertComments(commentsWithPostId);
            console.log(`       保存了 ${comments.length} 条评论`);
          }
        }
      }
    }

    // 显示统计信息
    console.log('\n4. 数据库统计:');
    const stats = db.getStats();
    console.log(`   总帖子数: ${stats.totalPosts}`);
    console.log(`   总评论数: ${stats.totalComments}`);
    console.log(`   总点赞数: ${stats.totalPoints}`);

    console.log('\n✅ 数据抓取完成！');

  } catch (error) {
    console.error('❌ 抓取失败:', error);
  } finally {
    db.close();
  }
}

main();
