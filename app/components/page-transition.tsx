"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { releaseDocumentScroll } from "@/app/utils/release-document-scroll";
import { logProjectsScroll } from "@/app/utils/projects-scroll-debug";

type PageTransitionProps = {
  children: ReactNode;
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [playReveal, setPlayReveal] = useState(false);
  const [lockScroll, setLockScroll] = useState(false);

  useLayoutEffect(() => {
    const persistedLock = window.sessionStorage.getItem("route-transition-lock") === "1";
    if (persistedLock) {
      setLockScroll(true);
      window.sessionStorage.removeItem("route-transition-lock");
    }

    const shouldReveal = window.sessionStorage.getItem("project-transition-reveal") === "1";
    if (!shouldReveal) {
      setPlayReveal(false);
      setLockScroll(false);
      releaseDocumentScroll();
      return;
    }

    window.sessionStorage.removeItem("project-transition-reveal");
    const shouldPlay = pathname.startsWith("/projects/");
    setPlayReveal(shouldPlay);
    if (shouldPlay) {
      setLockScroll(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!lockScroll) return;
    logProjectsScroll("PageTransition applying DOM scroll lock", { lockScroll });
    document.documentElement.classList.add("route-transition-lock");
    document.body.classList.add("route-transition-lock");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      logProjectsScroll("PageTransition lock effect cleanup -> releaseDocumentScroll");
      releaseDocumentScroll();
    };
  }, [lockScroll]);

  // Failsafe: always release scroll lock even if animation callback is skipped
  useEffect(() => {
    if (!playReveal) return;
    const timeoutId = window.setTimeout(() => {
      logProjectsScroll("PageTransition failsafe timeout -> unlock", { pathname });
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
              logProjectsScroll("PageTransition onAnimationComplete -> unlock", { pathname });
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
