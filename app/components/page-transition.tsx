"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import {
  PROJECT_TRANSITION_REVEAL_KEY,
  ROUTE_TRANSITION_LOCK_KEY,
  lockDocumentScroll,
  releaseDocumentScroll,
} from "@/app/utils/release-document-scroll";

type PageTransitionProps = {
  children: ReactNode;
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [playReveal, setPlayReveal] = useState(false);
  const [lockScroll, setLockScroll] = useState(false);

  useLayoutEffect(() => {
    const persistedLock = window.sessionStorage.getItem(ROUTE_TRANSITION_LOCK_KEY) === "1";
    if (persistedLock) {
      setLockScroll(true);
      window.sessionStorage.removeItem(ROUTE_TRANSITION_LOCK_KEY);
    }

    const shouldReveal = window.sessionStorage.getItem(PROJECT_TRANSITION_REVEAL_KEY) === "1";
    if (!shouldReveal) {
      setPlayReveal(false);
      setLockScroll(false);
      releaseDocumentScroll();
      return;
    }

    window.sessionStorage.removeItem(PROJECT_TRANSITION_REVEAL_KEY);
    const shouldPlay = pathname.startsWith("/projects/");
    setPlayReveal(shouldPlay);
    if (shouldPlay) {
      setLockScroll(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!lockScroll) return;
    lockDocumentScroll();
    return releaseDocumentScroll;
  }, [lockScroll]);

  // Failsafe: always release scroll lock even if animation callback is skipped
  useEffect(() => {
    if (!playReveal) return;
    const timeoutId = window.setTimeout(() => {
      setPlayReveal(false);
      setLockScroll(false);
      releaseDocumentScroll();
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [playReveal]);

  return (
    <>
      {playReveal && (
        <div className="pointer-events-none fixed inset-0 z-9999 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={{ y: "0%", backgroundColor: "#0a0a0a" }}
            animate={{
              y: ["0%", "0%", "100%"],
              backgroundColor: ["#0a0a0a", "#070707", "#030303", "#000000", "#000000"],
            }}
            transition={{
              y: {
                duration: 0.95,
                times: [0, 0.32, 1],
                ease: [0.22, 1, 0.36, 1],
              },
              backgroundColor: {
                duration: 0.95,
                times: [0, 0.26, 0.54, 0.8, 1],
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            onAnimationComplete={() => {
              setPlayReveal(false);
              setLockScroll(false);
              releaseDocumentScroll();
            }}
          />
        </div>
      )}
      {children}
    </>
  );
}
