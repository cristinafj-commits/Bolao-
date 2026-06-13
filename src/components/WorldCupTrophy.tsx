import React from 'react';

interface WorldCupTrophyProps {
  className?: string;
}

export default function WorldCupTrophy({ className = "w-10 h-10" }: WorldCupTrophyProps) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] shrink-0`}
    >
      <defs>
        {/* Shiny Gold Gradient */}
        <linearGradient id="trophy-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8F6A17" />
          <stop offset="25%" stopColor="#FBCA26" />
          <stop offset="50%" stopColor="#FFF4B8" />
          <stop offset="70%" stopColor="#F5C01A" />
          <stop offset="100%" stopColor="#664605" />
        </linearGradient>

        {/* Inner Gold Shadow Gradient */}
        <linearGradient id="trophy-gold-dark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E2AC16" />
          <stop offset="50%" stopColor="#926D0A" />
          <stop offset="100%" stopColor="#4A3402" />
        </linearGradient>

        {/* Emerald Malachite Stripes */}
        <linearGradient id="trophy-malachite" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#034B19" />
          <stop offset="40%" stopColor="#10B981" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#012F0E" />
        </linearGradient>

        {/* Shiny reflection */}
        <linearGradient id="trophy-reflex" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* BASE OF THE TROPHY (Flared Base with Malachite Stripes) */}
      {/* Golden bottom collar */}
      <path d="M16 57C26.5 60.5 37.5 60.5 48 57L46.5 53C37.5 55.5 26.5 55.5 17.5 53L16 57Z" fill="url(#trophy-gold)" />
      
      {/* Malachite Green Band 1 */}
      <path d="M17.5 53C26.5 55.5 37.5 55.5 46.5 53L45.2 49.5C36.8 51.8 27.2 51.8 18.8 49.5L17.5 53Z" fill="url(#trophy-malachite)" />
      
      {/* Mid Golden collar spacer */}
      <path d="M18.8 49.5C27.2 51.8 36.8 51.8 45.2 49.5L44 46C36.2 48 27.8 48 20 46L18.8 49.5Z" fill="url(#trophy-gold)" />
      
      {/* Malachite Green Band 2 */}
      <path d="M20 46C27.8 48 36.2 48 44 46L42.5 42.5C35.8 44.3 28.2 44.3 21.5 42.5L20 46Z" fill="url(#trophy-malachite)" />
      
      {/* Top collar flare */}
      <path d="M21.5 42.5C28.2 44.3 35.8 44.3 42.5 42.5L40.8 39C35 40.5 29 40.5 23.2 39L21.5 42.5Z" fill="url(#trophy-gold)" />

      {/* STEM (Two Spiraling Golden Figures reaching up to the globe) */}
      {/* Central gold body foundation */}
      <path d="M23.2 39C25 35.5 27.5 32 30.5 29C31.5 28 32.5 28 33.5 29C36.5 32 39 35.5 40.8 39C35 41 29 41 23.2 39Z" fill="url(#trophy-gold-dark)" />

      {/* Left Athlete Wing/Curve */}
      <path d="M23.2 39C21.5 34.5 20.2 29 22.8 23C24.5 19 28 17.5 30 19C29.5 21 27.5 24.5 28.5 29C29 31.5 30.5 34.5 31.5 36.5L23.2 39Z" fill="url(#trophy-gold)" />
      
      {/* Right Athlete Wing/Curve */}
      <path d="M40.8 39C42.5 34.5 43.8 29 41.2 23C39.5 19 36 17.5 34 19C34.5 21 36.5 24.5 35.5 29C35 31.5 33.5 34.5 32.5 36.5L40.8 39Z" fill="url(#trophy-gold)" />

      {/* Central twist details (representing the spiraling bands on the real trophy) */}
      <path d="M26 31C28 27.5 31.5 24.5 30.5 21C29.5 18 31 15.5 33 16.5C33.5 18.5 31 22.5 32.5 26C33.5 28 35 29 35.5 31.5C31.2 32.5 28.5 32 26 31Z" fill="url(#trophy-gold)" />
      <path d="M38 31C36 27.5 32.5 24.5 33.5 21C34.5 18 33 15.5 31 16.5C30.5 18.5 33 22.5 31.5 26C30.5 28 29 29 28.5 31.5C32.8 32.5 35.5 32 38 31Z" fill="url(#trophy-gold-dark)" />

      {/* Main raised lines on outer stems */}
      <path d="M22.5 34C21.2 29 21.5 24 24.5 19.5" stroke="url(#trophy-gold)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M41.5 34C42.8 29 42.5 24 39.5 19.5" stroke="url(#trophy-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* GLOBAL EARTH (Golden sphere at top, nestled in curves) */}
      {/* Globe sphere */}
      <circle cx="32" cy="15" r="7.5" fill="url(#trophy-gold)" />
      
      {/* Simple outline of continents to suggest Earth */}
      <path d="M28.5 12.5C29 13.5 31 14 31.5 12C32 10.5 29.5 10.5 28.5 12.5Z" fill="#10B981" fillOpacity="0.12" />
      <path d="M32.5 16.5C33.5 17.5 35.5 16.5 35 15.5C34.5 14.5 33 15 32.5 16.5Z" fill="#10B981" fillOpacity="0.12" />
      <path d="M30 17C31 17.5 32 17.5 32.5 16C31.5 15 30.5 15.5 30 17Z" fill="#10B981" fillOpacity="0.1" />

      {/* Globe specular shimmer/reflection */}
      <path d="M27.5 12.5C28.8 10.2 32.5 9.5 35 11.5C33.2 10.5 30 11 27.5 12.5Z" fill="url(#trophy-reflex)" />
    </svg>
  );
}
