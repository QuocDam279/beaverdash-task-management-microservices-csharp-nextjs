"use client";

import * as React from "react";
import Image from "next/image";

interface Interactive3DLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Interactive3DLogo({
  width = 56,
  height = 56,
  className = "",
}: Interactive3DLogoProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);
  const [shineX, setShineX] = React.useState(50);
  const [shineY, setShineY] = React.useState(50);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element

    // Calculate percentage relative to dimensions
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;

    // Set reflection coordinates
    setShineX(pctX);
    setShineY(pctY);

    // Calculate tilt angles (max +/- 22 degrees rotation for premium responsive feel)
    const maxTilt = 22;
    const tiltY = ((x - rect.width / 2) / (rect.width / 2)) * maxTilt;
    const tiltX = -((y - rect.height / 2) / (rect.height / 2)) * maxTilt;

    setRotateX(tiltX);
    setRotateY(tiltY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setShineX(50);
    setShineY(50);
  };

  return (
    <div
      ref={containerRef}
      className={`perspective-1000 select-none cursor-pointer flex items-center justify-center ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: `${width + 24}px`,
        height: `${height + 24}px`,
      }}
    >
      <div
        className="preserve-3d transition-tilt relative flex items-center justify-center rounded-2xl w-full h-full border border-slate-100/10 bg-slate-50/5"
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.12)`
            : "rotateX(0deg) rotateY(0deg) scale(1)",
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(24, 104, 219, 0.35), 0 0 25px rgba(24, 104, 219, 0.2)"
            : "none",
        }}
      >
        {/* Dynamic Specular Reflection (Shine Effect) */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-200 z-10"
          style={{
            background: `radial-gradient(circle 60px at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.35) 0%, transparent 75%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Ambient Glow behind the logo */}
        <div
          className="absolute w-4/5 h-4/5 rounded-full bg-gradient-to-br from-[#1868db]/35 to-purple-600/25 blur-xl pointer-events-none transition-all duration-300"
          style={{
            opacity: isHovered ? 0.9 : 0.4,
            transform: `translateZ(-12px) scale(${isHovered ? 1.25 : 1})`,
          }}
        />

        {/* Logo Image (Elevated layer for 3D depth) */}
        <div
          className="relative preserve-3d"
          style={{
            transform: isHovered ? "translateZ(25px)" : "translateZ(0px)",
            filter: isHovered
              ? "drop-shadow(0 15px 20px rgba(0, 0, 0, 0.3))"
              : "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))",
            transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s ease",
          }}
        >
          <Image
            src="/logo.svg"
            alt="Beaverdash Logo"
            width={width}
            height={height}
            className="object-contain select-none pointer-events-none"
            priority
          />
        </div>
      </div>
    </div>
  );
}
