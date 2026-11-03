'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Shop', href: '/shop' },
  { name: 'Checkout', href: '/checkout' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 md:px-16 py-4 sm:py-5 bg-transparent select-none transition-all duration-300">
      <style>{`
        .gradient-stroke-text {
          color: #ffffff;
          text-shadow:
            /* Lavender (Top & Right) */
            0 -1.8px 0 #c084fc,
            1.3px -1.3px 0 #c084fc,
            1.8px 0 0 #c084fc,
            1.3px 1px 0 #c084fc,
            /* Pastel Pink / Rose (Bottom & Bottom-Right) */
            0.8px 1.6px 0 #f472b6,
            0 1.8px 0 #f472b6,
            -0.8px 1.6px 0 #f472b6,
            -1.3px 1px 0 #f472b6,
            /* Soft Pastel Yellow (Left & Top-Left) */
            -1.8px 0 0 #fef08a,
            -1.3px -1.3px 0 #fef08a,
            -0.8px -1.6px 0 #fef08a;
          transition: color 0.2s ease, text-shadow 0.2s ease;
        }

        .gradient-stroke-text:hover,
        .group:hover .gradient-stroke-text {
          color: #000000 !important;
          text-shadow: none !important;
        }
      `}</style>

      <nav className="relative w-full max-w-7xl mx-auto flex items-center justify-between bg-transparent">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center group z-10">
          <img
            src="/images/companylogo.png"
            alt="FizzWhizz"
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Center: Horizontally Centered Navigation Links on Desktop */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 lg:gap-11">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group relative py-1 text-base lg:text-lg font-black tracking-wide select-none"
            >
              <span className="gradient-stroke-text">
                {link.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Right: Mobile Menu Toggle Button (flush right with proper hit area) */}
        <div className="md:hidden flex items-center z-10">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 text-neutral-800 hover:text-black transition-colors cursor-pointer outline-none rounded-lg flex items-center justify-center active:scale-95"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.4}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Nav Drawer & Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-4 top-16 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-pink-100 flex flex-col gap-4 text-center z-50 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="group relative py-1.5 text-lg font-black tracking-wide"
              >
                <span className="gradient-stroke-text">
                  {link.name}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </header>
  );
}
