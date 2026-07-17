import { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { 
  Sun, 
  Moon, 
  Users, 
  ArrowDownRight, 
  Mail, 
  Menu, 
  X, 
  ArrowUpRight 
} from 'lucide-react';

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function ScrollSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Failsafe in case of unsupported environment or extreme zoom levels
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
          clearTimeout(timeout);
        }
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px -5% 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      clearTimeout(timeout);
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  );
}

import profileImg from './assets/4904C118-F9CA-4E42-A3D9-C9374DD7C1FE_1_105_c.jpeg';
import transcendenceImg from './assets/transcendence.png';
import inceptionImg from './assets/inception.png';
import minishellImg from './assets/minishell.png';
import pushSwapImg from './assets/push_swap.png';

// Brand logos imported dynamically from assets folder
import jsLogo from './assets/JavaScript.png';
import tsLogo from './assets/TypeScript.png';
import reactLogo from './assets/React.png';
import nextLogo from './assets/Next.js.png';
import tailwindLogo from './assets/Tailwind CSS.png';
import nodeLogo from './assets/Node.js.png';
import laravelLogo from './assets/Laravel.png';
import phpLogo from './assets/PHP.png';
import mysqlLogo from './assets/MySQL.png';
import postgresLogo from './assets/PostgresSQL.png';
import mongoLogo from './assets/MongoDB.png';
import gitLogo from './assets/Git.png';
import dockerLogo from './assets/Docker.png';

const techStacksData = [
  {
    label: "Frontend",
    items: [
      { name: "JavaScript", logo: jsLogo },
      { name: "TypeScript", logo: tsLogo },
      { name: "React", logo: reactLogo },
      { name: "Next.js", logo: nextLogo },
      { name: "Tailwind CSS", logo: tailwindLogo }
    ]
  },
  {
    label: "Backend",
    items: [
      { name: "Node.js", logo: nodeLogo },
      { name: "Laravel", logo: laravelLogo },
      { name: "PHP", logo: phpLogo }
    ]
  },
  {
    label: "Database",
    items: [
      { name: "MySQL", logo: mysqlLogo },
      { name: "PostgresSQL", logo: postgresLogo },
      { name: "MongoDB", logo: mongoLogo }
    ]
  },
  {
    label: "Tools",
    items: [
      { name: "Git", logo: gitLogo },
      { name: "Docker", logo: dockerLogo }
    ]
  }
];

interface Project {
  id: string;
  name: string;
  subtitle: string;
  desc: string;
  tags: string[];
  techTokens: string;
  category: string;
  github: string;
  image: string;
  challenge: string;
  solution: string;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeProject, setActiveProject] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'P.M.' : 'A.M.';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setCurrentTime(`${day} ${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lenis smooth scrolling initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.pageYOffset || document.documentElement.scrollTop);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('cardano_class@proton.me');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gridBgRef = useRef<HTMLDivElement>(null);

  // Simulated live active users fluctuating between 1 and 3 to make the site feel alive!
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next < 1 ? 1 : next > 3 ? 3 : next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Sync theme attribute with document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Direct reference mouse grid shift parallax effect (magnified factors)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gridBgRef.current) {
        const moveX = (e.clientX - window.innerWidth / 2) * -0.065;
        const moveY = (e.clientY - window.innerHeight / 2) * -0.065;
        gridBgRef.current.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.12)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // High performance view transition theme swapper (wipe wave)
  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const doc = document as any;
    if (!doc.startViewTransition) {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.classList.add('switching-theme');

    const transition = doc.startViewTransition(() => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];
      document.documentElement.animate(
        {
          clipPath: theme === 'light' ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 450,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: theme === 'light' ? '::view-transition-old(root)' : '::view-transition-new(root)',
        }
      );
    });

    transition.finished.then(() => {
      document.documentElement.classList.remove('switching-theme');
    });
  };

  const projects: Project[] = [
    {
      id: 'transcendence',
      name: 'ft_transcendence',
      subtitle: 'Multiplayer Web-Pong Arena',
      desc: 'A premium, single-page web application featuring real-time multiplayer Pong matches, direct 1v1 matchmaking lobbies, game history dashboards, interactive statistics, and direct player-to-player chats.',
      tags: ['React', 'TypeScript', 'Next.js', 'PostgreSQL', 'Docker', 'WebSockets'],
      techTokens: '[NEXT.JS] — [TYPESCRIPT] — [POSTGRESQL] — [WEBSOCKETS] — [DOCKER]',
      category: 'Full-Stack Web Application',
      github: 'https://github.com/Cardano04class',
      image: transcendenceImg,
      challenge: 'Ensuring zero-lag syncing of coordinates across rapid multiplayer games.',
      solution: 'Architected custom client-side predictions, state lag interpolation, and high-frequency binary WebSocket messaging.'
    },
    {
      id: 'inception',
      name: 'Inception',
      subtitle: 'Docker Systems Infrastructure',
      desc: 'A hardened, modular multi-container systems infrastructure orchestrated completely from scratch using Docker Compose over Alpine Linux, incorporating dedicated custom-configured Nginx, TLS v1.3 encryption, WordPress, Redis caches, and persistent MariaDB databases.',
      tags: ['Docker', 'Nginx', 'MariaDB', 'WordPress', 'Redis', 'Systems'],
      techTokens: '[DOCKER] — [NGINX] — [MARIADB] — [WORDPRESS] — [REDIS]',
      category: 'DevOps & Systems Architecture',
      github: 'https://github.com/Cardano04class',
      image: inceptionImg,
      challenge: 'Preventing race conditions and ensuring deterministic startup sequences.',
      solution: 'Programmed strict automated Docker health-check triggers and built-in custom startup scripts.'
    },
    {
      id: 'minishell',
      name: 'minishell',
      subtitle: 'Custom Command-Line Interpreter',
      desc: 'A feature-complete command-line Unix shell built in C, managing pipeline configurations, syntax parsing, process forks, environment substitutions, output redirections, signal handling, and core command builtins.',
      tags: ['C', 'POSIX', 'Unix Systems', 'Processes'],
      techTokens: '[C] — [POSIX] — [SHELL SCRIPTING] — [UNIX]',
      category: 'Systems Programming',
      github: 'https://github.com/Cardano04class',
      image: minishellImg,
      challenge: 'Handling nested pipeline executions and signal masks without leaks.',
      solution: 'Engineered clean abstract syntax trees (AST), structured fork monitors, and strict pipe file-descriptor tracking.'
    },
    {
      id: 'push-swap',
      name: 'push_swap',
      subtitle: 'Complexity Sort Optimizer',
      desc: 'A high-performance command algorithm designed to sort random integers on two stacks using a restricted set of instructions, optimizing operations to meet strict Big-O algorithmic complexity constraints.',
      tags: ['C', 'Algorithms', 'Big-O Optimization', 'Complexity'],
      techTokens: '[C] — [ALGORITHMS] — [BIG-O] — [SORT OPTIMIZATION]',
      category: 'Algorithms & Cost Analyzers',
      github: 'https://github.com/Cardano04class',
      image: pushSwapImg,
      challenge: 'Reducing operation counts to absolute minimal costs for large lists.',
      solution: 'Developed an advanced cost-calculating chunk-sorting algorithm combining pivot partitions and mechanical cost matrix weights.'
    }
  ];

  const GithubIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );

  const Github = GithubIcon;

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      {/* Dynamic top-edge progress bar (static styled mockup) */}
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-primary via-[#5aa397] to-[#7dbdb1]"></div>

      {/* Floating transparent outlined social icons that scroll with you exactly like Roman's site */}
      <div className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3.5 md:gap-4 transition-all duration-300">
        <a 
          href="https://github.com/Cardano04class" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="GitHub" 
          className="group flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full border border-border/60 hover:border-foreground/45 bg-transparent text-foreground/55 hover:text-foreground hover:bg-muted/10 transition-all duration-300"
        >
          <Github className="w-4.5 h-4.5 md:w-5 md:h-5 group-hover:scale-105 transition-transform" />
        </a>
        <a 
          href="https://www.linkedin.com/in/mohamedamineamir/" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="LinkedIn" 
          className="group flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full border border-border/60 hover:border-foreground/45 bg-transparent text-foreground/55 hover:text-foreground hover:bg-muted/10 transition-all duration-300"
        >
          <LinkedinIcon className="w-4.5 h-4.5 md:w-5 md:h-5 group-hover:scale-105 transition-transform" />
        </a>
        <a 
          href="https://x.com/cardano_class" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="X" 
          className="group flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full border border-border/60 hover:border-foreground/45 bg-transparent text-foreground/55 hover:text-foreground hover:bg-muted/10 transition-all duration-300"
        >
          <XIcon className="w-4 h-4 md:w-4.5 md:h-4.5 group-hover:scale-105 transition-transform" />
        </a>
        <a 
          href="mailto:cardano_class@proton.me" 
          aria-label="Email" 
          className="group flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full border border-border/60 hover:border-foreground/45 bg-transparent text-foreground/55 hover:text-foreground hover:bg-muted/10 transition-all duration-300"
        >
          <Mail className="w-4.5 h-4.5 md:w-5 md:h-5 group-hover:scale-105 transition-transform" />
        </a>
      </div>

      {/* Navigation bar matching Roman's precise classes and elements */}
      <nav className={`fixed top-0 z-50 flex w-full items-center justify-between transition-all duration-300 ${
        mobileMenuOpen 
          ? 'border-b border-transparent bg-transparent py-3.5 pl-5 pr-4' 
          : 'border-b border-border/40 bg-background/70 py-3.5 pl-5 pr-4 backdrop-blur-md'
      } sm:py-4 sm:px-10 md:px-14 lg:px-24`}>
        <a href="#" className="inline-flex items-center text-sm font-black tracking-wider uppercase transition-opacity hover:opacity-80">
          <span className="text-foreground/80">cardano</span>
          <span className="text-primary">_class</span>
        </a>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 rounded-full px-2 py-0.5 text-foreground/70">
            <Users className="h-3.5 w-3.5 shrink-0 text-foreground/45" />
            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-widest">{activeUsers} active user{activeUsers > 1 ? 's' : ''}</span>
            <span className="inline text-xs font-bold tabular-nums sm:hidden">{activeUsers}</span>
          </div>

          <a 
            href="https://github.com/Cardano04class" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground/85 transition-all hover:bg-muted hover:border-foreground/20"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden min-[450px]:inline">GitHub</span>
          </a>

          <button 
            onClick={toggleTheme}
            className="inline-flex items-center justify-center bg-transparent text-foreground/75 hover:text-foreground transition-colors p-1.5 focus:outline-none cursor-pointer"
            aria-label="Toggle color theme"
          >
            {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="inline-flex items-center justify-center bg-transparent text-foreground/75 hover:text-foreground transition-colors p-1.5 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Full-screen drawer layout for Mobile Menu */}
      <div className={`fixed inset-0 z-40 bg-background/98 backdrop-blur-xl transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="relative h-full w-full flex flex-col justify-between p-6 sm:p-10">
          
          {/* Top buffer space */}
          <div className="h-10" />

          {/* Center navigation links */}
          <div className="flex flex-col items-center gap-8 sm:gap-10">
            <a 
              onClick={() => setMobileMenuOpen(false)}
              href="#" 
              className="group relative block text-[12vw] sm:text-[clamp(2.5rem,calc(1.5rem+6vw),5.5rem)] font-black uppercase tracking-tight text-foreground transition-all duration-300"
            >
              <span className="relative py-1">
                ABOUT
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground" />
              </span>
            </a>
            
            <a 
              onClick={() => setMobileMenuOpen(false)}
              href="#projects" 
              className="group block text-[12vw] sm:text-[clamp(2.5rem,calc(1.5rem+6vw),5.5rem)] font-black uppercase tracking-tight text-[#b5b3ad] dark:text-[#b5b3ad]/60 hover:text-foreground transition-all duration-300"
            >
              PROJECTS
            </a>
            
            <a 
              onClick={() => setMobileMenuOpen(false)}
              href="#contact" 
              className="group block text-[12vw] sm:text-[clamp(2.5rem,calc(1.5rem+6vw),5.5rem)] font-black uppercase tracking-tight text-[#b5b3ad] dark:text-[#b5b3ad]/60 hover:text-foreground transition-all duration-300"
            >
              CONTACTS
            </a>

            {/* Separator and Let's Work */}
            <div className="flex flex-col items-center gap-3 mt-6 sm:mt-8">
              <div className="w-10 h-px bg-border/40"></div>
              <a 
                onClick={() => setMobileMenuOpen(false)}
                href="#contact" 
                className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#b5b3ad] dark:text-[#b5b3ad]/60 hover:text-foreground transition-all"
              >
                LET'S WORK
              </a>
            </div>
          </div>

          {/* Bottom elements: SHOOT on left, dynamic Clock on right */}
          <div className="flex items-center justify-between w-full border-t border-border/40 pt-6">
            <div className="flex items-center gap-2.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-[#b5b3ad] dark:text-[#b5b3ad]/60 select-none">
              <button className="relative inline-flex h-4 w-7 shrink-0 items-center rounded-full bg-foreground/15 dark:bg-muted/40 transition-colors">
                <span className="h-2 w-2 rounded-full bg-[#0b0b0b] dark:bg-[#f8f8f8] translate-x-1" />
              </button>
              <span>SHOOT</span>
            </div>

            <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#b5b3ad] dark:text-[#b5b3ad]/60 select-none">
              {currentTime}
            </div>
          </div>

        </div>
      </div>

      {/* main content layout */}
      <main className="relative z-0 pt-20">
        
        {/* HERO SECTION with live parallax grid shifting */}
        <section className="relative min-h-[calc(100svh-5rem)] flex flex-col justify-center overflow-hidden pb-12">
          
          {/* Hardware-accelerated parallax back grid */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
            <div 
              ref={gridBgRef}
              className="hero-backdrop-grid absolute inset-0 opacity-[var(--grid-opacity)] transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: 'scale(1.12)' }}
            />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-6 sm:px-10 md:px-16 lg:px-24">
            
            {/* Mobile Header Structure */}
            <div className="md:hidden flex h-full flex-col gap-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">
                  <div>01/</div>
                  <div className="mt-2 tracking-wider">From Morocco<br/>with Love</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-foreground/80">Open for work</span>
                </div>
              </div>

              <div>
                <h1 className="text-foreground font-black uppercase leading-[0.9] tracking-tighter text-5xl sm:text-6xl">
                  Fullstack<br/>Developer
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Next.js</span>
                <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Docker</span>
                <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Fullstack</span>
              </div>

              {/* Portrait Mobile */}
              <div className="relative overflow-hidden rounded-sm border border-border bg-muted aspect-video w-full">
                <img 
                  alt="Mohamed Amine Amir portrait" 
                  src={profileImg} 
                  className="h-full w-full object-cover grayscale brightness-95 contrast-[1.05]"
                />
              </div>

              <div className="text-right">
                <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/75 leading-relaxed">
                  Architecting secure, modular infrastructures<br/>and immersive web environments.
                </p>
                <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Freelance / Full-time<br/>Casablanca, Morocco
                </div>
              </div>

              <div className="text-right text-[3.2rem] font-black uppercase leading-[0.88] tracking-tighter text-foreground">
                Mohamed<br/>Amine Amir
              </div>

              <div className="flex justify-end">
                <a href="#projects" className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[10px] font-mono uppercase tracking-widest hover:border-foreground/30 hover:bg-muted transition-all">
                  <span>Selected work</span>
                  <ArrowDownRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              </div>
            </div>

            {/* Desktop Header Structure */}
            <div className="hidden md:flex flex-col gap-10 lg:gap-14">
              <div className="grid grid-cols-12 items-start gap-x-6">
                <div className="col-span-7">
                  <h1 className="text-foreground font-black uppercase leading-[0.88] tracking-tighter text-7xl lg:text-8xl xl:text-9xl">
                    Fullstack<br/>Developer
                  </h1>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Next.js</span>
                    <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Docker</span>
                    <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Fullstack Development</span>
                  </div>
                </div>

                <div className="col-span-5 flex flex-col items-end gap-3 text-right">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/80">Open for work</span>
                  </div>
                  <div className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground mt-2">
                    <div>01/</div>
                    <div className="mt-2">From Morocco<br/>with Love</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 items-start gap-x-6">
                {/* Framed Hover Interactive Portrait Desktop */}
                <div className="col-span-7">
                  <div className="group relative w-full max-w-[680px]">
                    <div className="relative overflow-hidden border border-border bg-card aspect-[16/6] w-full">
                      <img 
                        alt="Mohamed Amine Amir portrait" 
                        src={profileImg} 
                        className="h-full w-full object-cover object-center grayscale brightness-95 contrast-[1.05] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      />
                      {/* Decorative crosshair elements matching cybernetic aesthetics */}
                      <span className="pointer-events-none absolute left-2 top-2 z-10 h-3.5 w-3.5 border-l border-t border-foreground/30 opacity-40 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="pointer-events-none absolute right-2 top-2 z-10 h-3.5 w-3.5 border-r border-t border-foreground/30 opacity-40 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="pointer-events-none absolute bottom-2 left-2 z-10 h-3.5 w-3.5 border-l border-b border-foreground/30 opacity-40 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="pointer-events-none absolute bottom-2 right-2 z-10 h-3.5 w-3.5 border-r border-b border-foreground/30 opacity-40 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-4">
                    <span className="font-mono text-xs text-muted-foreground">-&gt;</span>
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground leading-relaxed">
                      Based in Casablanca, Morocco<br/>Architecting high-fidelity interfaces and automated pipelines.
                    </div>
                  </div>
                </div>

                <div className="col-span-5 flex flex-col justify-between items-end h-full min-h-[160px]">
                  <div className="text-right">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/80 leading-relaxed">
                      Building secure, multi-container layouts<br/>and clean high-performance web apps.
                    </p>
                    <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Available for Freelance / Full-time
                    </div>
                  </div>

                  <div className="text-right font-black uppercase leading-[0.88] tracking-tighter text-6xl lg:text-7xl">
                    Mohamed<br/>Amine Amir
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">2026 Portfolio</div>
                    <a href="#projects" className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[10px] font-mono uppercase tracking-widest hover:border-foreground/30 hover:bg-muted transition-all">
                      <span>Selected work</span>
                      <ArrowDownRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SCROLL-LINKED TEXT RIBBON */}
        <section className="relative overflow-hidden border-y border-border/75 bg-background py-16 sm:py-24 select-none flex flex-col gap-6 sm:gap-10">
          {/* Row 1: Fullstack dev & Devops */}
          <div className="whitespace-nowrap flex overflow-hidden">
            <div 
              className="text-[clamp(3.5rem,8vw,7.5rem)] font-black uppercase tracking-tighter leading-none flex gap-12 sm:gap-20 transition-transform duration-100 ease-out will-change-transform"
              style={{ transform: `translateX(${-400 - (scrollOffset * 0.25)}px)` }}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="flex items-center gap-6 sm:gap-12">
                  <span className="text-foreground">Fullstack dev</span>
                  <span className="text-ribbon-amp font-serif italic font-light select-none">&amp;</span>
                  <span className="text-foreground">Devops</span>
                </span>
              ))}
            </div>
          </div>

          {/* Row 2: clean web apps */}
          <div className="whitespace-nowrap flex overflow-hidden">
            <div 
              className="text-[clamp(3.5rem,8vw,7.5rem)] font-black uppercase tracking-tighter leading-none flex gap-12 sm:gap-20 transition-transform duration-100 ease-out will-change-transform"
              style={{ transform: `translateX(${-1200 + (scrollOffset * 0.25)}px)` }}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="flex items-center gap-6 sm:gap-12">
                  <span className="text-foreground">clean web apps</span>
                  <span className="text-ribbon-amp font-serif italic font-light select-none">&amp;</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION with technical skills layout grids */}
        <section id="about" className="relative overflow-hidden bg-background py-12 text-foreground sm:py-16 md:py-20 lg:py-24 xl:py-28">
          <ScrollSection>
            <div className="w-full min-w-0 max-w-[min(100%,1920px)] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">
              <div className="flex min-w-0 flex-col lg:flex-row lg:justify-between lg:items-start gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 2xl:gap-24">
                
                {/* Profile Bio Details */}
                <div className="stats-panel-left w-full min-w-0 max-w-full lg:w-[42%] lg:max-w-none xl:w-5/12 space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.28em] text-foreground/55 min-[375px]:text-[10px] sm:text-xs sm:tracking-[0.35em]">
                      About
                    </span>
                    <div className="h-px min-w-0 flex-1 bg-border/40" />
                  </div>

                  <h2 className="wrap-anywhere text-[clamp(1.625rem,calc(0.9rem+4.2vw),5rem)] font-black uppercase leading-[0.95] tracking-tight text-foreground">
                    About
                  </h2>
                  
                  <p className="max-w-full text-[0.9375rem] leading-relaxed text-foreground/70 wrap-anywhere sm:max-w-lg sm:text-base md:text-lg">
                    I am a Trainee at 42 Network, DevOps Engineer, and Full-Stack Developer specializing in secure multi-container architecture, custom Unix tools, and responsive user-focused interfaces.
                  </p>
                  <p className="max-w-full text-[0.8125rem] leading-relaxed text-foreground/55 wrap-anywhere sm:max-w-lg sm:text-sm md:text-base">
                    With deep hands-on expertise in virtualization and backend state flows, I build and secure systems from the compiler up. I care about precise implementations—the edge cases, system limits, and fine performance states most teams gloss over.
                  </p>
                  <p className="max-w-full text-[0.8125rem] leading-relaxed text-foreground/55 wrap-anywhere sm:max-w-lg sm:text-sm md:text-base">
                    Whether establishing sandboxed routing layers or engineering predictive client loops in React, my code is written to be fast, clear, and robust.
                  </p>
                </div>

                {/* Skills and Stack Panels Grid */}
                <div className="stats-panel-right w-full min-w-0 max-w-full lg:w-[58%] lg:max-w-none xl:w-7/12 lg:self-center">
                  <div className="grid gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                    {techStacksData.map((group) => (
                      <div
                        key={group.label}
                        className="grid min-w-0 grid-cols-1 min-[480px]:grid-cols-12 items-start sm:items-center gap-4 min-[480px]:gap-5 sm:gap-6 md:gap-8"
                      >
                        <div className="min-w-0 min-[480px]:col-span-12 sm:col-span-4">
                          <div className="wrap-anywhere text-xl font-black uppercase leading-[1.05] tracking-tight text-foreground/45 min-[400px]:text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-4xl 2xl:text-5xl">
                            {group.label}
                          </div>
                        </div>

                        <div className="min-w-0 min-[480px]:col-span-12 sm:col-span-8">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3 sm:gap-y-2 md:gap-4">
                            {group.items.map((item) => (
                              <div
                                key={item.name}
                                className="flex min-w-0 max-w-full items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 sm:gap-y-0 sm:gap-3 pr-1 sm:pr-2 md:pr-3 select-none hover:opacity-80 transition-opacity"
                                title={item.name}
                              >
                                <img
                                  src={item.logo}
                                  alt={item.name}
                                  className="opacity-100 size-6 min-[400px]:size-7 sm:size-8 md:size-9 lg:size-10 shrink-0 object-contain"
                                />
                                <span className="min-w-0 max-w-full font-mono text-[10px] uppercase leading-snug tracking-wide text-foreground/60 wrap-break-word min-[400px]:text-[11px] sm:text-xs sm:tracking-wider sm:whitespace-nowrap sm:break-normal md:text-sm">
                                  {item.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </ScrollSection>
        </section>

        {/* PROJECTS SECTION: The Spectacular Interactive Replicated Slideshow */}
        <section id="projects" className="scroll-mt-20 border-t border-border bg-background py-16 sm:py-24">
          <ScrollSection>
            <div className="mx-auto w-full max-w-[1920px] px-6 sm:px-10 md:px-16 lg:px-24">
            
            {/* Mobile Layout (Simple elegant vertical stack) */}
            <div className="lg:hidden space-y-12">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground sm:text-4xl">Featured Work</h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Systems built with deep respect for clean code. The execution details most developers gloss over are the exact ones I optimize.
                </p>
              </div>

              <div className="grid gap-12 sm:gap-16">
                {projects.map((proj) => (
                  <article key={proj.id} className="group flex flex-col gap-4 border-b border-border/60 pb-8">
                    <div className="relative overflow-hidden rounded-sm border border-border bg-card aspect-[16/10] w-full">
                      <img 
                        alt={proj.name} 
                        src={proj.image} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                      />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold">{proj.category}</span>
                      <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-foreground">{proj.name}</h3>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{proj.desc}</p>
                      
                      <div className="mt-4 border-t border-border/40 pt-4 grid grid-cols-1 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-primary uppercase font-bold">Challenge:</span> <span className="text-muted-foreground">{proj.challenge}</span>
                        </div>
                        <div>
                          <span className="text-primary uppercase font-bold">Solution:</span> <span className="text-muted-foreground">{proj.solution}</span>
                        </div>
                      </div>

                      <p className="mt-4 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{proj.techTokens}</p>
                      
                      <div className="mt-5 flex gap-3">
                        <a 
                          href={proj.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:border-foreground/30 hover:bg-muted transition-all"
                        >
                          <Github className="h-3 w-3" />
                          <span>Code</span>
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Desktop Spectacular Split Screen Layout */}
            <div className="hidden lg:flex lg:flex-row lg:items-start lg:gap-14">
              
              {/* Left Column: Project Selector List */}
              <div className="flex w-full shrink-0 flex-col lg:w-[320px] xl:w-[360px] space-y-6">
                <div>
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.35em] text-primary font-bold">Selected Projects</span>
                  <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground xl:text-5xl">Featured<br/>Work</h2>
                  <p className="mt-4 max-w-sm text-xs text-muted-foreground leading-relaxed">
                    Virtual infrastructures, optimized algorithmic structures, and responsive networking. Precise logic in every line.
                  </p>
                </div>

                {/* Thumb Button items */}
                <div className="flex flex-col gap-3 pt-4">
                  {projects.map((proj, idx) => (
                    <button 
                      key={proj.id}
                      onClick={() => setActiveProject(idx)}
                      className={`group flex items-center gap-4 rounded-lg border p-3 text-left outline-none transition-all duration-300 ${activeProject === idx ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card/40 hover:border-foreground/20 hover:bg-card'}`}
                    >
                      {/* Image Thumbnail Preview */}
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        <img 
                          src={proj.image} 
                          alt="" 
                          className="h-full w-full object-cover grayscale brightness-95" 
                        />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <span className="block font-mono text-[8px] uppercase tracking-wider text-muted-foreground">{proj.category}</span>
                        <span className="block font-black uppercase text-xs tracking-tight text-foreground truncate mt-0.5 group-hover:text-primary transition-colors">{proj.name}</span>
                      </div>

                      {/* Active Indicator dot */}
                      <span className="relative h-2 w-2 shrink-0">
                        <span className={`absolute inset-0 rounded-full transition-all duration-300 ${activeProject === idx ? 'bg-primary scale-100' : 'bg-muted-foreground/30 scale-75 group-hover:bg-muted-foreground/60'}`} />
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  <a 
                    href="https://github.com/Cardano04class" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-muted hover:border-foreground/30 transition-all"
                  >
                    <span>Explore GitHub</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Giant Interactive Slider Canvas Panel with Crossfading */}
              <div className="min-h-0 flex-1 lg:pl-4">
                <div className="relative flex w-full flex-col overflow-hidden rounded-xl border border-border/90 bg-card p-4 h-[650px] xl:h-[720px] shadow-lg group">
                  
                  {/* Cybernetic HUD Frame elements */}
                  <span className="pointer-events-none absolute left-4 top-4 z-20 h-4 w-4 border-l-2 border-t-2 border-primary/45 opacity-60 group-hover:opacity-100 transition-opacity"></span>
                  <span className="pointer-events-none absolute right-4 top-4 z-20 h-4 w-4 border-r-2 border-t-2 border-primary/45 opacity-60 group-hover:opacity-100 transition-opacity"></span>
                  <span className="pointer-events-none absolute bottom-4 left-4 z-20 h-4 w-4 border-l-2 border-b-2 border-primary/45 opacity-60 group-hover:opacity-100 transition-opacity"></span>
                  <span className="pointer-events-none absolute bottom-4 right-4 z-20 h-4 w-4 border-r-2 border-b-2 border-primary/45 opacity-60 group-hover:opacity-100 transition-opacity"></span>

                  {/* Active Slide crossfader display */}
                  <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-md border border-border/50 bg-background">
                    {projects.map((proj, idx) => (
                      <div 
                        key={proj.id} 
                        className={`absolute inset-0 flex flex-col justify-between transition-all duration-550 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeProject === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[0.985] z-0 pointer-events-none'}`}
                      >
                        {/* Big preview image block */}
                        <div className="relative min-h-0 h-3/5 w-full overflow-hidden bg-muted">
                          <img 
                            alt={proj.name} 
                            src={proj.image} 
                            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.025]"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        </div>

                        {/* Interactive metadata and tokens layout */}
                        <div className="bg-gradient-to-b from-card/45 to-card px-6 pb-6 pt-5 flex-1 flex flex-col justify-between border-t border-border/40">
                          <div>
                            <div className="flex justify-between items-center">
                              <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">0{idx + 1} / 04</p>
                              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{proj.category}</span>
                            </div>
                            
                            <h3 className="mt-2.5 font-black uppercase text-2xl tracking-tight text-foreground">{proj.name}</h3>
                            <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-light">{proj.desc}</p>
                            
                            {/* Detailed Challenge & Solution block */}
                            <div className="mt-4 border-t border-border/30 pt-3 grid grid-cols-2 gap-4 text-xs font-mono">
                              <div>
                                <span className="text-primary font-bold uppercase tracking-wider text-[10px] block mb-1">Challenge</span>
                                <span className="text-foreground/80 leading-relaxed text-[11px] font-sans block">{proj.challenge}</span>
                              </div>
                              <div>
                                <span className="text-primary font-bold uppercase tracking-wider text-[10px] block mb-1">Solution</span>
                                <span className="text-foreground/80 leading-relaxed text-[11px] font-sans block">{proj.solution}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-border/20 pt-4">
                            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/90">{proj.techTokens}</p>
                            <a 
                              href={proj.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
                            >
                              <Github className="h-3.5 w-3.5" />
                              <span>View Source</span>
                            </a>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Horizontal progress sliders index */}
                  <div className="mt-4 flex gap-2.5 px-1.5">
                    {projects.map((proj, idx) => (
                      <button 
                        key={proj.id}
                        onClick={() => setActiveProject(idx)}
                        className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-border transition-colors hover:bg-border-strong"
                        title={proj.name}
                      >
                        <div 
                          className="h-full rounded-full bg-primary transition-all duration-300 origin-left"
                          style={{ 
                            transform: activeProject === idx ? 'scaleX(1)' : 'scaleX(0.12)',
                            opacity: activeProject === idx ? 1 : 0.4
                          }}
                        />
                      </button>
                    ))}
                  </div>

                </div>
              </div>

            </div>

          </div>
        </ScrollSection>
      </section>

        {/* RECONSTRUCTED HIGH-FIDELITY SPLIT CONTACT SECTION */}
        <section id="contact" className="relative border-t border-border bg-[#f4f3ef]/35 dark:bg-background/25 py-20 sm:py-28 md:py-32 scroll-mt-20">
          <ScrollSection>
            <div className="mx-auto w-full max-w-[1920px] px-6 sm:px-10 md:px-16 lg:px-24">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                
                {/* Left Column */}
                <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-2">
                    <span className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground/75 block">Contact</span>
                    <h2 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-foreground flex flex-col">
                      <span>LET'S</span>
                      <span>WORK</span>
                      <span className="text-muted-foreground/45 dark:text-muted-foreground/35">TOGETHER</span>
                    </h2>
                  </div>

                  <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-md">
                    Have a project in mind? Looking for a partner to help build your next big idea? I'm always open to discussing new opportunities and challenges.
                  </p>

                  {/* Social icons stack with circular outlines */}
                  <div className="flex gap-4 items-center pt-2">
                    <a 
                      href="https://github.com/Cardano04class" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="GitHub" 
                      className="group flex items-center justify-center w-11 h-11 rounded-full border border-border/60 hover:border-foreground/45 bg-transparent text-foreground/55 hover:text-foreground transition-all duration-300"
                    >
                      <Github className="w-5 h-5 group-hover:scale-105 transition-transform" />
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/mohamedamineamir/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="LinkedIn" 
                      className="group flex items-center justify-center w-11 h-11 rounded-full border border-border/60 hover:border-foreground/45 bg-transparent text-foreground/55 hover:text-foreground transition-all duration-300"
                    >
                      <LinkedinIcon className="w-5 h-5 group-hover:scale-105 transition-transform" />
                    </a>
                    <a 
                      href="https://x.com/cardano_class" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="Twitter/X" 
                      className="group flex items-center justify-center w-11 h-11 rounded-full border border-border/60 hover:border-foreground/45 bg-transparent text-foreground/55 hover:text-foreground transition-all duration-300"
                    >
                      <XIcon className="w-4.5 h-4.5 group-hover:scale-105 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-7 space-y-6 lg:pl-8">
                  {/* Decorative horizontal separator */}
                  <div className="border-t border-border/40 w-full pt-6 flex items-center justify-between">
                    <Mail className="h-5 w-5 text-muted-foreground/65" />
                    <a 
                      href="mailto:cardano_class@proton.me" 
                      aria-label="Email" 
                      className="group inline-flex items-center justify-center w-10 h-10 rounded-full border border-border/40 hover:border-foreground/40 bg-transparent text-muted-foreground/60 hover:text-foreground transition-all duration-300"
                    >
                      <ArrowUpRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>

                  <div className="space-y-4">
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-muted-foreground/75 block">
                      DROP ME A LINE
                    </span>
                    
                    <a 
                      href="mailto:cardano_class@proton.me" 
                      className="block text-3xl min-[400px]:text-4xl sm:text-5xl md:text-6xl lg:text-4xl xl:text-5xl font-black uppercase tracking-tight text-foreground leading-[1.05] hover:text-primary transition-colors duration-300"
                    >
                      CARDANO_CLASS<br/>@PROTON.ME
                    </a>
                  </div>

                  {/* Copy Email Button with Success State */}
                  <div className="pt-6">
                    <button 
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/80 hover:text-foreground hover:translate-x-0.5 transition-all duration-300"
                    >
                      {copied ? (
                        <CheckIcon className="h-3.5 w-3.5 text-foreground/80" />
                      ) : (
                        <CopyIcon className="h-3.5 w-3.5" />
                      )}
                      <span>{copied ? "COPIED!" : "COPY ADDRESS"}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </ScrollSection>
        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto w-full max-w-[1920px] px-6 sm:px-10 md:px-16 lg:px-24 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            &copy; 2026 Mohamed Amine Amir. Built with React &amp; Tailwind.
          </div>
          <div className="flex gap-4">
            <a href="https://github.com/Cardano04class" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="h-4 w-4" /></a>
            <a href="https://x.com/cardano_class" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/mohamedamineamir" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="mailto:cardano_class@proton.me" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </footer>

    </div>
  );
}
