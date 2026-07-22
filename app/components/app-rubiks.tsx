"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCubesProps {
  className?: string;
}

// Tech Stack SVG Components
const techLogos = {
  css3: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100">
      <path fill="#264de4" d="m94.175 0-8.033 89.99L50.034 100l-36.01-9.996L6 0z"/>
      <path fill="#2965f1" d="m79.265 84.26 6.864-76.9H50.087v84.988z"/>
      <path fill="#ebebeb" d="m24.396 40.74.99 11.039h24.702V40.74zm25.692-22.342h-27.68l1.003 11.038h26.676zm-.001 62.495V69.408l-.048.013-12.294-3.32-.786-8.803H25.878l1.547 17.332 22.612 6.277z"/>
      <path fill="#fff" d="m63.642 51.779-1.281 14.316-12.312 3.323v11.484l22.63-6.272.166-1.865 2.594-29.06.27-2.965L77.7 18.398H50.05v11.038h15.555L64.599 40.74H50.05v11.04z"/>
    </svg>
  ),
  react: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <g fill="#61DAFB">
        <circle cx="64" cy="64" r="11.4"/>
        <path d="M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13.2-.2-22.5-6.6-26.1-1.9-1.1-4-1.6-6.4-1.6-7 0-15.9 5.2-24.9 13.9-9-8.7-17.9-13.9-24.9-13.9-2.4 0-4.5.5-6.4 1.6-6.4 3.7-8.7 13-6.6 26.1.4 2.3.9 4.7 1.5-7.1 2.4-.7 4.7-1.4 6.9-2.3 12.5-4.8 19.3-11.4 19.3-18.8s-6.8-14-19.3-18.8zM92.5 14.7c4.1 2.4 5.5 9.8 3.8 20.3-.3 2.1-.8 4.3-1.4 6.6-5.2-1.2-10.7-2-16.5-2.5-3.4-4.8-6.9-9.1-10.4-13 7.4-7.3 14.9-12.3 21-12.3 1.3 0 2.5.3 3.5.9zM81.3 74c-1.8 3.2-3.9 6.4-6.1 9.6-3.7.3-7.4.4-11.2.4-3.9 0-7.6-.1-11.2-.4-2.2-3.2-4.2-6.4-6-9.6-1.9-3.3-3.7-6.7-5.3-10 1.6-3.3 3.4-6.7 5.3-10 1.8-3.2 3.9-6.4 6.1-9.6 3.7-.3 7.4-.4 11.2-.4 3.9 0 7.6.1 11.2.4 2.2 3.2 4.2 6.4 6 9.6 1.9 3.3 3.7 6.7 5.3 10-1.7 3.3-3.4 6.6-5.3 10zm8.3-3.3c1.5 3.5 2.7 6.9 3.8 10.3-3.4.8-7 1.4-10.8 1.9 1.2-1.9 2.5-3.9 3.6-6 1.2-2.1 2.3-4.2 3.4-6.2zM64 97.8c-2.4-2.6-4.7-5.4-6.9-8.3 2.3.1 4.6.2 6.9.2 2.3 0 4.6-.1 6.9-.2-2.2 2.9-4.5 5.7-6.9 8.3zm-18.6-15c-3.8-.5-7.4-1.1-10.8-1.9 1.1-3.3 2.3-6.8 3.8-10.3 1.1 2 2.2 4.1 3.4 6.1 1.2 2.2 2.4 4.1 3.6 6.1zm-7-25.5c-1.5-3.5-2.7-6.9-3.8-10.3 3.4-.8 7-1.4 10.8-1.9-1.2 1.9-2.5 3.9-3.6 6-1.2 2.1-2.3 4.2-3.4 6.2zM64 30.2c2.4 2.6 4.7 5.4 6.9 8.3-2.3-.1-4.6-.2-6.9-.2-2.3 0-4.6.1-6.9.2 2.2-2.9 4.5-5.7 6.9-8.3zm22.2 21.1c-1.2-2-2.2-4.1-3.4-6.2-1.2-2.1-2.4-4.2-3.6-6-3.8.5-7.4 1.1-10.8 1.9 1.1 3.3 2.3 6.8 3.8 10.3zM35.5 14.7c1-.6 2.2-.9 3.5-.9 6.1 0 13.6 5 21 12.3-3.5 3.8-7 8.2-10.4 13-5.8.5-11.3 1.4-16.5 2.5-.6-2.3-1-4.5-1.4-6.6-1.7-10.5-.3-17.9 3.8-20.3zM19.3 69.8c1.3-.7 2.8-1.3 4.4-2 1.4-.6 2.9-1.2 4.4-1.7.5 2.5 1.2 5.1 2.1 7.6-1 2.5-1.7 5.1-2.1 7.6-1.5-.5-3-1.1-4.4-1.7-1.6-.7-3.1-1.3-4.4-2-7.4-3.6-11.3-8-11.3-11.6 0-3.6 3.9-8 11.3-11.6zM35.5 113.3c-4.1-2.4-5.5-9.8-3.8-20.3.3-2.1.8-4.3 1.4-6.6 5.2 1.2 10.7 2 16.5 2.5 3.4 4.8 6.9 9.1 10.4 13-7.4 7.3-14.9 12.3-21 12.3-1.3 0-2.5-.3-3.5-.9zM96.5 92.9c1.7 10.5.3 17.9-3.8 20.3-1 .6-2.2.9-3.5.9-6.1 0-13.6-5-21-12.3 3.5-3.8 7-8.2 10.4-13 5.8-.5 11.3-1.4 16.5-2.5.6 2.4 1 4.6 1.4 6.6zM108.7 69.8c-1.3.7-2.8 1.3-4.4 2-1.4.6-2.9 1.2-4.4 1.7-.5-2.5-1.2-5.1-2.1-7.6 1-2.5 1.7-5.1 2.1-7.6 1.5.5 3 1.1 4.4 1.7 1.6.7 3.1 1.3 4.4 2 7.4 3.6 11.3 8 11.3 11.6 0 3.6-3.9 8-11.3 11.6z"/>
      </g>
    </svg>
  ),
  typescript: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <path fill="#3178c6" d="M2 63.91v62.5h125v-125H2zm100.73-5a15.56 15.56 0 017.82 4.5 20.58 20.58 0 013 4c0 .16-5.4 3.81-8.69 5.85-.12.08-.6-.44-1.13-1.23a7.09 7.09 0 00-5.87-3.53c-3.79-.26-6.23 1.73-6.21 5a4.58 4.58 0 00.54 2.34c.83 1.73 2.38 2.76 7.24 4.86 8.95 3.85 12.78 6.39 15.16 10 2.66 4 3.25 10.46 1.45 15.24-2 5.2-6.9 8.73-13.83 9.9a38.32 38.32 0 01-9.52-.1 23 23 0 01-12.72-6.63c-1.15-1.27-3.39-4.58-3.25-4.82a9.34 9.34 0 011.15-.73L82 101l3.59-2.08.75 1.11a16.78 16.78 0 004.74 4.54c4 2.1 9.46 1.81 12.16-.62a5.43 5.43 0 00.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48 16.48 0 01-3.43-6.25 25 25 0 01-.22-8c1.33-6.23 6-10.58 12.82-11.87a31.66 31.66 0 019.49.26zm-29.34 5.24v5.12H57.16v46.23H45.65V69.26H29.38v-5a49.19 49.19 0 01.14-5.16c.06-.08 10-.12 22-.1h21.81z"/>
    </svg>
  ),
  html5: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <path fill="#E44D26" d="M19.037 113.876L9.032 1.661h109.936l-10.016 112.198-45.019 12.48z"/>
      <path fill="#F16529" d="M64 116.8l36.378-10.086 8.559-95.878H64z"/>
      <path fill="#EBEBEB" d="M64 52.455H45.788L44.53 38.361H64V24.599H29.489l.33 3.692 3.382 37.927H64zm0 35.743l-.061.017-15.327-4.14-.979-10.975H33.816l1.928 21.609 28.193 7.826.063-.017z"/>
      <path fill="#fff" d="M63.952 52.455v13.763h16.947l-1.597 17.849-15.35 4.143v14.319l28.215-7.82.207-2.325 3.234-36.233.335-3.696h-3.708zm0-27.856v13.762h33.244l.276-3.092.628-6.978.329-3.692z"/>
    </svg>
  ),
  javascript: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <path fill="#F0DB4F" d="M2 1v125h125V1H2zm66.119 106.513c-1.845 3.749-5.367 6.212-9.448 7.401-6.271 1.44-12.269.619-16.731-2.059-2.986-1.832-5.318-4.652-6.901-7.901l9.52-5.83c.083.035.333.487.667 1.071 1.214 2.034 2.261 3.474 4.319 4.485 2.022.69 6.461 1.131 8.175-2.427 1.047-1.81.714-7.628.714-14.065C58.433 78.073 58.48 68 58.48 58h11.709c0 11 .06 21.418 0 32.152.025 6.58.596 12.446-2.07 17.361zm48.574-3.308c-4.07 13.922-26.762 14.374-35.83 5.176-1.916-2.165-3.117-3.296-4.26-5.795 4.819-2.772 4.819-2.772 9.508-5.485 2.547 3.915 4.902 6.068 9.139 6.949 5.748.702 11.531-1.273 10.234-7.378-1.333-4.986-11.77-6.199-18.873-10.531-7.211-4.843-8.901-16.611-2.975-23.335 1.975-2.487 5.343-4.343 8.877-5.235l3.688-.477c7.081-.143 11.507 1.727 14.756 5.355.904.916 1.642 1.904 3.022 4.045-3.772 2.404-3.76 2.381-9.163 5.879-1.154-2.486-3.069-4.046-5.093-4.724-3.142-.952-7.104.083-7.926 3.403-.285 1.88.096 3.553 1.212 5.096 2.045 2.479 6.237 3.968 9.661 5.428 6.038 2.244 14.024 4.771 15.672 13.629.76 4.465-.419 8.643-2.649 12z"/>
    </svg>
  ),
  tailwind: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <path d="M64.004 25.602c-17.067 0-27.73 8.53-32 25.597 6.398-8.531 13.867-11.73 22.398-9.597 4.871 1.214 8.352 4.746 12.207 8.66C72.883 56.629 80.145 64 96.004 64c17.066 0 27.73-8.531 32-25.602-6.399 8.536-13.867 11.735-22.399 9.602-4.87-1.215-8.347-4.746-12.207-8.66-6.27-6.367-13.53-13.738-29.394-13.738zM32.004 64c-17.066 0-27.73 8.531-32 25.602C6.402 81.066 13.87 77.867 22.402 80c4.871 1.215 8.352 4.746 12.207 8.66 6.274 6.367 13.536 13.738 29.395 13.738 17.066 0 27.73-8.53 32-25.597-6.399 8.531-13.867 11.73-22.399 9.597-4.87-1.214-8.347-4.746-12.207-8.66C55.128 71.371 47.868 64 32.004 64zm0 0" fill="#38bdf8"/>
    </svg>
  ),
  nodejs: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <path fill="#83CD29" d="M112.678 30.334L68.535 4.729c-2.781-1.584-6.424-1.584-9.227 0L14.82 30.334C11.951 31.985 10 35.088 10 38.407v51.142c0 3.319 1.951 6.449 4.82 8.073l11.952 6.891c6.491 3.245 8.818 3.245 11.824 3.245 9.66 0 15.196-5.879 15.196-16.1V41.434c0-.717-.586-1.305-1.305-1.305h-5.717c-.718 0-1.304.588-1.304 1.305v50.224c0 3.851-3.984 7.707-10.465 4.449l-12.533-7.191c-.377-.214-.611-.611-.611-1.029V38.407c0-.42.235-.814.611-1.029l43.786-25.293c.353-.207.828-.207 1.181 0l43.786 25.293c.377.215.611.609.611 1.029v51.142c0 .42-.235.814-.611 1.029L68.51 115.871c-.353.207-.828.207-1.181 0l-11.195-6.629c-.326-.191-.766-.207-1.117-.044-3.062 1.715-3.67 1.946-6.549 2.358-.819.115-2.004.462 1.178 1.898l14.577 8.641c1.391.793 2.964 1.212 4.566 1.212 1.602 0 3.174-.419 4.565-1.212l43.786-25.293c2.869-1.653 4.82-4.757 4.82-8.073V38.407c0-3.319-1.951-6.422-4.82-8.073z"/>
      <path fill="#83CD29" d="M77.91 81.445c-11.726 0-14.309-3.235-15.17-9.66-.102-.628-.634-1.099-1.265-1.099h-5.859c-.709 0-1.288.579-1.288 1.288 0 7.547 4.105 16.519 23.582 16.519 14.053 0 22.109-5.551 22.109-15.22 0-9.697-6.551-12.258-20.365-14.072-13.949-1.835-15.264-2.763-15.264-5.989 0-2.665 1.186-6.206 11.455-6.206 9.082 0 12.425 1.963 13.785 8.074.118.628.623 1.093 1.265 1.093h5.859c.346 0 .674-.133.918-.377.244-.244.373-.572.347-.918-.627-10.492-7.549-15.395-22.174-15.395-12.688 0-20.261 5.355-20.261 14.327 0 9.835 7.617 12.573 19.932 13.747 14.698 1.42 15.697 3.543 15.697 6.459 0 5.015-4.046 7.13-13.567 7.13z"/>
    </svg>
  ),
};

const CUBE_SIZE = 50;
const SPACING = 5; // Gap between cubes
const TOTAL_SIZE = CUBE_SIZE + SPACING;

// Helper to determine face colors based on 3D position (x, y, z indices: 0..2)
const getFaceColors = (x: number, y: number, z: number) => {
  // Metallic chrome aesthetic
  // Exterior faces: Metallic Grey (Gradient handled in CSS via class)
  // Interior faces: Metallic Black/Dark Grey
  
  return {
    front: 'face-metallic-outer',
    back: 'face-metallic-outer',
    right: 'face-metallic-outer',
    left: 'face-metallic-outer',
    top: 'face-metallic-outer',
    bottom: 'face-metallic-outer',
  };
};

// Brand colors for explosion state
const techColors: Record<string, string> = {
  css3: '#264de4',
  typescript: '#3178c6',
  html5: '#E44D26',
  react: '#222222', // Dark grey for React to make cyan logo pop
  nodejs: '#339933',
  tailwind: '#0F172A', // Dark slate for Tailwind
  javascript: '#F7DF1E'
};

export function AnimatedCubes({ className }: AnimatedCubesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for smooth animation
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animationCompleteRef = useRef(false);
  const requestRef = useRef<number>(0);

  // Generate 27 cubes (3x3x3 grid)
  interface CubeData {
    x: number;
    y: number;
    z: number;
    initialX: number;
    initialY: number;
    initialZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
    faceColors: {
      front: string;
      back: string;
      right: string;
      left: string;
      top: string;
      bottom: string;
    };
    logo: React.ReactNode;
    techColor: string;
  }
  const cubes: CubeData[] = [];
  const logoKeys = ['css3', 'typescript', 'html5', 'react', 'nodejs', 'tailwind', 'javascript', 'css3', 'html5', 'react', 'nodejs', 'tailwind', 'javascript', 'css3', 'typescript', 'html5', 'react', 'nodejs', 'tailwind', 'javascript', 'css3', 'html5', 'react', 'nodejs', 'tailwind', 'javascript', 'css3'];

  for (let z = 0; z < 3; z++) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const xPos = (x - 1) * TOTAL_SIZE;
        const yPos = (y - 1) * TOTAL_SIZE;
        const zPos = (z - 1) * TOTAL_SIZE;

        // Assign a logo to EVERY cube
        const globalIndex = z * 9 + y * 3 + x;
        const key = logoKeys[globalIndex % logoKeys.length];
        // @ts-ignore
        const logo = techLogos[key];
        const techColor = techColors[key] || '#333';

        const randomSign = () => Math.random() > 0.5 ? 1 : -1;
        const targetX = (Math.random() * 600 + 200) * randomSign();
        const targetY = (Math.random() * 400 + 100) * randomSign();
        const targetZ = (Math.random() * 500) * randomSign();
        
        cubes.push({
          x, y, z,
          initialX: xPos,
          initialY: yPos,
          initialZ: zPos,
          targetX,
          targetY,
          targetZ,
          faceColors: getFaceColors(x, y, z),
          logo,
          techColor
        });
      }
    }
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollableParent = container.closest('main');
    if (!scrollableParent) return;

    const maxScroll = 500;

    // Optimized Animation Loop: Update only ONE CSS variable instead of 27 elements
    const animate = () => {
      // Linear Interpolation (Lerp) for smoothness
      const diff = targetProgressRef.current - currentProgressRef.current;
      
      // Stop animating if very close to save resources
      if (Math.abs(diff) > 0.001) {
        currentProgressRef.current += diff * 0.1;
      } else {
        currentProgressRef.current = targetProgressRef.current;
      }
      
      const progressRatio = currentProgressRef.current / maxScroll;
      
      // Update global progress variable
      container.style.setProperty('--progress', progressRatio.toString());

      // Toggle classes based on progress thresholds
      const cubeContainersContainer = container.querySelector(".cubes-wrapper") as HTMLElement;
      if (cubeContainersContainer) {
        if (progressRatio >= 0.99) {
          if (!cubeContainersContainer.classList.contains('floating-all')) {
             cubeContainersContainer.classList.add('floating-all');
          }
        } else {
          if (cubeContainersContainer.classList.contains('floating-all')) {
             cubeContainersContainer.classList.remove('floating-all');
          }
        }
      }

      // Check completion - allow a small buffer for float imprecision
      if (progressRatio >= 0.98 && !animationCompleteRef.current) {
         animationCompleteRef.current = true;
         // Do not force reset scrollTop here; let the user's scroll naturally take over
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    // Start loop
    requestRef.current = requestAnimationFrame(animate);

    const handleWheel = (e: WheelEvent) => {
      const scrollDelta = e.deltaY;
      const currentScrollTop = scrollableParent.scrollTop;
      const isAtTop = currentScrollTop < 50;

      if (!isAtTop) return;

      if (animationCompleteRef.current && scrollDelta > 0) return;

      if (scrollDelta < 0 && animationCompleteRef.current) {
        animationCompleteRef.current = false;
      }

      // Only hijack scroll if we are animating the cubes
      if (animationCompleteRef.current === false) {
        e.preventDefault();
        e.stopPropagation();
        targetProgressRef.current = Math.max(0, Math.min(maxScroll, targetProgressRef.current + scrollDelta));
      }
    };

    scrollableParent.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollableParent.removeEventListener("wheel", handleWheel);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("w-full h-full pointer-events-none flex items-center justify-center", className)} style={{ perspective: '1200px', '--progress': 0 } as React.CSSProperties}>
      <style>{`
        .cubes-wrapper {
          transform-style: preserve-3d;
          /* Tilted slightly to show 3D nature of the initial cube */
          transform: rotateX(-25deg) rotateY(-35deg) translate3d(calc(var(--progress) * -25vw), 0, 0); 
          will-change: transform;
        }
        
        .cubes-wrapper.floating-all {
             animation: globalFloat 10s ease-in-out infinite;
        }

        @keyframes globalFloat {
           0%, 100% { transform: rotateX(-25deg) rotateY(-35deg) translate3d(-25vw, 0, 0); }
           50% { transform: rotateX(-20deg) rotateY(-40deg) translate3d(-25vw, -20px, 0); }
        }

        /* Individual cube continuous rotation when exploded */
        .floating-all .cube {
           animation: individualSpin 20s linear infinite !important;
        }

        @keyframes individualSpin {
           from { transform: rotateX(0deg) rotateY(0deg); }
           to { transform: rotateX(360deg) rotateY(360deg); }
        }

        .cube-container {
          position: absolute;
          width: 50px;
          height: 50px;
          transform-style: preserve-3d;
          /* Center pivot */
          top: 50%;
          left: 50%;
          margin-top: -25px;
          margin-left: -25px;
          /* High-performance interpolation using CSS variables */
          transform: translate3d(
            calc(var(--start-x) * 1px + (var(--target-x) - var(--start-x)) * var(--progress) * 1px),
            calc(var(--start-y) * 1px + (var(--target-y) - var(--start-y)) * var(--progress) * 1px),
            calc(var(--start-z) * 1px + (var(--target-z) - var(--start-z)) * var(--progress) * 1px)
          );
          will-change: transform;
        }

        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          /* Rotate based on progress */
          transform: rotateX(calc(var(--progress) * 720deg)) rotateY(calc(var(--progress) * 720deg)) rotateZ(calc(var(--progress) * 720deg));
          will-change: transform;
        }

        .cube-face {
          position: absolute;
          width: 50px;
          height: 50px;
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 4px; 
          display: flex;
          align-items: center;
          justify-content: center;
          backface-visibility: hidden; /* Important for performance */
          overflow: hidden;
        }

        /* Metallic Outer Face (Chrome/Silver) */
        /* Changed to DARKER BLACK METALLIC as requested for non-exploded state */
        .face-metallic-outer {
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #000000 100%);
          box-shadow: inset 0 0 15px rgba(0,0,0,0.8);
        }
        
        /* Metallic Inner Face (Dark Chrome/Black Metal) */
        .face-metallic-inner {
          background: linear-gradient(135deg, #111 0%, #000 100%);
        }
        
        /* High-performance Color Overlay */
        .color-overlay {
          position: absolute;
          inset: 0;
          background-color: var(--tech-color);
          /* Fade in from progress 0.1 to 0.4 - Starts black, transitions to color */
          opacity: calc((var(--progress) - 0.1) * 3.3);
          pointer-events: none;
          z-index: 1;
        }

        /* Shine effect */
        .cube-face::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(to bottom right, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%);
          transform: rotate(45deg);
          pointer-events: none;
          z-index: 3;
        }
        
        .cube-face svg {
            width: 70%;
            height: 70%;
            position: relative;
            z-index: 5; /* Logo must be on top of overlay */
            /* LOGO VISIBILITY: Hidden (opacity 0) at start, fades in during explosion */
            opacity: calc((var(--progress) - 0.1) * 3.3);
        }

        /* Standard Cube Face Transforms */
        .face-front  { transform: rotateY(0deg) translateZ(25px); }
        .face-back   { transform: rotateY(180deg) translateZ(25px); }
        .face-right  { transform: rotateY(90deg) translateZ(25px); }
        .face-left   { transform: rotateY(-90deg) translateZ(25px); }
        .face-top    { transform: rotateX(90deg) translateZ(25px); }
        .face-bottom { transform: rotateX(-90deg) translateZ(25px); }
      `}</style>
      
      <div className="cubes-wrapper w-0 h-0 relative">
        {cubes.map((cube, i) => (
          <div 
            key={i} 
            className="cube-container"
            style={{
              '--start-x': cube.initialX,
              '--start-y': cube.initialY,
              '--start-z': cube.initialZ,
              '--target-x': cube.targetX,
              '--target-y': cube.targetY,
              '--target-z': cube.targetZ,
            } as React.CSSProperties}
          >
            <div className="cube" style={{ '--tech-color': cube.techColor } as React.CSSProperties}>
              <div className={`cube-face face-front ${cube.faceColors.front}`}>
                <div className="color-overlay" />
                {cube.logo}
              </div>
              <div className={`cube-face face-back ${cube.faceColors.back}`}>
                <div className="color-overlay" />
                {cube.logo}
              </div>
              <div className={`cube-face face-right ${cube.faceColors.right}`}>
                <div className="color-overlay" />
                {cube.logo}
              </div>
              <div className={`cube-face face-left ${cube.faceColors.left}`}>
                <div className="color-overlay" />
                {cube.logo}
              </div>
              <div className={`cube-face face-top ${cube.faceColors.top}`}>
                <div className="color-overlay" />
                {cube.logo}
              </div>
              <div className={`cube-face face-bottom ${cube.faceColors.bottom}`}>
                <div className="color-overlay" />
                {cube.logo}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
