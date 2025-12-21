const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.dbPath = path.join(__dirname, 'data', 'hackernews.db');
    this.db = null;
    this.initPromise = this.initialize();
  }

  async initialize() {
    // 确保 data 目录存在
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 初始化 SQL.js
    const SQL = await initSqlJs();

    // 尝试加载现有数据库，如果不存在则创建新的
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    this.initTables();
    return this.db;
  }

  initTables() {
    // 创建帖子表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hn_id INTEGER UNIQUE NOT NULL,
        title TEXT NOT NULL,
        title_cn TEXT,
        url TEXT,
        content TEXT,
        content_cn TEXT,
        abstract TEXT,
        points INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        author TEXT,
        created_at INTEGER NOT NULL,
        fetched_at INTEGER NOT NULL
      )
    `);

    // 创建评论表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        hn_comment_id INTEGER UNIQUE NOT NULL,
        parent_id INTEGER,
        author TEXT,
        content TEXT,
        content_cn TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id)
      )
    `);

    // 创建索引
    try {
      this.db.run('CREATE INDEX IF NOT EXISTS idx_posts_fetched_at ON posts(fetched_at DESC)');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_posts_comment_count ON posts(comment_count DESC)');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)');
    } catch (e) {
      // 索引可能已存在，忽略错误
    }

    this.save();
  }

  // 保存数据库到磁盘
  save() {
    if (this.db) {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    }
  }

  // 插入或更新帖子
  upsertPost(post) {
    const stmt = this.db.prepare(`
      INSERT INTO posts (hn_id, title, title_cn, url, content, content_cn, abstract, points, comment_count, author, created_at, fetched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(hn_id) DO UPDATE SET
        title = excluded.title,
        title_cn = excluded.title_cn,
        content = excluded.content,
        content_cn = excluded.content_cn,
        abstract = excluded.abstract,
        points = excluded.points,
        comment_count = excluded.comment_count,
        fetched_at = excluded.fetched_at
    `);

    stmt.run([
      post.hn_id,
      post.title,
      post.title_cn || null,
      post.url,
      post.content || null,
      post.content_cn || null,
      post.abstract || null,
      post.points,
      post.comment_count,
      post.author,
      post.created_at,
      Date.now()
    ]);

    stmt.free();
    this.save();
  }

  // 批量插入帖子
  batchUpsertPosts(posts) {
    for (const post of posts) {
      this.upsertPost(post);
    }
  }

  // 获取最新的热门帖子（支持排序）
  getLatestPosts(limit = 20, sortBy = 'comments') {
    let orderClause;
    if (sortBy === 'points') {
      orderClause = 'ORDER BY fetched_at DESC, points DESC';
    } else {
      orderClause = 'ORDER BY fetched_at DESC, comment_count DESC';
    }

    const stmt = this.db.prepare(`
      SELECT * FROM posts
      ${orderClause}
      LIMIT ?
    `);

    const result = [];
    stmt.bind([limit]);
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();

    return result;
  }

  // 根据日期获取帖子
  getPostsByDate(date, limit = 20) {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    const stmt = this.db.prepare(`
      SELECT * FROM posts
      WHERE fetched_at >= ? AND fetched_at <= ?
      ORDER BY comment_count DESC
      LIMIT ?
    `);

    const result = [];
    stmt.bind([startOfDay, endOfDay, limit]);
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();

    return result;
  }

  // 搜索帖子
  searchPosts(keyword, limit = 20) {
    const stmt = this.db.prepare(`
      SELECT * FROM posts
      WHERE title LIKE ?
      ORDER BY fetched_at DESC, comment_count DESC
      LIMIT ?
    `);

    const result = [];
    stmt.bind([`%${keyword}%`, limit]);
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();

    return result;
  }

  // 根据ID获取帖子
  getPostById(id) {
    const stmt = this.db.prepare('SELECT * FROM posts WHERE id = ?');
    stmt.bind([id]);

    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();

    return result;
  }

  // 根据 HN ID 获取帖子
  getPostByHnId(hnId) {
    const stmt = this.db.prepare('SELECT * FROM posts WHERE hn_id = ?');
    stmt.bind([hnId]);

    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();

    return result;
  }

  // 更新帖子摘要
  updatePostAbstract(postId, abstract) {
    const stmt = this.db.prepare(`
      UPDATE posts
      SET abstract = ?
      WHERE id = ?
    `);
    stmt.run([abstract, postId]);
    stmt.free();
    this.save();
  }

  // 插入评论
  insertComment(comment) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO comments (post_id, hn_comment_id, parent_id, author, content, content_cn, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        comment.post_id,
        comment.hn_comment_id,
        comment.parent_id,
        comment.author,
        comment.content,
        comment.content_cn || null,
        comment.created_at
      ]);

      stmt.free();
      this.save();
    } catch (e) {
      // 忽略重复评论错误
      if (!e.message.includes('UNIQUE')) {
        console.error('插入评论失败:', e);
      }
    }
  }

  // 批量插入评论
  batchInsertComments(comments) {
    for (const comment of comments) {
      this.insertComment(comment);
    }
  }

  // 获取帖子的评论
  getCommentsByPostId(postId) {
    const stmt = this.db.prepare(`
      SELECT * FROM comments
      WHERE post_id = ?
      ORDER BY created_at DESC
    `);

    const result = [];
    stmt.bind([postId]);
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();

    return result;
  }

  // 获取统计数据
  getStats() {
    let totalPosts = 0;
    let totalComments = 0;
    let totalPoints = 0;

    // 获取总帖子数
    let stmt = this.db.prepare('SELECT COUNT(*) as count FROM posts');
    if (stmt.step()) {
      totalPosts = stmt.getAsObject().count;
    }
    stmt.free();

    // 获取总评论数
    stmt = this.db.prepare('SELECT SUM(comment_count) as count FROM posts');
    if (stmt.step()) {
      totalComments = stmt.getAsObject().count || 0;
    }
    stmt.free();

    // 获取总点赞数
    stmt = this.db.prepare('SELECT SUM(points) as count FROM posts');
    if (stmt.step()) {
      totalPoints = stmt.getAsObject().count || 0;
    }
    stmt.free();

    return {
      totalPosts,
      totalComments,
      totalPoints
    };
  }

  // 删除旧帖子（保留最近N天的数据）
  deleteOldPosts(beforeTimestamp) {
    try {
      // 删除旧评论
      const commentStmt = this.db.prepare(`
        DELETE FROM comments
        WHERE post_id IN (
          SELECT id FROM posts WHERE fetched_at < ?
        )
      `);
      commentStmt.run([beforeTimestamp]);
      commentStmt.free();

      // 删除旧帖子
      const postStmt = this.db.prepare(`
        DELETE FROM posts WHERE fetched_at < ?
      `);
      postStmt.run([beforeTimestamp]);
      postStmt.free();

      this.save();

      const date = new Date(beforeTimestamp).toLocaleString('zh-CN');
      console.log(`已删除 ${date} 之前的旧数据`);
    } catch (error) {
      console.error('删除旧数据失败:', error);
    }
  }

  close() {
    if (this.db) {
      this.save();
      this.db.close();
    }
  }
}

module.exports = DatabaseManager;
