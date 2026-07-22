"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(window.innerWidth * 0.1, 200); // Responsive count

      // Galaxy color palette - stars with blue, white, and purple tints
      const colors = [
        'rgba(255, 255, 255', // White stars
        'rgba(200, 220, 255', // Blue-white stars
        'rgba(180, 200, 255', // Light blue stars
        'rgba(255, 220, 255', // Light purple stars
        'rgba(220, 200, 255', // Purple-white stars
      ];

      for (let i = 0; i < particleCount; i++) {
        const colorIndex = Math.floor(Math.random() * colors.length);
        const baseColor = colors[colorIndex];
        const opacity = Math.random() * 0.8 + 0.2;
        
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 0.3, // 0.3 to 2.8px - varied star sizes
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: opacity,
          color: `${baseColor}, ${opacity})`,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw star with glow effect for larger stars
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // Add glow for larger stars
        if (particle.size > 1.5) {
          ctx.shadowBlur = particle.size * 2;
          ctx.shadowColor = particle.color;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[-5]"
    />
  );
}
