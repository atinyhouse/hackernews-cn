import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // 从 localStorage 读取用户偏好
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // 如果没有保存的偏好，使用系统偏好
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // 保存用户偏好
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // 更新 body 的 theme 属性
    document.body.setAttribute('theme-mode', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
