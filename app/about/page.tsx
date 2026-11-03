import React from 'react';

export default function AboutPage() {
  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center pt-28 sm:pt-32 md:pt-36 pb-16 px-6 sm:px-12 md:px-16 overflow-hidden"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage: `
          radial-gradient(circle at 15% 20%, #fff9e6 0%, transparent 55%),
          radial-gradient(circle at 85% 15%, #fff0f5 0%, transparent 55%),
          radial-gradient(circle at 50% 50%, #ffffff 0%, transparent 70%)
        `,
      }}
    >
      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-20 items-center">
        {/* Left Column: Image */}
        <div className="flex items-center justify-center md:justify-center md:-translate-x-8 lg:-translate-x-12">
          <div className="relative transition-transform duration-500 hover:scale-[1.02]">
            <img
              src="/images/aboutleft.png"
              alt="FizzWhizz Artisanal Soda"
              className="w-auto h-auto max-h-[60vh] sm:max-h-[70vh] md:max-h-[78vh] lg:max-h-[82vh] max-w-full object-contain select-none"
            />
          </div>
        </div>

        {/* Right Column: Typography */}
        <div className="flex flex-col justify-center items-center text-center max-w-xl mx-auto md:mx-0">
          <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-center max-w-xl bg-gradient-to-r from-[#D946EF] via-[#E11D48] to-[#EA580C] bg-clip-text text-transparent">
            FizzWhizz is where bold flavors meet unstoppable fizz. Made with
            vibrant fruit blends, crisp refreshment, and bubbles that bring every
            moment to life. No boring sips, just pure fizzy happiness! Big
            bubbles. Bold flavors. Endless refreshment. FizzWhizz brings a little
            extra sparkle to every sip, turning ordinary moments into something
            worth popping open.
          </p>
        </div>
      </div>
    </main>
  );
}
