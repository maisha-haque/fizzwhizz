'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface Soda {
  id: string;
  name: string;
  flavorTitle: string;
  image: string;
  bgGradient: string;
  theme: {
    trackColor: string;
    glowColor: string;
    flavorColor: string;
  };
}

const sodas: Soda[] = [
  {
    id: 'mango',
    name: 'Mango Soda',
    flavorTitle: 'Mango Splash',
    image: '/images/mangosoda.png',
    bgGradient: 'radial-gradient(circle at 35% 50%, #ffffff 0%, #fffdf5 35%, #fef3c7 75%, #fde68a 100%)',
    theme: {
      trackColor: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      flavorColor: '#d97706',
    },
  },
  {
    id: 'strawberry',
    name: 'Strawberry Soda',
    flavorTitle: 'Strawberry Splash',
    image: '/images/strawberrysoda.png',
    bgGradient: 'radial-gradient(circle at 35% 50%, #ffffff 0%, #fff5f6 35%, #ffe4e6 75%, #fecdd3 100%)',
    theme: {
      trackColor: '#f43f5e',
      glowColor: 'rgba(244, 63, 94, 0.4)',
      flavorColor: '#e11d48',
    },
  },
  {
    id: 'grape',
    name: 'Grape Soda',
    flavorTitle: 'Grape Splash',
    image: '/images/grapesoda.png',
    bgGradient: 'radial-gradient(circle at 35% 50%, #ffffff 0%, #f5eeff 35%, #e9d5ff 70%, #d8b4fe 100%)',
    theme: {
      trackColor: '#8b5cf6',
      glowColor: 'rgba(139, 92, 246, 0.4)',
      flavorColor: '#7c3aed',
    },
  },
];

// 6 slots spaced evenly at 60deg (360 / 6) on the 1000x1000 SVG wheel.
// Base angle 0 with translateX(-radius) positions slot 0 at 9 o'clock.
const WHEEL_ITEMS = [
  { slotIndex: 0, sodaIndex: 0, baseAngle: 0 },   // Mango
  { slotIndex: 1, sodaIndex: 1, baseAngle: 60 },  // Strawberry
  { slotIndex: 2, sodaIndex: 2, baseAngle: 120 }, // Grape
  { slotIndex: 3, sodaIndex: 0, baseAngle: 180 }, // Mango
  { slotIndex: 4, sodaIndex: 1, baseAngle: 240 }, // Strawberry
  { slotIndex: 5, sodaIndex: 2, baseAngle: 300 }, // Grape
];

export default function Banner() {
  const [step, setStep] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active slot (0-5) and active soda (0-2)
  const activeSlot = ((step % WHEEL_ITEMS.length) + WHEEL_ITEMS.length) % WHEEL_ITEMS.length;
  const activeSodaIndex = ((step % sodas.length) + sodas.length) % sodas.length;
  const activeSoda = sodas[activeSodaIndex];

  // Rotate wheel container smoothly counter-clockwise so incoming items rotate into 9 o'clock
  const rotationAngle = -step * 60;

  // Auto-play timer every 3 seconds
  const resetAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStep((prev) => prev + 1);
    }, 3000);
  }, []);

  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetAutoPlay]);

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
    resetAutoPlay();
  }, [resetAutoPlay]);

  return (
    <section className="wheel-section relative w-full h-screen h-[100dvh] flex flex-row items-center overflow-hidden select-none bg-white">
      <style>{`
        @keyframes activeFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(1deg);
          }
        }

        @keyframes activeShadow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(0.85);
            opacity: 0.18;
          }
        }

        .animate-active-float {
          animation: activeFloat 5s ease-in-out infinite;
        }

        .animate-active-shadow {
          animation: activeShadow 5s ease-in-out infinite;
        }

        /* Responsive Wheel Variables */
        .wheel-section {
          --wheel-radius: 115px;
          --bottle-height: 120px;
        }

        @media (min-width: 640px) {
          .wheel-section {
            --wheel-radius: 153px;
            --bottle-height: 160px;
          }
        }

        /* Desktop: Preserves exact original 40vh radius / 32vh height */
        @media (min-width: 768px) {
          .wheel-section {
            --wheel-radius: 40vh;
            --bottle-height: min(32vh, 340px);
          }
        }

        /* Wheel Track Transform: Anchored to right edge on mobile, -40vh on desktop */
        .wheel-track {
          top: 50%;
          right: 0;
          transform: translate(32%, -50%) rotate(var(--rot-angle));
          transform-origin: center center;
          transition: transform 1.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @media (min-width: 768px) {
          .wheel-track {
            right: -40vh;
            transform: translateY(-50%) rotate(var(--rot-angle));
          }
        }
      `}</style>

      {/* Dynamic Backgrounds */}
      {sodas.map((soda, idx) => {
        const isActive = idx === activeSodaIndex;
        return (
          <div
            key={`bg-${soda.id}`}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out pointer-events-none ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ background: soda.bgGradient }}
          />
        );
      })}

      {/* Left Side: Text, Title & Buttons (Side-by-side, aligned left) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-20 w-7/12 sm:w-1/2 md:max-w-xl pl-5 sm:pl-10 md:pl-14 lg:pl-20 flex flex-col justify-center items-start text-left space-y-2 sm:space-y-4 md:space-y-6 pointer-events-auto cursor-default"
      >
        {/* 1. Static Title: Scaled text-2xl sm:text-4xl md:text-6xl lg:text-8xl */}
        <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-white [-webkit-text-stroke:1px_black] sm:[-webkit-text-stroke:1.5px_black] lg:[-webkit-text-stroke:2px_black] tracking-tight leading-none drop-shadow-sm select-none">
          FizzWhizz
        </h1>

        {/* 2. Animated Flavor h2 */}
        <div className="relative h-6 sm:h-9 md:h-12 lg:h-14 overflow-hidden w-full">
          {sodas.map((soda, idx) => {
            const isActive = idx === activeSodaIndex;
            return (
              <h2
                key={`flavor-${soda.id}`}
                style={{ color: soda.theme.flavorColor }}
                className={`absolute inset-0 font-extrabold text-base sm:text-2xl md:text-3xl lg:text-5xl tracking-tight transition-all duration-700 ease-out select-none ${
                  isActive
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6 pointer-events-none'
                }`}
              >
                {soda.flavorTitle}
              </h2>
            );
          })}
        </div>

        {/* 3. Static Tagline */}
        <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-neutral-600 font-medium tracking-wide max-w-[190px] sm:max-w-xs md:max-w-md leading-relaxed select-none">
          • Sipping happiness, one fizz at a time. Keep it cool. Drink it fizzy.
        </p>

        {/* 4. Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 pt-1 sm:pt-2">
          {/* Order Now: Primary Button */}
          <Link
            href="/shop"
            style={{ backgroundColor: activeSoda.theme.trackColor }}
            className="w-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3.5 rounded-full font-bold text-white text-[11px] sm:text-xs lg:text-base shadow-md hover:brightness-105 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer outline-none inline-block text-center"
          >
            Order Now
          </Link>

          {/* Next Flavor Button */}
          <button
            type="button"
            onClick={nextStep}
            style={{ backgroundColor: activeSoda.theme.trackColor }}
            className="w-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3.5 rounded-full font-bold text-white text-[11px] sm:text-xs lg:text-base shadow-md hover:brightness-105 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer outline-none"
          >
            Next Flavor
          </button>
        </div>
      </div>

      {/* Right Side: Rotating Bottle on Semi-Circle Wheel Anchored to Right Edge */}
      <div
        className="wheel-track absolute pointer-events-none w-72 h-72 sm:w-96 sm:h-96 md:w-[100vh] md:h-[100vh]"
        style={
          {
            '--rot-angle': `${rotationAngle}deg`,
          } as React.CSSProperties
        }
      >
        {/* SVG Track Circle: 1000x1000 viewBox with radius 400 */}
        <svg
          className="absolute inset-0 w-full h-full filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.08)] pointer-events-none"
          viewBox="0 0 1000 1000"
        >
          {/* Outer dynamic colored border circle */}
          <circle
            cx="500"
            cy="500"
            r="445"
            fill="none"
            stroke={activeSoda.theme.trackColor}
            strokeWidth="4"
            className="transition-[stroke] duration-1000 ease-out"
          />

          {/* Main White Donut Ring Body (r=400, strokeWidth=90) */}
          <circle
            cx="500"
            cy="500"
            r="400"
            fill="none"
            stroke="#ffffff"
            strokeWidth="90"
          />

          {/* Subtle dashed track centerline */}
          <circle
            cx="500"
            cy="500"
            r="400"
            fill="none"
            stroke="rgba(0, 0, 0, 0.06)"
            strokeWidth="2"
            strokeDasharray="10 10"
          />

          {/* Inner dynamic colored border circle */}
          <circle
            cx="500"
            cy="500"
            r="355"
            fill="none"
            stroke={activeSoda.theme.trackColor}
            strokeWidth="4"
            className="transition-[stroke] duration-1000 ease-out"
          />
        </svg>

        {/* Product Items: Positioned at left: 50%, top: 50% */}
        {WHEEL_ITEMS.map((item) => {
          const soda = sodas[item.sodaIndex];
          const isActive = item.slotIndex === activeSlot;

          return (
            <div
              key={`wheel-item-${item.slotIndex}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 0,
                height: 0,
                transform: `rotate(${item.baseAngle}deg) translateX(calc(-1 * var(--wheel-radius)))`,
              }}
              className="pointer-events-none"
            >
              {/* Inner wrapper centering the image at that point, scaling and floating */}
              <div
                style={{
                  transition: 'transform 1.2s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.9s ease',
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center ${
                  isActive
                    ? 'scale-115 sm:scale-120 md:scale-125 z-30 opacity-100 animate-active-float'
                    : 'scale-75 sm:scale-80 md:scale-85 z-20 opacity-70'
                }`}
              >
                {/* Soda Bottle Image */}
                <img
                  src={soda.image}
                  alt={soda.name}
                  draggable={false}
                  className="w-auto h-[var(--bottle-height)] max-h-[340px] object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.3)] md:drop-shadow-[0_20px_25px_rgba(0,0,0,0.35)] select-none pointer-events-none"
                />

                {/* Soft ground shadow for active bottle */}
                {isActive && (
                  <div className="w-[60px] sm:w-[90px] md:w-[150px] h-[7px] sm:h-[10px] md:h-[16px] rounded-[100%] bg-black/30 blur-md -mt-1 sm:-mt-2 md:-mt-3 animate-active-shadow pointer-events-none" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
