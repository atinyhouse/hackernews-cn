const { translate } = require('@vitalets/google-translate-api');
const cheerio = require('cheerio');

class TranslationService {
  constructor() {
    // 可以配置代理，如果需要的话
    this.agent = null;
  }

  // 移除 HTML 标签
  stripHtml(html) {
    if (!html) return '';
    const $ = cheerio.load(html);
    return $.text().trim();
  }

  // 翻译文本
  async translateText(text, from = 'en', to = 'zh-CN') {
    if (!text || text.trim() === '') return '';

    try {
      // 移除 HTML 标签
      const cleanText = this.stripHtml(text);

      // 如果文本太长，分段翻译
      if (cleanText.length > 1000) {
        return await this.translateLongText(cleanText, from, to);
      }

      const result = await translate(cleanText, {
        from,
        to,
        fetchOptions: this.agent ? { agent: this.agent } : {}
      });

      return result.text;
    } catch (error) {
      console.error('翻译失败:', error.message);
      return ''; // 翻译失败返回空字符串
    }
  }

  // 翻译长文本（分段处理）
  async translateLongText(text, from = 'en', to = 'zh-CN') {
    try {
      // 按句子分割（简单分割）
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const translations = [];

      // 每次翻译 5 个句子
      const batchSize = 5;
      for (let i = 0; i < sentences.length; i += batchSize) {
        const batch = sentences.slice(i, i + batchSize).join(' ');

        try {
          const result = await translate(batch, {
            from,
            to,
            fetchOptions: this.agent ? { agent: this.agent } : {}
          });
          translations.push(result.text);

          // 避免请求过快
          await this.sleep(500);
        } catch (error) {
          console.error(`翻译批次 ${i / batchSize + 1} 失败:`, error.message);
          translations.push(batch); // 失败时保留原文
        }
      }

      return translations.join(' ');
    } catch (error) {
      console.error('长文本翻译失败:', error.message);
      return text; // 失败时返回原文
    }
  }

  // 生成摘要（提取前 200 字）
  generateAbstract(text, maxLength = 200) {
    if (!text) return '';

    const cleanText = this.stripHtml(text);

    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    // 截取到最后一个句子结束符
    let abstract = cleanText.substring(0, maxLength);
    const lastPeriod = Math.max(
      abstract.lastIndexOf('.'),
      abstract.lastIndexOf('!'),
      abstract.lastIndexOf('?'),
      abstract.lastIndexOf('。')
    );

    if (lastPeriod > maxLength / 2) {
      abstract = abstract.substring(0, lastPeriod + 1);
    } else {
      abstract += '...';
    }

    return abstract;
  }

  // 生成智能摘要（基于内容提取关键信息）
  async generateSmartAbstract(title, content, comments) {
    try {
      // 如果有内容，基于内容生成摘要
      if (content) {
        const cleanContent = this.stripHtml(content);
        return this.generateAbstract(cleanContent, 300);
      }

      // 如果没有内容但有评论，从评论中提取摘要
      if (comments && comments.length > 0) {
        // 取点赞最多的前 3 条评论（假设）或前 3 条评论
        const topComments = comments.slice(0, 3);
        const commentTexts = topComments.map(c => this.stripHtml(c.content)).join(' ');

        const abstract = this.generateAbstract(commentTexts, 300);
        return `讨论要点：${abstract}`;
      }

      // 如果都没有，使用标题
      return `关于 "${title}" 的讨论`;
    } catch (error) {
      console.error('生成摘要失败:', error.message);
      return '';
    }
  }

  // 批量翻译帖子
  async translatePost(post) {
    console.log(`  翻译标题: ${post.title.substring(0, 50)}...`);

    const translated = {
      ...post,
      title_cn: await this.translateText(post.title),
      content_cn: post.content ? await this.translateText(post.content) : null,
    };

    // 生成摘要
    if (post.content) {
      translated.abstract = this.generateAbstract(post.content, 300);
    }

    return translated;
  }

  // 批量翻译评论
  async translateComments(comments, maxCount = 10) {
    console.log(`  翻译 ${Math.min(comments.length, maxCount)} 条评论...`);

    const translated = [];

    // 只翻译前 N 条评论（避免翻译过多）
    for (let i = 0; i < Math.min(comments.length, maxCount); i++) {
      const comment = comments[i];

      try {
        const content_cn = await this.translateText(comment.content);
        translated.push({
          ...comment,
          content_cn
        });

        // 避免请求过快
        await this.sleep(300);
      } catch (error) {
        console.error(`  评论 ${i + 1} 翻译失败:`, error.message);
        translated.push({
          ...comment,
          content_cn: '' // 失败时不翻译
        });
      }
    }

    // 剩余的评论不翻译
    if (comments.length > maxCount) {
      for (let i = maxCount; i < comments.length; i++) {
        translated.push({
          ...comments[i],
          content_cn: null
        });
      }
    }

    return translated;
  }

  // 延迟函数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = TranslationService;
