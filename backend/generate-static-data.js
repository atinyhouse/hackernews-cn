require('dotenv').config();

const fs = require('fs');
const path = require('path');
const HackerNewsAPI = require('./hackerNewsAPI');
const DeepSeekTranslator = require('./deepseekTranslator');

const hnAPI = new HackerNewsAPI();
const translator = new DeepSeekTranslator();

async function generateStaticData() {
  console.log('\n========== 开始生成静态数据 ==========');
  console.log('时间:', new Date().toLocaleString('zh-CN'));

  try {
    // 获取热门帖子
    console.log('\n1. 按评论数获取热门帖子...');
    const postsByComments = await hnAPI.getTopPostsByComments(30);

    console.log('\n2. 按点赞数获取热门帖子...');
    const postsByPoints = await hnAPI.getTopPostsByPoints(30);

    // 合并去重
    const postsMap = new Map();
    [...postsByComments, ...postsByPoints].forEach(post => {
      if (!postsMap.has(post.hn_id)) {
        postsMap.set(post.hn_id, post);
      }
    });

    const posts = Array.from(postsMap.values());
    console.log(`\n成功获取 ${posts.length} 个不重复的帖子`);

    // 翻译帖子
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
        translatedPosts.push(post);
      }
    }

    // 获取评论并生成摘要
    console.log('\n开始获取评论、生成摘要...');
    const postsWithComments = [];

    for (let i = 0; i < translatedPosts.length; i++) {
      const post = translatedPosts[i];
      console.log(`\n[${i + 1}/${translatedPosts.length}] 处理帖子: ${post.title.substring(0, 40)}...`);

      const item = await hnAPI.getItem(post.hn_id);
      let comments = [];
      let abstract = post.abstract || null;

      if (item && item.kids) {
        comments = await hnAPI.getComments(item);

        if (comments.length > 0) {
          console.log(`  获取到 ${comments.length} 条评论`);

          // 翻译所有评论
          const translatedComments = await translator.translateComments(comments, comments.length);

          // 生成摘要
          if (!abstract) {
            console.log(`  生成摘要...`);
            abstract = await translator.generatePostSummary(post, comments);
          }

          comments = translatedComments;
        }
      }

      postsWithComments.push({
        ...post,
        abstract,
        comments
      });
    }

    // 创建输出目录
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存为 JSON 文件
    const dataFile = path.join(outputDir, 'posts.json');
    fs.writeFileSync(dataFile, JSON.stringify({
      lastUpdate: Date.now(),
      posts: postsWithComments
    }, null, 2));

    console.log(`\n✅ 数据已保存到: ${dataFile}`);
    console.log(`   总帖子数: ${postsWithComments.length}`);
    console.log(`   总评论数: ${postsWithComments.reduce((sum, p) => sum + (p.comments?.length || 0), 0)}`);
    console.log(`   总点赞数: ${postsWithComments.reduce((sum, p) => sum + p.points, 0)}`);

    console.log('\n========== 数据生成完成 ==========\n');

  } catch (error) {
    console.error('数据生成过程出错:', error);
    process.exit(1);
  }
}

// 执行
generateStaticData();
