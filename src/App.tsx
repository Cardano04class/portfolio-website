import { useState, useEffect } from 'react';
import { 
  Terminal, 
  Cpu, 
  Layers, 
  Globe, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle,
  Sparkles,
  Server,
  Code
} from 'lucide-react';

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

interface Project {
  id: string;
  name: string;
  subtitle: string;
  desc: string;
  longDesc: string;
  challenge: string;
  solution: string;
  tags: string[];
  category: 'fullstack' | 'devops' | 'systems';
  github: string;
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'fullstack' | 'devops' | 'systems'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [bookingSubmitted, setBookingTypeSubmitted] = useState(false);
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  
  // Custom Typewriter Effect
  const [typewriterText, setTypewriterText] = useState('');
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const toRotate = ["Software Engineer", "DevOps & Automation Engineer", "Systems Architect", "Lifelong Learner from 42"];
  const period = 2000;
  const [delta, setDelta] = useState(100 - Math.random() * 50);

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => { clearInterval(ticker) };
  }, [typewriterText, isDeleting]);

  const tick = () => {
    let i = loopNum % toRotate.length;
    let fullText = toRotate[i];
    let updatedText = isDeleting 
      ? fullText.substring(0, typewriterText.length - 1) 
      : fullText.substring(0, typewriterText.length + 1);

    setTypewriterText(updatedText);

    if (isDeleting) {
      setDelta(prevDelta => prevDelta / 2);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(period);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setDelta(150);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recruiterName && recruiterEmail) {
      setBookingTypeSubmitted(true);
      setTimeout(() => {
        setBookingTypeSubmitted(false);
        setRecruiterName('');
        setRecruiterEmail('');
        setBookingMessage('');
      }, 5000);
    }
  };

  const projects: Project[] = [
    {
      id: "ft_transcendence",
      name: "ft_transcendence",
      subtitle: "Modern Full-Stack Real-time Gaming Platform",
      desc: "A premium single-page web app with real-time multiplayer Pong matchmaking, chat, leaderboards, and interactive guilds.",
      longDesc: "This is the final capstone project of the 42 curriculum. It requires building a feature-rich real-time gaming ecosystem featuring live duplex communications, user accounts, and direct-messaging channels.",
      challenge: "Handling low-latency real-time multiplayer positioning and game physics synchronization across multiple client connections securely without client-side spoofing.",
      solution: "Implemented authorative server game state loops with high-frequency WebSocket sync broadcasts (using WebSockets) coupled with lightweight frontend interpolation and linear predictive client positioning.",
      tags: ["TypeScript", "Next.js", "React", "WebSockets", "PostgreSQL", "Docker"],
      category: "fullstack",
      github: "https://github.com/Cardano04class/ft_transcendence"
    },
    {
      id: "inception",
      name: "Inception",
      subtitle: "DevOps & System Architecture Virtualization",
      desc: "Fully automated secure multi-container systems deployment leveraging strictly custom base Docker environments.",
      longDesc: "A core systems and operations project simulating a secure system administration cluster. It requires creating custom docker environments (without pre-built DockerHub images like alpine/nginx) from clean Alpine bases.",
      challenge: "Ensuring ironclad multi-service connection security, non-root system isolation, persistent DB volumes, and secure local secrets injection.",
      solution: "Designed microservice containers communicating across custom isolated Docker bridge networks, using TLSv1.3 configurations, precise environment variables parsing, and secure read-only volume mounts.",
      tags: ["Docker", "Docker Compose", "Nginx", "MariaDB", "WordPress", "Shell Scripting"],
      category: "devops",
      github: "https://github.com/Cardano04class/Inception"
    },
    {
      id: "minishell",
      name: "minishell",
      subtitle: "Unix Command Line Interpreter Implementation",
      desc: "A fully compliant lightweight Bash-equivalent Unix shell built from scratch in C.",
      longDesc: "A deep dive into POSIX system operations. Programmed Unix process forks, command executions, custom env expansions, and clean memory arenas.",
      challenge: "Managing concurrent pipes and files-redirections flawlessly while preventing file-descriptor leaks and strictly handling asynchronous terminal signals.",
      solution: "Wrote a recursive descent command parser, abstracted file descriptor tables using custom pipe tracker states, and handled signals (Ctrl-C/Ctrl-\\) by configuring custom POSIX signal actions.",
      tags: ["C", "Unix API", "POSIX", "Process Control", "Memory Management"],
      category: "systems",
      github: "https://github.com/Cardano04class/minishell"
    },
    {
      id: "push_swap",
      name: "Push_swap",
      subtitle: "Algorithmic Speed & Space Optimization",
      desc: "An ultra-optimized stack-sorting command-line program with strict complexity budgets.",
      longDesc: "An algorithm heavy task to sort dual stack structures using a limited instruction set with the minimum possible command iterations.",
      challenge: "Sorting large lists of integers (up to 500 random elements) within tight move limits (under 5500 instructions) utilizing minimal stack primitives.",
      solution: "Engineered a custom sorting algorithm merging coordinate compression, optimized chunk-sorting, and relative cost distance indices to compute the absolute cheapest moves sequentially.",
      tags: ["C", "Algorithms", "Optimization", "Data Structures", "Big-O Analysis"],
      category: "systems",
      github: "https://github.com/Cardano04class/Push_swap"
    }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  return (
    <>
      <div className="bg-grid"></div>
      <div className="bg-radial"></div>

      {/* Header */}
      <header>
        <div className="portfolio-container nav-bar">
          <div className="logo">
            <span className="mono text-bright">&lt;</span>
            <span className="gradient-text font-sans">Cardano_class</span>
            <span className="mono text-bright">/&gt;</span>
          </div>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#roles">Experience</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#offer" className="gradient-text">Offer Landing</a></li>
          </ul>
          <div>
            <a href="#offer" className="btn btn-primary">Hire Me</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="portfolio-container hero" id="about">
        <div className="hero-tagline">Systems Programming &amp; Engineering</div>
        <h1>
          Hi, I am <span className="gradient-text">Cardano_class</span> <br />
          <span className="mono" style={{ fontSize: '3rem', fontWeight: 500, color: '#f8fafc' }}>
            {typewriterText}
            <span className="gradient-text" style={{ animation: 'pulse 1s infinite' }}>|</span>
          </span>
        </h1>
        <p className="hero-description">
          A software engineer trained under **42**'s rigorous curriculum, specializing in automating high-security DevOps pipelines and designing scalable web systems.
        </p>

        {/* Dynamic Focus Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveFilter('all')} 
            className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Disciplines
          </button>
          <button 
            onClick={() => setActiveFilter('fullstack')} 
            className={`btn ${activeFilter === 'fullstack' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Globe size={18} /> Full-Stack
          </button>
          <button 
            onClick={() => setActiveFilter('devops')} 
            className={`btn ${activeFilter === 'devops' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Server size={18} /> DevOps &amp; Cloud
          </button>
          <button 
            onClick={() => setActiveFilter('systems')} 
            className={`btn ${activeFilter === 'systems' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Cpu size={18} /> Systems / C / C++
          </button>
        </div>

        <div className="hero-ctas">
          <a href="#projects" className="btn btn-primary">
            View My Projects <ArrowRight size={18} />
          </a>
          <a href="#offer" className="btn btn-secondary">
            Let's Schedule a Sync
          </a>
        </div>
      </section>

      {/* Interactive Offer Section */}
      <section className="portfolio-container offer-section" id="offer">
        <div className="offer-card">
          <div className="offer-badge">🚀 Active Hiring Pipeline Open</div>
          <h2>Looking for a Top-Tier Engineer?</h2>
          <p>
            Whether you need to build next-generation interfaces, dockerize secure microservices, or engineer optimized systems-level services, let's connect.
          </p>

          <div className="offer-details">
            <div className="offer-item">
              <h3>Full-Time Roles</h3>
              <p>Ready to deploy into DevOps, Automation, and Full-Stack teams.</p>
            </div>
            <div className="offer-item">
              <h3>Contract / Freelance</h3>
              <p>On-demand infrastructure pipelines, web builds, or performance tunes.</p>
            </div>
            <div className="offer-item">
              <h3>Technical Chat</h3>
              <p>Let's schedule an interview or grab a virtual coffee.</p>
            </div>
          </div>

          {/* Recruiter Landing Form */}
          <form onSubmit={handleBookingSubmit} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label className="mono" style={{ fontSize: '0.85rem', color: '#f8fafc' }}>Your Name</label>
                <input 
                  type="text" 
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="e.g. John Doe" 
                  required
                  style={{ background: '#0a0e17', border: '1px solid #222d3f', borderRadius: '8px', padding: '0.8rem', color: '#fff', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label className="mono" style={{ fontSize: '0.85rem', color: '#f8fafc' }}>Your Email</label>
                <input 
                  type="email" 
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  placeholder="name@company.com" 
                  required
                  style={{ background: '#0a0e17', border: '1px solid #222d3f', borderRadius: '8px', padding: '0.8rem', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
              <label className="mono" style={{ fontSize: '0.85rem', color: '#f8fafc' }}>Message / Opportunity Details</label>
              <textarea 
                rows={3}
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                placeholder="Let me know about your project, team, or schedule an interview..."
                style={{ background: '#0a0e17', border: '1px solid #222d3f', borderRadius: '8px', padding: '0.8rem', color: '#fff', outline: 'none', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Sparkles size={18} /> Schedule Interview / Request Booking
              </button>
            </div>
          </form>

          {bookingSubmitted && (
            <div style={{ 
              marginTop: '1.5rem', 
              background: 'rgba(57, 255, 20, 0.1)', 
              border: '1px solid var(--accent-green)', 
              padding: '1rem', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              color: 'var(--accent-green)',
              animation: 'fadeIn 0.3s'
            }}>
              <CheckCircle size={20} />
              <span>Awesome! I will get back to you within 24 hours to schedule our call. Let's build!</span>
            </div>
          )}
        </div>
      </section>

      {/* Experience Section */}
      <section className="portfolio-container experience-section" id="roles">
        <h2 className="section-title">Roles &amp; Experience</h2>
        <div className="role-grid">
          <div className="role-card devops">
            <div className="role-header">
              <div>
                <span className="role-org">@Almalgo</span>
                <h3 className="role-title">DevOps Engineer</h3>
                <span className="role-duration">Dec 2025 - Present</span>
              </div>
              <div className="role-icon">
                <Terminal size={24} />
              </div>
            </div>
            <ul className="role-bullets">
              <li>Configured secure multi-container structures leveraging Docker, Composer & custom orchestration pipelines.</li>
              <li>Engineered reverse proxy layers with isolated routing protocols and custom SSL/TLS certificates.</li>
              <li>Established container base image standards resulting in optimized performance and minimal footprint sizes.</li>
            </ul>
          </div>

          <div className="role-card frontend">
            <div className="role-header">
              <div>
                <span className="role-org">@Almalgo</span>
                <h3 className="role-title">Frontend Engineer</h3>
                <span className="role-duration">Dec 2025 - Present</span>
              </div>
              <div className="role-icon">
                <Code size={24} />
              </div>
            </div>
            <ul className="role-bullets">
              <li>Designed and built sleek single-page modules with modular React structures and smooth transitions.</li>
              <li>Integrated complex client-side applications with backend JSON-REST and WebSocket endpoints.</li>
              <li>Engineered fully responsive, state-driven user layers with clean accessibility compliance.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="portfolio-container projects-section" id="projects">
        <h2 className="section-title">Featured Projects</h2>
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-body">
                <div className="project-name">
                  <span>{project.name}</span>
                  <a href={project.github} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                    <GithubIcon size={20} />
                  </a>
                </div>
                <div className="project-subtitle">{project.subtitle}</div>
                <p className="project-desc">{project.desc}</p>
                <div className="project-tags">
                  {project.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="project-links">
                  <button onClick={() => setSelectedProject(project)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    View Case Study <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Case Study Modal */}
      {selectedProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 7, 12, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            padding: '2.5rem',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setSelectedProject(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedProject.name}</h3>
            <span className="project-subtitle" style={{ display: 'block', marginBottom: '1.5rem' }}>{selectedProject.subtitle}</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 className="mono" style={{ fontSize: '1rem', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>🚀 Deep Dive</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{selectedProject.longDesc}</p>
              </div>
              <div>
                <h4 className="mono" style={{ fontSize: '1rem', color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>⚠️ The Engineering Challenge</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{selectedProject.challenge}</p>
              </div>
              <div>
                <h4 className="mono" style={{ fontSize: '1rem', color: 'var(--accent-green)', marginBottom: '0.5rem' }}>✅ The Solution</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{selectedProject.solution}</p>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
              <a href={selectedProject.github} target="_blank" rel="noreferrer" className="btn btn-primary">
                <GithubIcon size={18} /> View Repository
              </a>
              <button onClick={() => setSelectedProject(null)} className="btn btn-secondary">
                Close Case Study
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skills Section */}
      <section className="portfolio-container skills-section" id="skills">
        <h2 className="section-title">Technical Expertise</h2>
        <div className="skills-grid">
          <div className="skills-category">
            <h3><Server size={20} className="gradient-text" /> DevOps &amp; Platforms</h3>
            <div className="skill-list">
              <div>
                <div className="skill-item-info"><span>Docker &amp; Compose</span><span>95%</span></div>
                <div className="skill-bar"><div className="skill-progress" style={{ width: '95%' }}></div></div>
              </div>
              <div>
                <div className="skill-item-info"><span>Nginx &amp; SSL</span><span>90%</span></div>
                <div className="skill-bar"><div className="skill-progress" style={{ width: '90%' }}></div></div>
              </div>
              <div>
                <div className="skill-item-info"><span>Kubernetes</span><span>80%</span></div>
                <div className="skill-bar"><div className="skill-progress" style={{ width: '80%' }}></div></div>
              </div>
            </div>
          </div>

          <div className="skills-category devops">
            <h3><Terminal size={20} style={{ color: 'var(--accent-purple)' }} /> Languages</h3>
            <div className="skill-list">
              <div>
                <div className="skill-item-info"><span>C / C++ (POSIX)</span><span>95%</span></div>
                <div className="skill-bar"><div className="skill-progress" style={{ width: '95%' }}></div></div>
              </div>
              <div>
                <div className="skill-item-info"><span>TypeScript / JS</span><span>90%</span></div>
                <div className="skill-bar"><div className="skill-progress" style={{ width: '90%' }}></div></div>
              </div>
              <div>
                <div className="skill-item-info"><span>Python &amp; Shell</span><span>85%</span></div>
                <div className="skill-bar"><div className="skill-progress" style={{ width: '85%' }}></div></div>
              </div>
            </div>
          </div>

          <div className="skills-category languages">
            <h3><Layers size={20} style={{ color: 'var(--accent-green)' }} /> Web &amp; DB</h3>
            <div className="skill-list">
              <div>
                <div className="skill-item-info"><span>Next.js &amp; React</span><span>90%</span></div>
                <div className="skill-bar"><div className="skill-progress" style={{ width: '90%' }}></div></div>
              </div>
              <div>
                <div className="skill-item-info"><span>WebSockets API</span><span>95%</span></div>
                <div className="skill-bar"><div className="skill-progress" style={{ width: '95%' }}></div></div>
              </div>
              <div>
                <div className="skill-item-info"><span>PostgreSQL &amp; Redis</span><span>85%</span></div>
                <div className="skill-bar"><div className="skill-progress" style={{ width: '85%' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="portfolio-container">
          <div className="footer-content">
            <div className="logo">
              <span className="mono text-bright">&lt;</span>
              <span className="gradient-text">Cardano_class</span>
              <span className="mono text-bright">/&gt;</span>
            </div>
            <div className="footer-socials">
              <a href="https://github.com/Cardano04class" target="_blank" rel="noreferrer"><GithubIcon size={20} /></a>
              <a href="https://x.com/cardano_class" target="_blank" rel="noreferrer"><TwitterIcon size={20} /></a>
            </div>
          </div>
          <div className="copyright">
            &copy; 2026 Cardano_class. Built with premium React &amp; TypeScript.
          </div>
        </div>
      </footer>
    </>
  );
}
