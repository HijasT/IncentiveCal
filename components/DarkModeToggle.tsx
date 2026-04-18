'use client';

export default function DarkModeToggle() {
  return (
    <button
      onClick={() => {
        const html = document.documentElement;
        html.classList.toggle('dark');
        localStorage.setItem('sic_dark_mode', html.classList.contains('dark') ? 'true' : 'false');
      }}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle dark mode"
    >
      <span className="text-xl">🌙</span>
    </button>
  );
}
