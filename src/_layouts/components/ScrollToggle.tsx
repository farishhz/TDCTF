"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToggle() {
  const [atBottom, setAtBottom] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  // Agar state scroll benar saat pertama render, pakai useLayoutEffect
  useLayoutEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const winH = window.innerHeight;
      const docH = document.body.offsetHeight;
      const isAtTop = scrollY < 20;
      const isAtBottom = winH + scrollY >= docH - 20;
      setAtTop(isAtTop);
      // Jika di atas, pastikan atBottom false agar panah ke bawah
      setAtBottom(isAtTop ? false : isAtBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    onTheme();
    return () => mo.disconnect();
  }, []);

  // Toggle: jika di bawah, klik ke atas. Jika di atas, klik ke bawah. Jika di tengah, klik ke bawah.
  const scroll = () => {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  // Warna lebih kontras dan modern
  const base = isDark
    ? 'bg-gray-800 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  // Sembunyikan tombol di halaman Root ("/") setelah semua hooks
  if (pathname === "/" || pathname === "/info" || pathname === "/rules") return null;

  return (
    <button
      onClick={scroll}
      aria-label={atBottom ? "Scroll to top" : "Scroll to bottom"}
      className="fixed bottom-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 dark:border-white/10 bg-gradient-to-b from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 text-gray-800 dark:text-gray-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 hover:from-white/60 hover:to-white/20 dark:hover:from-white/20 dark:hover:to-white/10 active:scale-[0.95] group"
    >
      <span className="flex items-center justify-center">
        {atBottom ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:-translate-y-0.5">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-y-0.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </span>
    </button>
  );
}
