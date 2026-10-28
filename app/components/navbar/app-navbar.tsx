"use client";

import { SOCIAL_URLS } from "@/app/data/socials";
import Link from "next/link";
import { Github, Moon, Star, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";


/** Past this scroll offset the navbar gets a solid surface; at the top it stays transparent. */
const NAV_SOLID_BG_SCROLL_PX = 24;

/** Match Tailwind `lg:` — desktop projects gallery / pin behavior. */
const NAV_PROJECTS_SUPPRESS_MQ = "(min-width: 1024px)";


export default function AppNavbar() {
    const { resolvedTheme, setTheme } = useTheme();
    const pathname = usePathname();
    const isProjectDetailPage = pathname.startsWith("/projects/") && pathname !== "/projects";
    const navRef = useRef<HTMLElement | null>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
    const [navSolidBg, setNavSolidBg] = useState(false);
    const [stars, setStars] = useState<number | null>(null);
    const [themeReady, setThemeReady] = useState(false);
    /** Home `#projects` visible on lg+: do not reveal navbar on scroll-up (immersive scrub section). */
    const projectsNavRevealSuppressedRef = useRef(false);

    useEffect(() => {
        setThemeReady(true);
    }, []);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            const day = days[now.getDay()];
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours >= 12 ? "P.M" : "A.M";
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, "0");
            setCurrentTime(`${day} ${displayHours}:${displayMinutes} ${ampm}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    // On home (lg+), while #projects intersects the viewport: keep scroll-up from revealing the bar.
    useEffect(() => {
        if (pathname !== "/") {
            projectsNavRevealSuppressedRef.current = false;
            return;
        }

        if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
            return;
        }

        const section = document.getElementById("projects");
        if (!section) {
            projectsNavRevealSuppressedRef.current = false;
            return;
        }

        const mq = window.matchMedia(NAV_PROJECTS_SUPPRESS_MQ);

        const sync = (isIntersecting: boolean) => {
            projectsNavRevealSuppressedRef.current = mq.matches && isIntersecting;
        };

        const io = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                sync(entry.isIntersecting);
            },
            { threshold: [0, 0.02, 0.08, 0.15, 0.3], rootMargin: "0px" }
        );

        io.observe(section);

        const onMq = () => {
            if (!mq.matches) {
                projectsNavRevealSuppressedRef.current = false;
                return;
            }
            const r = section.getBoundingClientRect();
            const vh = window.innerHeight;
            const intersects = r.bottom > 0 && r.top < vh;
            sync(intersects);
        };

        mq.addEventListener("change", onMq);
        onMq();

        return () => {
            mq.removeEventListener("change", onMq);
            io.disconnect();
            projectsNavRevealSuppressedRef.current = false;
        };
    }, [pathname]);

    // Hide navbar on scroll down, show on scroll up; solid bar only after leaving the top
    useEffect(() => {
        let lastY = window.scrollY;
        setNavSolidBg(lastY > NAV_SOLID_BG_SCROLL_PX);

        const onScroll = () => {
            const currentY = window.scrollY;
            setNavSolidBg(currentY > NAV_SOLID_BG_SCROLL_PX);
            if (menuOpen) return; // don't hide while overlay is open

            if (currentY > lastY && currentY > 80) {
                setNavHidden(true);
            } else if (currentY < lastY) {
                if (!projectsNavRevealSuppressedRef.current) {
                    setNavHidden(false);
                }
            }
            lastY = currentY;
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [menuOpen]);

    useEffect(() => {
        setNavSolidBg(window.scrollY > NAV_SOLID_BG_SCROLL_PX);
    }, [pathname]);

    useEffect(() => {
        const applyHeaderHeight = () => {
            const nav = navRef.current;
            if (!nav) return;
            const height = Math.ceil(nav.getBoundingClientRect().height);
            document.documentElement.style.setProperty("--app-header-h", `${height}px`);
        };

        applyHeaderHeight();
        window.addEventListener("resize", applyHeaderHeight, { passive: true });

        const nav = navRef.current;
        let observer: ResizeObserver | null = null;
        if (nav && typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(() => applyHeaderHeight());
            observer.observe(nav);
        }

        return () => {
            window.removeEventListener("resize", applyHeaderHeight);
            observer?.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchStars = async () => {
            try {
                const response = await fetch("https://api.github.com/repos/Cardano04class/portfolio-website");
                if (!response.ok) return;
                const data = (await response.json()) as { stargazers_count?: number };
                if (typeof data.stargazers_count === "number") {
                    setStars(data.stargazers_count);
                }
            } catch {
                // silent fallback
            }
        };
        void fetchStars();
    }, []);

    const navItems = [
        { name: "ABOUT", href: "/" },
        { name: "PROJECTS", href: "/projects" },
        { name: "CONTACTS", href: "/#contact" },
    ];

    const topTextClass = isProjectDetailPage ? "text-white/85" : "text-foreground/70";
    const topButtonClass = isProjectDetailPage
        ? "border-white/25 bg-white/10 text-white/90 hover:border-white/40 hover:bg-white/15"
        : "border-border bg-background text-foreground/80 hover:border-foreground/20 hover:bg-muted";
    const menuBarClass = isProjectDetailPage ? "bg-white" : "bg-foreground";
    const themeToggleClass = topButtonClass;

    /** Full-width default at the top of the page (no glass, no bar line). */
    const navSurfaceTopClass = "border-0 bg-transparent backdrop-blur-none";
    /** After scrolling: frosted glass only — no `border-b`. */
    const navSurfaceGlassClass = isProjectDetailPage
        ? "border-0 bg-black/45 backdrop-blur-xl backdrop-saturate-150"
        : "border-0 bg-background/65 backdrop-blur-xl backdrop-saturate-150";
    const navSurfaceClass = navSolidBg ? navSurfaceGlassClass : navSurfaceTopClass;

    return (
        <>
            <nav
                ref={navRef}
                data-shoot-ui="1"
                className={`fixed top-0 z-50 flex w-full min-w-0 items-center justify-between gap-2 py-2 pl-4 pr-3 will-change-transform transition-[transform,opacity,background-color,border-color] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-3 sm:py-3 sm:px-8 md:px-12 lg:px-20 ${navSurfaceClass} ${navHidden && !menuOpen ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
            >
                {/* Left - Logo */}
                <Link href="/" aria-label="Go to home" className="inline-flex min-w-0 shrink items-center">
                    <span className={`${topTextClass} truncate font-semibold leading-[0.88] tracking-[-0.03em] text-[clamp(0.65rem,3.2vw,0.95rem)] sm:text-[clamp(0.72rem,1.35vw,0.95rem)]`}>
                        Cardano_class
                    </span>
                </Link>

                {/* Right Side - GitHub, theme, menu */}
                <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
                    <div className="flex min-w-0 items-center gap-1 rounded-xl px-0 py-0 sm:gap-2 sm:px-2 sm:py-0.5 md:gap-3">
                        <Link
                            href={SOCIAL_URLS.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 transition-colors sm:gap-2 sm:px-2.5 ${topButtonClass}`}
                            aria-label="Open GitHub repository"
                        >
                            <Github className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="text-[10px] font-semibold tabular-nums tracking-wide sm:text-xs">
                                {stars?.toLocaleString() ?? "1,017"}
                            </span>
                            <Star className={`h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5 ${isProjectDetailPage ? "fill-white/90 text-white/90" : "fill-foreground/80 text-foreground/80"}`} />
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setTheme(resolvedTheme === "dark" ? "light" : "dark")
                        }
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${themeToggleClass}`}
                        aria-label={
                            themeReady
                                ? resolvedTheme === "dark"
                                    ? "Switch to light theme"
                                    : "Switch to dark theme"
                                : "Toggle color theme"
                        }
                    >
                        {themeReady ? (
                            resolvedTheme === "dark" ? (
                                <Sun className="h-4 w-4" aria-hidden />
                            ) : (
                                <Moon className="h-4 w-4" aria-hidden />
                            )
                        ) : (
                            <Moon className="h-4 w-4 opacity-0" aria-hidden />
                        )}
                    </button>

                    {/* Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="relative z-60 flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
                        aria-label="Toggle menu"
                    >
                        <span
                            className={`block w-5 h-[2px] ${menuBarClass} transition-all duration-300 origin-center ${
                                menuOpen ? "rotate-45 translate-y-[7px]" : ""
                            }`}
                        />
                        <span
                            className={`block w-5 h-[2px] ${menuBarClass} transition-all duration-300 ${
                                menuOpen ? "opacity-0 scale-x-0" : "opacity-100"
                            }`}
                        />
                        <span
                            className={`block w-5 h-[2px] ${menuBarClass} transition-all duration-300 origin-center ${
                                menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                            }`}
                        />
                    </button>
                </div>
            </nav>

            {/* Full-Screen Menu Overlay */}
            <div
                data-shoot-ui="1"
                className={`fixed inset-0 z-55 transition-all duration-500 ${
                    menuOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                }`}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

                {/* Menu Content */}
                <div className="relative h-full flex flex-col justify-center items-center gap-2 px-8">
                    {/* Close Button */}
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="absolute top-6 right-8 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-300"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Nav Links */}
                    {navItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className={`group relative block py-4 transition-all duration-500 ${
                                    menuOpen
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-8"
                                }`}
                                style={{
                                    transitionDelay: menuOpen ? `${150 + i * 75}ms` : "0ms",
                                }}
                            >
                                <span
                                    className={`text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-wider transition-colors duration-300 ${
                                        isActive
                                            ? "text-foreground"
                                            : "text-foreground/40 group-hover:text-foreground"
                                    }`}
                                >
                                    {item.name}
                                </span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-foreground" />
                                )}
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div
                        className={`w-16 h-px bg-border my-4 transition-all duration-500 ${
                            menuOpen
                                ? "opacity-100 scale-x-100"
                                : "opacity-0 scale-x-0"
                        }`}
                        style={{ transitionDelay: menuOpen ? "375ms" : "0ms" }}
                    />

                    {/* CTA */}
                    <Link
                        href="#contact"
                        onClick={() => setMenuOpen(false)}
                        className={`text-lg sm:text-xl font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all duration-500 ${
                            menuOpen
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-8"
                        }`}
                        style={{ transitionDelay: menuOpen ? "450ms" : "0ms" }}
                    >
                        LET&apos;S WORK
                    </Link>

                    {/* Time display at bottom */}
                    <div
                        className={`absolute bottom-12 left-1/2 -translate-x-1/2 text-muted-foreground text-xs font-mono tracking-widest transition-all duration-500 ${
                            menuOpen
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-4"
                        }`}
                        style={{ transitionDelay: menuOpen ? "525ms" : "0ms" }}
                    >
                        {currentTime}
                    </div>
                </div>
            </div>
        </>
    );
}