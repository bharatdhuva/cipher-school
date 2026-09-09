import React, { useRef, useEffect } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees (default 3.5 deg)
  perspective?: number; // Perspective distance in px (default 1000)
  glowColor?: string; // Radial light glow color
  enableParallax?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 3.5,
  perspective = 1000,
  glowColor = 'rgba(22, 163, 74, 0.09)', // Subtle CipherSchools green accent glow
  enableParallax = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Physics state for smooth spring-like lerp interpolation
  const currentPos = useRef({ x: 0, y: 0, rotX: 0, rotY: 0, glowX: 0, glowY: 0, opacity: 0 });
  const targetPos = useRef({ x: 0, y: 0, rotX: 0, rotY: 0, glowX: 0, glowY: 0, opacity: 0 });
  const rafId = useRef<number | null>(null);
  const isHovered = useRef(false);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card) return;

    let isRunning = false;

    const updatePhysics = () => {
      // Lerp (linear interpolation) factor for smooth spring feel without jitter
      const ease = 0.12;

      currentPos.current.rotX += (targetPos.current.rotX - currentPos.current.rotX) * ease;
      currentPos.current.rotY += (targetPos.current.rotY - currentPos.current.rotY) * ease;
      currentPos.current.glowX += (targetPos.current.glowX - currentPos.current.glowX) * ease;
      currentPos.current.glowY += (targetPos.current.glowY - currentPos.current.glowY) * ease;
      currentPos.current.opacity += (targetPos.current.opacity - currentPos.current.opacity) * ease;

      const { rotX, rotY, glowX, glowY, opacity } = currentPos.current;

      // Apply 3D tilt & dynamic reactive shadow directly to DOM (0 React re-renders)
      const shadowX = (-rotY * 1.8).toFixed(2);
      const shadowY = (rotX * 1.8 + 4).toFixed(2);
      const shadowBlur = (Math.abs(rotX) + Math.abs(rotY) + 12).toFixed(2);

      card.style.transform = `perspective(${perspective}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(0)`;
      card.style.boxShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px -3px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)`;

      if (glow) {
        glow.style.opacity = opacity.toFixed(3);
        glow.style.background = `radial-gradient(circle 220px at ${glowX.toFixed(1)}px ${glowY.toFixed(1)}px, ${glowColor}, transparent 75%)`;
      }

      // Parallax inner badge/icon elements if present
      if (enableParallax) {
        const parallaxEls = card.querySelectorAll<HTMLElement>('[data-tilt-parallax]');
        parallaxEls.forEach((el) => {
          const depth = parseFloat(el.getAttribute('data-tilt-parallax') || '1');
          const px = (rotY * depth * 0.8).toFixed(2);
          const py = (-rotX * depth * 0.8).toFixed(2);
          el.style.transform = `translate3d(${px}px, ${py}px, ${depth * 6}px)`;
        });
      }

      // Check if settled to stop RAF loop when mouse leaves
      const delta =
        Math.abs(targetPos.current.rotX - rotX) +
        Math.abs(targetPos.current.rotY - rotY) +
        Math.abs(targetPos.current.opacity - opacity);

      if (isHovered.current || delta > 0.005) {
        rafId.current = requestAnimationFrame(updatePhysics);
      } else {
        isRunning = false;
        // Reset cleanly to exact defaults
        card.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
        card.style.boxShadow = '';
        if (glow) glow.style.opacity = '0';
        if (enableParallax) {
          const parallaxEls = card.querySelectorAll<HTMLElement>('[data-tilt-parallax]');
          parallaxEls.forEach((el) => {
            el.style.transform = '';
          });
        }
      }
    };

    const startAnimation = () => {
      if (!isRunning) {
        isRunning = true;
        rafId.current = requestAnimationFrame(updatePhysics);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Normalized coordinates (-1 to 1) from card center
      const normX = (clientX / rect.width) * 2 - 1;
      const normY = (clientY / rect.height) * 2 - 1;

      // Smooth subtle tilt bounded to maxTilt (2-5 degrees max)
      targetPos.current.rotX = -normY * maxTilt;
      targetPos.current.rotY = normX * maxTilt;
      targetPos.current.glowX = clientX;
      targetPos.current.glowY = clientY;
      targetPos.current.opacity = 1;

      startAnimation();
    };

    const handleMouseEnter = (e: MouseEvent) => {
      isHovered.current = true;
      const rect = card.getBoundingClientRect();
      targetPos.current.glowX = e.clientX - rect.left;
      targetPos.current.glowY = e.clientY - rect.top;
      targetPos.current.opacity = 1;
      startAnimation();
    };

    const handleMouseLeave = () => {
      isHovered.current = false;
      targetPos.current.rotX = 0;
      targetPos.current.rotY = 0;
      targetPos.current.opacity = 0;
      startAnimation();
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [maxTilt, perspective, glowColor, enableParallax]);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden will-change-transform transition-[border-color] duration-200 [transform-style:preserve-3d] ${className}`}
      style={{
        transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`,
      }}
    >
      {/* Soft cursor-following radial light glow overlay */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 opacity-0"
        style={{
          mixBlendMode: 'multiply',
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
};
