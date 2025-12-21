const DatabaseManager = require('./database');

async function testComments() {
  const db = new DatabaseManager();
  await db.initPromise;

  // Get latest posts
  const posts = db.getLatestPosts(1);
  console.log('Latest post:', posts[0].title);
  console.log('Post ID:', posts[0].id);

  // Get comments for this post
  const comments = db.getCommentsByPostId(posts[0].id);
  console.log('\nTotal comments:', comments.length);

  // Check first 3 comments
  console.log('\nFirst 3 comments with translations:');
  comments.slice(0, 3).forEach((comment, i) => {
    console.log(`\n--- Comment ${i + 1} ---`);
    console.log('Author:', comment.author);
    console.log('Has CN translation:', !!comment.content_cn);
    console.log('CN preview:', comment.content_cn ? comment.content_cn.substring(0, 100) : 'NO TRANSLATION');
    console.log('EN preview:', comment.content.substring(0, 100));
  });

  db.close();
}

testComments();
