import React from 'react';
import Link from 'next/link';
import { PRODUCTS } from '../data/products';

export default function ShopPage() {
  return (
    <main
      className="relative min-h-[100dvh] md:h-[100dvh] w-full flex flex-col justify-center items-center pt-20 sm:pt-22 md:pt-24 pb-4 sm:pb-6 px-4 sm:px-8 lg:px-12 overflow-hidden"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage: `
          radial-gradient(circle at 15% 20%, #fff9e6 0%, transparent 55%),
          radial-gradient(circle at 85% 15%, #fff0f5 0%, transparent 55%),
          radial-gradient(circle at 50% 85%, #f5eeff 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, #ffffff 0%, transparent 70%)
        `,
      }}
    >
      <div className="relative z-10 max-w-5xl lg:max-w-6xl w-full mx-auto my-auto flex items-center justify-center">
        {/* 3 Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 w-full items-stretch">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 bg-transparent transition-all duration-300 hover:-translate-y-1 ${product.borderClass} ${product.hoverShadow}`}
            >
              {/* Product Bottle Image */}
              <div className="relative flex items-center justify-center w-full h-44 sm:h-48 md:h-52 lg:h-56 mb-3 sm:mb-4 transition-transform duration-500 group-hover:scale-105">
                <img
                  src={product.image}
                  alt={product.alt}
                  className="h-full w-auto max-w-full object-contain select-none drop-shadow-md"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-1 text-center justify-center">
                <h2
                  className={`text-xl sm:text-2xl font-extrabold tracking-tight ${product.titleColor}`}
                >
                  {product.name}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1 sm:mt-1.5 leading-snug min-h-[34px] sm:min-h-[38px] flex items-center justify-center">
                  {product.description}
                </p>

                <div className="text-xl sm:text-2xl font-black text-neutral-800 tracking-tight mt-2 sm:mt-3 mb-1">
                  {product.priceFormatted}
                </div>
              </div>

              {/* Action Buttons: Buy Now + Circular '+' Button */}
              <div className="flex items-center gap-2.5 sm:gap-3 w-full mt-3 sm:mt-4">
                <Link
                  href={`/checkout?add=${product.id}`}
                  className={`flex-1 py-2 sm:py-2.5 px-4 rounded-full font-bold text-center text-xs sm:text-sm text-white transition-all duration-300 shadow-sm active:scale-95 ${product.btnBg} ${product.btnHoverBg}`}
                >
                  Buy Now
                </Link>
                <Link
                  href={`/checkout?add=${product.id}`}
                  aria-label={`Buy ${product.name}`}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white transition-all duration-300 shadow-sm shrink-0 active:scale-95 ${product.btnBg} ${product.btnHoverBg}`}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
