"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export function useGSAP(
    animationFn: () => void,
    dependencies: any[] = []
) {
    const scope = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!scope.current) return;

        const ctx = gsap.context(() => {
            animationFn();
        }, scope);

        return () => {
            ctx.revert();
        };
    }, dependencies);

    return scope;
}

