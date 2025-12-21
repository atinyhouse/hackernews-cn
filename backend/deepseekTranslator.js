const axios = require('axios');
const cheerio = require('cheerio');

class DeepSeekTranslator {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY;
    this.baseURL = 'https://api.deepseek.com/v1';

    if (!this.apiKey) {
      console.warn('警告: 未设置 DEEPSEEK_API_KEY，翻译功能将使用简单关键词替换');
    }
  }

  // 移除 HTML 标签
  stripHtml(html) {
    if (!html) return '';
    const $ = cheerio.load(html);
    return $.text().trim();
  }

  // 调用 DeepSeek API
  async callDeepSeek(prompt, maxTokens = 2000) {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的技术文章翻译和总结助手。请用简洁、准确、专业的中文进行翻译和总结。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error.message);
      return null;
    }
  }

  // 翻译标题
  async translateTitle(title) {
    if (!this.apiKey) {
      return this.fallbackTranslate(title);
    }

    const prompt = `请将以下英文标题翻译成中文，保持技术术语的准确性：

"${title}"

只返回翻译结果，不要有任何解释。`;

    const result = await this.callDeepSeek(prompt, 200);
    return result || this.fallbackTranslate(title);
  }

  // 翻译内容
  async translateContent(content) {
    if (!content) return '';

    const cleanText = this.stripHtml(content);
    if (!cleanText) return '';

    if (!this.apiKey) {
      return this.fallbackTranslate(cleanText);
    }

    // 如果内容太长，只翻译前 1000 字符
    const textToTranslate = cleanText.length > 1000
      ? cleanText.substring(0, 1000) + '...'
      : cleanText;

    const prompt = `请将以下英文内容翻译成中文：

${textToTranslate}

只返回翻译结果，不要有任何解释。`;

    const result = await this.callDeepSeek(prompt, 1500);
    return result || this.fallbackTranslate(cleanText);
  }

  // 生成摘要
  async generateSummary(title, content, comments = []) {
    if (!this.apiKey) {
      return this.fallbackSummary(title, content, comments);
    }

    const cleanContent = content ? this.stripHtml(content) : '';

    // 构建摘要的上下文
    let context = `标题: ${title}\n\n`;

    if (cleanContent) {
      const contentPreview = cleanContent.substring(0, 500);
      context += `内容: ${contentPreview}\n\n`;
    }

    // 添加更多评论作为参考，体现不同观点
    if (comments.length > 0) {
      context += '社区讨论 (不同用户的观点):\n';
      comments.slice(0, 10).forEach((comment, i) => {
        const commentText = this.stripHtml(comment.content);
        const author = comment.by || 'anonymous';
        context += `\n用户 ${i + 1}: ${commentText.substring(0, 300)}\n`;
      });
    }

    const prompt = `这是一个 HackerNews 论坛帖子的讨论。请生成一个简洁的中文摘要（150-250字），要求：

1. 总结帖子的核心话题
2. 重点概括社区中不同用户的主要观点和争议点
3. 如果有共识，指出大家普遍认同的看法
4. 如果有分歧，列出不同的观点立场
5. 用"有人认为..."、"也有用户指出..."、"讨论中提到..."等表述来体现多元观点

${context}

重要：只返回纯文本摘要，不要使用任何格式标记（如**、-、#等Markdown或HTML格式），直接用自然段落描述即可。`;

    const result = await this.callDeepSeek(prompt, 800);
    return result || this.fallbackSummary(title, content, comments);
  }

  // 后备翻译方法（简单关键词替换）
  fallbackTranslate(text) {
    if (!text) return '';

    const translations = {
      'Ask HN': '问 HN',
      'Tell HN': '告诉 HN',
      'Show HN': '展示 HN',
      'Mozilla': 'Mozilla（火狐）',
      'CEO': '首席执行官',
      'GitHub': 'GitHub',
      'AI': '人工智能',
      'AWS': '亚马逊云服务',
      'API': '应用程序接口',
      'junior devs': '初级开发者',
      'Pricing': '定价',
      'Changes': '变更',
      'trying hard to kill itself': '试图自杀',
      'appoints new': '任命新的',
      'replacing': '取代',
      'Gemini': 'Gemini（双子座）',
      'Flash': '闪电',
      'built for speed': '为速度而生',
      'formal verification': '形式化验证',
      'go mainstream': '成为主流',
      'Coursera': 'Coursera（在线教育平台）',
      'combine with': '与...合并',
      'Udemy': 'Udemy（在线教育平台）',
      'Data Centers': '数据中心',
      'heat pumps': '热泵',
      'biggest': '最大的',
      'Japan': '日本',
      'revise': '修订',
      'romanization rules': '罗马化规则',
      'first time in 70 years': '70年来首次',
      'fMRI signals': 'fMRI信号',
      'brain activity': '大脑活动',
      'Happiness Report': '幸福报告',
      'methodological problems': '方法论问题',
      'got hacked': '被黑了',
      'server': '服务器',
      'mining': '挖矿',
      'Monero': '门罗币'
    };

    let result = text;
    for (const [en, cn] of Object.entries(translations)) {
      const regex = new RegExp(en, 'gi');
      result = result.replace(regex, cn);
    }

    return result;
  }

  // 后备摘要方法
  fallbackSummary(title, content, comments) {
    if (content) {
      const cleanContent = this.stripHtml(content);
      return cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : '');
    }

    if (comments && comments.length > 0) {
      const topComments = comments.slice(0, 3)
        .map(c => this.stripHtml(c.content))
        .join(' ');
      return '讨论要点：' + topComments.substring(0, 200) + '...';
    }

    return `关于"${title}"的讨论`;
  }

  // 翻译帖子
  async translatePost(post) {
    console.log(`  翻译: ${post.title.substring(0, 50)}...`);

    try {
      const title_cn = await this.translateTitle(post.title);

      let content_cn = null;
      if (post.content) {
        content_cn = await this.translateContent(post.content);
        // 添加小延迟避免 API 限流
        await this.sleep(100);
      }

      return {
        ...post,
        title_cn,
        content_cn
      };
    } catch (error) {
      console.error(`  翻译失败: ${error.message}`);
      return {
        ...post,
        title_cn: this.fallbackTranslate(post.title),
        content_cn: post.content ? this.fallbackTranslate(post.content) : null
      };
    }
  }

  // 为帖子生成摘要
  async generatePostSummary(post, comments = []) {
    try {
      const summary = await this.generateSummary(post.title, post.content, comments);
      await this.sleep(100);
      return summary;
    } catch (error) {
      console.error(`  生成摘要失败: ${error.message}`);
      return this.fallbackSummary(post.title, post.content, comments);
    }
  }

  // 翻译评论
  async translateComments(comments, maxCount = 10) {
    console.log(`  翻译 ${Math.min(comments.length, maxCount)} 条评论...`);

    const translated = [];

    for (let i = 0; i < Math.min(comments.length, maxCount); i++) {
      const comment = comments[i];

      try {
        let content_cn = null;

        if (this.apiKey) {
          const cleanContent = this.stripHtml(comment.content);
          if (cleanContent) {
            // 翻译评论（限制在1500字符以内）
            const textToTranslate = cleanContent.length > 1500
              ? cleanContent.substring(0, 1500) + '...'
              : cleanContent;

            const prompt = `请将以下英文评论翻译成中文：

${textToTranslate}

重要要求：
1. 只返回中文翻译，不要包含英文原文
2. 不要添加任何解释或说明
3. 直接输出翻译后的中文内容`;

            content_cn = await this.callDeepSeek(prompt, 1200);
            await this.sleep(100);
          }
        }

        translated.push({
          ...comment,
          content_cn: content_cn || this.fallbackTranslate(comment.content)
        });
      } catch (error) {
        console.error(`  评论翻译失败: ${error.message}`);
        translated.push({
          ...comment,
          content_cn: this.fallbackTranslate(comment.content)
        });
      }
    }

    // 剩余评论不翻译
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

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DeepSeekTranslator;
