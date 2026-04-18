'use client';

import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sic_dark_v5');
    const shouldBeDark = saved === '1';
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    applyTheme(newDark);
    try {
      localStorage.setItem('sic_dark_v5', newDark ? '1' : '0');
    } catch {}
  };

  return (
    <button
      className="dark-toggle"
      onClick={handleToggle}
      title="Toggle dark mode"
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
