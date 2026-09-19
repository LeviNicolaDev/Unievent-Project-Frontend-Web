import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';
const THEME_EVENT = 'unievent-theme-change';

export function useTheme() {
  const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'dark');

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
  }, [theme]);

  useEffect(() => {
    function handleThemeChange(event) {
      setThemeState(event.detail || localStorage.getItem(STORAGE_KEY) || 'dark');
    }

    window.addEventListener(THEME_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_EVENT, handleThemeChange);
  }, []);

  function setTheme(nextTheme) {
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setThemeState(nextTheme);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: nextTheme }));
  }

  return { theme, setTheme, isLight: theme === 'light' };
}
