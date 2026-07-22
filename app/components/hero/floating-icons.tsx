"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, Suspense, useEffect } from "react";
import { Mesh, Vector3 } from "three";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Available icons
const iconPaths = [
    "/images/css.png",
    "/images/dragon.png",
    "/images/click.png",
    "/images/html.png",
    "/images/keycap.png",
    "/images/react.png",
];

interface FloatingIconProps {
    position: [number, number, number];
    initialIconIndex: number;
    movementPattern: number; // 0-3 for different movement patterns
    onIconChange?: (newIndex: number) => void;
}

function FloatingIcon({ position, initialIconIndex, movementPattern, onIconChange }: FloatingIconProps) {
    const meshRef = useRef<Mesh>(null);
    const [currentIconIndex, setCurrentIconIndex] = useState(initialIconIndex);
    const [hovered, setHovered] = useState(false);
    const [hoverDirection, setHoverDirection] = useState<{ x: number; y: number } | null>(null);
    const bounceOffsetRef = useRef({ x: 0, y: 0 });
    const bounceStartTimeRef = useRef<number | null>(null);
    const hasBouncedRef = useRef(false);
    const [isMobile, setIsMobile] = useState(false);
    
    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Load texture for current icon
    const texture = useTexture(iconPaths[currentIconIndex]);
    
    // Animation with different movement patterns for each icon
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            
            // Base position - static on mobile, animated on desktop
            let baseX = position[0];
            let baseY = position[1];
            
            // Only animate movement on desktop (not mobile)
            if (!isMobile) {
                // Different movement patterns based on movementPattern index
                // Reduced movement range to prevent covering text
                switch (movementPattern) {
                    case 0: // Top-left: Move diagonally (up-right, down-left)
                        baseX = position[0] + Math.sin(time * 0.4) * 0.15;
                        baseY = position[1] + Math.cos(time * 0.4) * 0.1;
                        break;
                    case 1: // Top-right: Move horizontally (left-right)
                        baseX = position[0] + Math.sin(time * 0.3) * 0.15;
                        baseY = position[1] + Math.sin(time * 0.5) * 0.08;
                        break;
                    case 2: // Bottom-left: Move vertically (up-down) with slight horizontal - constrained upward
                        baseX = position[0] + Math.cos(time * 0.35) * 0.12;
                        baseY = position[1] + Math.sin(time * 0.5) * 0.1; // Reduced vertical movement
                        break;
                    case 3: // Bottom-right: Move diagonally (down-right, up-left) - constrained upward
                        baseX = position[0] + Math.cos(time * 0.4) * 0.15;
                        baseY = position[1] + Math.sin(time * 0.4) * 0.1; // Reduced vertical movement
                        break;
                }
            }
            
            // Single bounce effect when hovered - disabled on mobile
            if (!isMobile && hovered && hoverDirection) {
                if (bounceStartTimeRef.current === null) {
                    // Initialize bounce start time on first hover
                    bounceStartTimeRef.current = time;
                    hasBouncedRef.current = false;
                }
                
                const bounceDuration = 0.5; // Duration of bounce animation in seconds
                const elapsed = time - bounceStartTimeRef.current;
                
                if (elapsed < bounceDuration && !hasBouncedRef.current) {
                    // Single bounce animation using easeOut
                    const progress = elapsed / bounceDuration;
                    const bounceAmount = 0.3;
                    // Ease out bounce curve - bounces away then returns
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const bounce = easeOut * bounceAmount * (1 - progress);
                    
                    bounceOffsetRef.current.x = hoverDirection.x * bounce;
                    bounceOffsetRef.current.y = hoverDirection.y * bounce;
                } else {
                    // Bounce complete, stay still (no more bouncing)
                    hasBouncedRef.current = true;
                    bounceOffsetRef.current.x = 0;
                    bounceOffsetRef.current.y = 0;
                }
            } else {
                // Smooth return to base position when not hovering
                bounceOffsetRef.current.x *= 0.9;
                bounceOffsetRef.current.y *= 0.9;
                bounceStartTimeRef.current = null;
            }
            
            meshRef.current.position.x = baseX + bounceOffsetRef.current.x;
            meshRef.current.position.y = baseY + bounceOffsetRef.current.y;
            
            // Keep scale normal
            meshRef.current.scale.lerp(new Vector3(1, 1, 1), 0.15);
        }
    });

    const handleClick = () => {
        // Cycle to next icon
        const nextIndex = (currentIconIndex + 1) % iconPaths.length;
        setCurrentIconIndex(nextIndex);
        if (onIconChange) {
            onIconChange(nextIndex);
        }
    };

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={handleClick}
            onPointerOver={(e) => {
                e.stopPropagation();
                
                // Only trigger bounce if not already hovered (prevents re-bouncing)
                if (!hovered) {
                    setHovered(true);
                    hasBouncedRef.current = false;
                    bounceStartTimeRef.current = null; // Will be set in useFrame
                    
                    // Calculate hover direction relative to icon center
                    if (meshRef.current) {
                        const iconWorldPos = new Vector3();
                        meshRef.current.getWorldPosition(iconWorldPos);
                        
                        // Get pointer position in world space
                        const pointer = e.point;
                        
                        // Calculate direction from pointer to icon center
                        const dx = iconWorldPos.x - pointer.x;
                        const dy = iconWorldPos.y - pointer.y;
                        
                        // Normalize direction
                        const length = Math.sqrt(dx * dx + dy * dy);
                        if (length > 0) {
                            setHoverDirection({ x: dx / length, y: dy / length });
                        }
                    }
                }
                
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                setHovered(false);
                setHoverDirection(null);
                bounceStartTimeRef.current = null;
                hasBouncedRef.current = false;
                document.body.style.cursor = 'default';
            }}
            scale={1}
        >
            <planeGeometry args={[isMobile ? 0.8 : 1.2, isMobile ? 0.8 : 1.2]} />
            <meshStandardMaterial
                key={currentIconIndex}
                map={texture}
                transparent
                opacity={1}
                toneMapped={false}
            />
        </mesh>
    );
}

export default function FloatingIcons() {
    // Responsive icon positions - static on mobile, positioned at corners
    const [iconPositions, setIconPositions] = useState<[number, number, number][]>([
        [-1.7, 1, -0.5],   // Top left - behind text
        [1.6, 1.2, -0.5],  // Top right - behind text
        [-2.2, -1.2, 0],   // Bottom left - in front of text
        [4, -0.8, 0],      // Bottom right - in front of text
    ]);

    useEffect(() => {
        const updatePositions = () => {
            const width = window.innerWidth;
            
            if (width < 768) {
                // Mobile - static positions at corners, smaller and closer, contained within viewport
                setIconPositions([
                    [-0.5, 1.2, -0.5],   // Top left - static, closer to center
                    [0.5, 1.2, -0.5],    // Top right - static, closer to center
                    [-0.5, -1.2, 0],     // Bottom left - static, closer to center
                    [0.5, -1.2, 0],      // Bottom right - static, closer to center
                ]);
            } else {
                // Desktop - original positions
                setIconPositions([
                    [-1.7, 1, -0.5],     // Top left
                    [1.6, 1.2, -0.5],    // Top right
                    [-2.2, -1.2, 0],     // Bottom left
                    [2.2, -0.8, 0],      // Bottom right
                ]);
            }
        };

        updatePositions();
        window.addEventListener('resize', updatePositions);
        return () => window.removeEventListener('resize', updatePositions);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden" style={{ pointerEvents: 'none', clipPath: 'inset(0)' }}>
            <Canvas 
                camera={{ position: [0, 0, 5], fov: 50 }} 
                style={{ 
                    pointerEvents: 'auto', 
                    cursor: 'default',
                    width: '100%',
                    height: '100%'
                }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={1.5} />
                    <pointLight position={[10, 10, 10]} intensity={2} />
                    <pointLight position={[-10, -10, 10]} intensity={2} />
                    {iconPositions.map((pos, index) => (
                        <FloatingIcon
                            key={index}
                            position={pos}
                            initialIconIndex={index % iconPaths.length}
                            movementPattern={index}
                        />
                    ))}
                </Suspense>
            </Canvas>
        </div>
    );
}

