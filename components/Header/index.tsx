"use client";

import { useState, useEffect } from "react";

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <header className="bg-sage dark:bg-charcoal shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* App title */}
        <span className="text-cream font-semibold text-lg tracking-wide">
          Budget Manager
        </span>

        {/* Dark / light mode toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex items-center gap-2 text-cream/80 hover:text-cream transition-colors cursor-pointer"
        >
          <span className="text-sm hidden sm:inline">
            {isDark ? "Light" : "Dark"}
          </span>

          {/* Toggle pill */}
          <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
              isDark ? "bg-sage-dark" : "bg-cream/30"
            }`}
          >
            {/* Sliding circle */}
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-cream flex items-center justify-center text-sage-dark transition-transform duration-300 ${
                isDark ? "translate-x-5" : "translate-x-0"
              }`}
            >
              {isDark ? <MoonIcon /> : <SunIcon />}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
