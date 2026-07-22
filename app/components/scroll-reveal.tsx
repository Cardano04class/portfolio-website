"use client";

import { useEffect, useRef, ReactNode } from "react";
import anime from "animejs";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    distance?: number;
    className?: string;
    stagger?: number;
}

export default function ScrollReveal({
    children,
    delay = 0,
    duration = 1000,
    distance = 100,
    className = "",
    stagger = 0,
}: ScrollRevealProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Set initial state
        anime.set(element.children, {
            opacity: 0,
            translateY: distance,
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated.current) {
                        hasAnimated.current = true;

                        // Animate in
                        anime({
                            targets: element.children,
                            opacity: [0, 1],
                            translateY: [distance, 0],
                            duration: duration,
                            delay: stagger > 0 ? anime.stagger(stagger, { start: delay }) : delay,
                            easing: "easeOutExpo",
                        });
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -100px 0px",
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [delay, duration, distance, stagger]);

    return (
        <div ref={elementRef} className={className}>
            {children}
        </div>
    );
}
