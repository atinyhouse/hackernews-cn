// 简单的翻译服务 - 使用本地翻译库或模拟翻译
const cheerio = require('cheerio');

class SimpleTranslationService {
  constructor() {
    // 常见技术词汇翻译映射
    this.commonTranslations = {
      'Ask HN': '问 HN',
      'Tell HN': '告诉 HN',
      'Show HN': '展示 HN',
      'Working On': '正在做什么',
      'December': '十二月',
      'Mozilla': 'Mozilla（火狐）',
      'CEO': '首席执行官',
      'GitHub': 'GitHub',
      'Actions': '动作',
      'Pricing': '定价',
      'Changes': '变更',
      'AI': '人工智能',
      'trying hard to kill itself': '试图自杀吗',
      'appoints new': '任命新的',
      'AWS': '亚马逊云服务',
      'junior devs': '初级开发者',
      'replacing': '取代',
      'dumbest ideas': '最愚蠢的想法之一',
      'Gemini': 'Gemini（双子座）',
      'Flash': '闪电',
      'Frontier intelligence': '前沿智能',
      'built for speed': '为速度而生',
      'watch': '观察',
      'formal verification': '形式化验证',
      'go mainstream': '成为主流',
      'Next Chapter': '下一章',
      'Response': '回应',
      'HN was down': 'HN 宕机了',
      'Coursera': 'Coursera（在线教育平台）',
      'combine with': '与...合并',
      'Udemy': 'Udemy（在线教育平台）',
      'Orbital': '轨道',
      'Terrestrial': '地面',
      'Data Centers': '数据中心',
      'Economics': '经济学',
      'desires': '欲望',
      'eating life': '吞噬生活',
      'Image': '图像',
      'romanization rules': '罗马化规则',
      'revise': '修订',
      'first time in 70 years': '70年来首次',
      'Japan': '日本',
      'fMRI signals': 'fMRI信号',
      'brain activity': '大脑活动',
      'correspond to actual': '对应实际',
      'Happiness Report': '幸福报告',
      'methodological problems': '方法论问题',
      'beset with': '充满',
      'got hacked': '被黑了',
      'server': '服务器',
      'mining': '挖矿',
      'Monero': '门罗币',
      'heat pumps': '热泵',
      'biggest': '最大的',
      'What Are You': '你在做什么',
      'Is': '是',
      'will make': '将使',
      'No': '没有',
      'Here': '这里'
    };
  }

  // 移除 HTML 标签
  stripHtml(html) {
    if (!html) return '';
    const $ = cheerio.load(html);
    return $.text().trim();
  }

  // 简单的关键词翻译
  async translateText(text) {
    if (!text) return '';

    const cleanText = this.stripHtml(text);
    let translated = cleanText;

    // 应用常见翻译
    for (const [en, cn] of Object.entries(this.commonTranslations)) {
      const regex = new RegExp(en, 'gi');
      translated = translated.replace(regex, cn);
    }

    return translated;
  }

  // 生成摘要
  generateAbstract(text, maxLength = 200) {
    if (!text) return '';

    const cleanText = this.stripHtml(text);

    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    let abstract = cleanText.substring(0, maxLength);
    const lastPeriod = Math.max(
      abstract.lastIndexOf('.'),
      abstract.lastIndexOf('!'),
      abstract.lastIndexOf('?')
    );

    if (lastPeriod > maxLength / 2) {
      abstract = abstract.substring(0, lastPeriod + 1);
    } else {
      abstract += '...';
    }

    return abstract;
  }

  // 翻译帖子
  async translatePost(post) {
    console.log(`  翻译: ${post.title.substring(0, 50)}...`);

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

  // 翻译评论
  async translateComments(comments, maxCount = 10) {
    console.log(`  翻译 ${Math.min(comments.length, maxCount)} 条评论...`);

    const translated = [];

    for (let i = 0; i < Math.min(comments.length, maxCount); i++) {
      const comment = comments[i];
      const content_cn = await this.translateText(comment.content);
      translated.push({
        ...comment,
        content_cn
      });
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

module.exports = SimpleTranslationService;
