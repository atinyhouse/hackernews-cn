// 主题颜色配置
export const lightTheme = {
  // 背景色
  bgPrimary: '#ffffff',
  bgSecondary: '#f6f8fa',
  bgTertiary: 'rgba(242, 241, 238, 0.6)',
  bgHover: 'rgba(242, 241, 238, 0.3)',

  // 文字颜色
  textPrimary: 'rgb(55, 53, 47)',
  textSecondary: 'rgba(55, 53, 47, 0.8)',
  textTertiary: 'rgba(55, 53, 47, 0.6)',
  textQuaternary: 'rgba(55, 53, 47, 0.5)',
  textMuted: 'rgba(55, 53, 47, 0.4)',

  // 边框颜色
  borderPrimary: 'rgba(55, 53, 47, 0.09)',
  borderSecondary: 'rgba(55, 53, 47, 0.12)',
  borderAccent: 'rgba(99, 102, 241, 0.3)',

  // 强调色
  accent: 'rgb(99, 102, 241)',
  accentHover: 'rgb(79, 82, 221)',

  // 标签颜色
  tagBg: 'rgba(255, 107, 107, 0.1)',
  tagText: 'rgb(212, 76, 71)',
};

export const darkTheme = {
  // 背景色
  bgPrimary: '#191919',
  bgSecondary: '#2f2f2f',
  bgTertiary: 'rgba(55, 55, 55, 0.6)',
  bgHover: 'rgba(255, 255, 255, 0.05)',

  // 文字颜色
  textPrimary: 'rgba(255, 255, 255, 0.9)',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textTertiary: 'rgba(255, 255, 255, 0.6)',
  textQuaternary: 'rgba(255, 255, 255, 0.5)',
  textMuted: 'rgba(255, 255, 255, 0.4)',

  // 边框颜色
  borderPrimary: 'rgba(255, 255, 255, 0.1)',
  borderSecondary: 'rgba(255, 255, 255, 0.15)',
  borderAccent: 'rgba(139, 142, 251, 0.4)',

  // 强调色
  accent: 'rgb(139, 142, 251)',
  accentHover: 'rgb(159, 162, 255)',

  // 标签颜色
  tagBg: 'rgba(255, 107, 107, 0.2)',
  tagText: 'rgb(255, 127, 127)',
};

export function getTheme(isDark) {
  return isDark ? darkTheme : lightTheme;
}
