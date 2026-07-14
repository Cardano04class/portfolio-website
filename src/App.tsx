import { useState, useEffect } from 'react';
import { 
  CheckCircle,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';

import profileImg from './assets/profile.jpg';
import aboutProfileImg from './assets/about_profile.jpg';
import transcendenceImg from './assets/transcendence.png';
import inceptionImg from './assets/inception.png';
import minishellImg from './assets/minishell.png';
import pushSwapImg from './assets/push_swap.png';

interface Project {
  id: string;
  name: string;
  subtitle: string;
  desc: string;
  longDesc: string;
  challenge: string;
  solution: string;
  tags: string[];
  category: string;
  github: string;
  image: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  desc: string;
  bullets: string[];
}

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const MailIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeJobId, setActiveJobId] = useState<string>('almalgo-devops');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recruiterName && recruiterEmail) {
      setBookingSubmitted(true);
      setTimeout(() => {
        setBookingSubmitted(false);
        setRecruiterName('');
        setRecruiterEmail('');
        setBookingMessage('');
      }, 5000);
    }
  };

  const jobs: Job[] = [
    {
      id: "almalgo-devops",
      title: "DevOps Engineer",
      company: "Almalgo",
      location: "Remote / Hybrid",
      date: "2024 - Present",
      desc: "Architecting zero-downtime microservices virtualization pipelines and continuous integration flows.",
      bullets: [
        "Wrote automated build structures reducing cluster build times by 45%.",
        "Managed isolated sandboxes using alpine-based customized blueprints.",
        "Created continuous integrity suites executing unit validations on target pushes."
      ]
    },
    {
      id: "almalgo-frontend",
      title: "Frontend Engineer",
      company: "Almalgo",
      location: "Remote / Hybrid",
      date: "2023 - Present",
      desc: "Developing fast, highly interactive client dashboard modules and modular view states.",
      bullets: [
        "Built modular interface libraries enabling quick widget reusability.",
        "Refined rendering cycles yielding 100% Google Lighthouse score.",
        "Integrated dynamic state triggers using robust state models."
      ]
    },
    {
      id: "42-systems",
      title: "Systems Trainee",
      company: "42 Network",
      location: "1337 Benguerir",
      date: "2022 - Present",
      desc: "Rigorous Unix systems development program, mastering low-level mechanics and processes orchestration.",
      bullets: [
        "Crafted custom terminal processors implementing command parsing algorithms in C.",
        "Engineered concurrent multiplayer server sockets over POSIX threads.",
        "Optimized complex data sorters utilizing cost-calculated array partitioning."
      ]
    }
  ];

  const projects: Project[] = [
    {
      id: "ft_transcendence",
      name: "ft_transcendence",
      subtitle: "Full-Stack Web capstone platform",
      desc: "Real-time web matches, online multiplayer rooms, secure matchmaking queues, and dashboard statistics.",
      longDesc: "The ultimate 42 capstone program, validating full-stack competence, concurrent matchmaking state pools, and responsive visual interfaces.",
      challenge: "Providing zero-latency client state syncs across web nodes over high-frequency active sockets.",
      solution: "Implemented discrete WebSocket lobbies utilizing extrapolative physics calculations and authoritative state sync algorithms.",
      tags: ["TypeScript", "Next.js", "React", "WebSockets", "PostgreSQL", "Docker"],
      category: "Full-Stack",
      github: "https://github.com/Cardano04class/ft_transcendence",
      image: transcendenceImg
    },
    {
      id: "inception",
      name: "Inception",
      subtitle: "Secure Multi-Container virtualization server",
      desc: "An operating system clustering sandbox running Nginx, MariaDB, WordPress and private TLS routers completely from scratch.",
      longDesc: "Recreating secure local staging servers utilizing system virtual networking and rootless Alpine container blueprints.",
      challenge: "Building completely insulated networks with automatic volume persistence without using pre-packaged docker configurations.",
      solution: "Wrote hardened Alpine Dockerfiles, custom TLS cert scripts, isolated database bridge interfaces, and automated volume backup pipes.",
      tags: ["Docker", "Docker Compose", "Nginx", "MariaDB", "WordPress", "Shell"],
      category: "DevOps",
      github: "https://github.com/Cardano04class/Inception",
      image: inceptionImg
    },
    {
      id: "minishell",
      name: "minishell",
      subtitle: "C POSIX Shell Interpreter",
      desc: "Recreating system parsing environments, variable loops, pipelines, redirects and signal control structures from scratch in C.",
      longDesc: "Deep exploration of Unix kernels, sub-process orchestration, signals, and dynamic parser trees.",
      challenge: "Insulating pipe sequences concurrently while managing system memory maps without leaks.",
      solution: "Designed a recursive AST parsing engine, registered asynchronous POSIX signals, and mapped exact fd file redirection trees.",
      tags: ["C", "Unix API", "POSIX", "Process Control", "Memory Management"],
      category: "Systems",
      github: "https://github.com/Cardano04class/minishell",
      image: minishellImg
    },
    {
      id: "push_swap",
      name: "Push_swap",
      subtitle: "Optimized Stack Sorting Algorithms",
      desc: "Unbelievably optimized data sorter that orders coordinates using custom algorithms under strict instruction limits.",
      longDesc: "Calculating cheap operations sequences utilizing index compression and coordinate mapping mechanics.",
      challenge: "Minimizing operations cost constraints under tight Big-O move limits on lists up to 500 values.",
      solution: "Engineered pre-sorted chunks partitions, calculated exact cost matrices, and coded pivot rotation indexes to sort under target limits.",
      tags: ["C", "Algorithms", "Optimization", "Data Structures", "Big-O Analysis"],
      category: "Systems",
      github: "https://github.com/Cardano04class/Push_swap",
      image: pushSwapImg
    }
  ];

  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];

  return (
    <>
      {/* Header Navigation */}
      <header className="adritian-header">
        <nav className="adritian-navbar">
          <a href="#showcase" className="brand-logo">
            Cardano<span>_class</span>
          </a>
          <ul className="nav-menu">
            <li><a href="#showcase" className="nav-link-btn">HOME</a></li>
            <li><a href="#about" className="nav-link-btn">ABOUT</a></li>
            <li><a href="#experience" className="nav-link-btn">EXPERIENCE</a></li>
            <li><a href="#portfolio" className="nav-link-btn">PORTFOLIO</a></li>
            <li><a href="#contact" className="nav-link-btn">CONTACT</a></li>
            <li>
              <button onClick={toggleTheme} className="theme-toggle-btn">
                {theme === 'light' ? (
                  <>
                    <Moon size={14} /> <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun size={14} /> <span>Light Mode</span>
                  </>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Container */}
      <div className="adritian-container">
        
        {/* Showcase Hero Section */}
        <section id="showcase" className="section-wrapper hero-showcase">
          <div className="grid-two-columns">
            <div className="hero-description">
              <h1 className="display-1">Showcase Section</h1>
              <h2 className="display-5">Mohamed Amine Amir</h2>
              <p className="lead">
                I help modern development teams automate container orchestration, design secure virtualized routers, and build high performance web platforms. DevOps &amp; Frontend at <strong>Almalgo</strong>. Trainee at <strong>42 Network</strong>.
              </p>
              
              <div className="platform-icons-row">
                <a href="https://github.com/Cardano04class" target="_blank" rel="noreferrer" className="platform-icon-link" aria-label="Github">
                  <GithubIcon />
                </a>
                <a href="https://x.com/cardano_class" target="_blank" rel="noreferrer" className="platform-icon-link" aria-label="Twitter">
                  <TwitterIcon />
                </a>
                <a href="https://www.linkedin.com/in/mohamedamineamir/" target="_blank" rel="noreferrer" className="platform-icon-link" aria-label="LinkedIn">
                  <LinkedinIcon />
                </a>
                <a href="mailto:cardanoclass@proton.me" className="platform-icon-link" aria-label="Email">
                  <MailIcon />
                </a>
              </div>
            </div>
            
            <div className="profile-box-showcase">
              <img src={profileImg} alt="Mohamed Amine Amir" className="profile-img-showcase" style={{ objectFit: 'cover', aspectRatio: '1/1' }} />
            </div>
          </div>
        </section>

        {/* About Section (Left Image, Right text) */}
        <section id="about" className="section-wrapper">
          <div className="about-columns-split">
            <div className="profile-box-about">
              <img src={aboutProfileImg} alt="Mohamed Amine Amir Portrait" className="profile-img-about" style={{ objectFit: 'cover', aspectRatio: '1/1' }} />
            </div>
            <div className="my-auto">
              <h2>About me</h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.2rem', lineHeight: '1.7' }}>
                With professional experience building web dashboards at <strong>Almalgo</strong> and deep low-level POSIX environments training at <strong>42 Network</strong>, I provide secure, high speed, completely automated microservices staging environments.
              </p>
              <p style={{ marginBottom: '1.5rem' }}>
                My development stacks feature TypeScript, Next.js/React, Docker isolation suites, Nginx SSL gateways, and POSIX C programming.
              </p>
              <a href="#portfolio" className="btn-primary-adritian">Check my works</a>
            </div>
          </div>
        </section>

        {/* Formal Education (education-list) */}
        <section id="education" className="section-wrapper">
          <h2>Formal Education</h2>
          <div className="education-grid-adritian">
            <div className="education-item-adritian">
              <div className="education-date-badge">2022 - Present</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>42 Network</h3>
              <p style={{ fontSize: '0.95rem' }}>Software Engineering and low-level systems training, specializing in file parsing, multiplexed networks, memory orchestration, and compiler design.</p>
            </div>
            <div className="education-item-adritian">
              <div className="education-date-badge">2020 - 2022</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Scientific Academy</h3>
              <p style={{ fontSize: '0.95rem' }}>High School Diploma, Mathematics, Sciences, and Computer Programming fundamentals.</p>
            </div>
          </div>
        </section>

        {/* Interactive Job Experience (Split View) */}
        <section id="experience" className="section-wrapper">
          <h2 style={{ fontSize: '2.2rem', marginBottom: '2.5rem' }}>My Job Experience</h2>
          
          <div className="experience-layout-split">
            <div>
              {jobs.map(job => (
                <div 
                  key={job.id} 
                  className={`experience-block-item ${activeJobId === job.id ? 'active' : ''}`}
                  onClick={() => setActiveJobId(job.id)}
                >
                  <div className="exp-date">{job.date}</div>
                  <h3 style={{ fontSize: '1.3rem', margin: '0.2rem 0' }}>{job.title}</h3>
                  <div className="exp-company">{job.company} &bull; <span style={{ fontSize: '0.85rem' }}>{job.location}</span></div>
                </div>
              ))}
            </div>
            
            <div>
              <div className="exp-detail-card">
                <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{activeJob.title}</h3>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1.2rem', color: 'var(--text-muted)' }}>
                  {activeJob.company} &mdash; <span style={{ fontSize: '0.9rem' }}>{activeJob.date}</span>
                </h4>
                
                <p style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>{activeJob.desc}</p>
                
                <ul style={{ listStyleType: 'circle', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {activeJob.bullets.map((bullet, idx) => (
                    <li key={idx} style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Precise Alternating Wide Project Showcase Row */}
        <section id="portfolio" className="section-wrapper">
          <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>A Selection of My Work</h2>
          <p style={{ marginBottom: '3rem' }}>Review exact problems, technical constraints, and customized multi-container solutions.</p>
          
          <div>
            {projects.map((project, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={project.id} className={`adritian-work-row ${!isEven ? 'reverse-row' : ''}`}>
                  {isEven ? (
                    <>
                      <div>
                        <span className="project-tag-pill" style={{ marginBottom: '1rem', display: 'inline-block' }}>{project.category}</span>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>{project.name}</h3>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>{project.desc}</p>
                        
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <button onClick={() => setSelectedProject(project)} className="btn-primary-adritian">
                            View Case Study
                          </button>
                          <a href={project.github} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            Repository <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                      
                      <div className="work-image-frame">
                        <img src={project.image} alt={project.name} className="work-image-file" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="work-image-frame">
                        <img src={project.image} alt={project.name} className="work-image-file" />
                      </div>
                      
                      <div>
                        <span className="project-tag-pill" style={{ marginBottom: '1rem', display: 'inline-block' }}>{project.category}</span>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>{project.name}</h3>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>{project.desc}</p>
                        
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <button onClick={() => setSelectedProject(project)} className="btn-primary-adritian">
                            View Case Study
                          </button>
                          <a href={project.github} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            Repository <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>



        {/* Reach Out / Booking form */}
        <section id="contact" className="section-wrapper" style={{ borderBottom: 'none' }}>
          <div className="contact-container-adritian">
            <h2 style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '1rem' }}>Reach out</h2>
            <p style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              Want to request a sync call or interview regarding key DevOps, Full-stack, or Systems roles? Write details.
            </p>
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group-adritian">
                <label>Recruiter / Manager Name</label>
                <input 
                  type="text" 
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="Your name" 
                  required 
                  className="input-adritian"
                />
              </div>
              <div className="form-group-adritian">
                <label>Corporate Contact Email</label>
                <input 
                  type="email" 
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  placeholder="Your e-mail" 
                  required 
                  className="input-adritian"
                />
              </div>
              <div className="form-group-adritian">
                <label>Message / Details</label>
                <textarea 
                  rows={4}
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Your message..."
                  required 
                  className="input-adritian"
                  style={{ resize: 'none' }}
                />
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary-adritian">
                  Send message
                </button>
              </div>
            </form>

            {bookingSubmitted && (
              <div style={{ 
                marginTop: '1.5rem', 
                background: 'rgba(71, 128, 121, 0.08)', 
                border: '1px solid var(--primary-color)', 
                padding: '1rem', 
                borderRadius: '6px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: 'var(--text-main)',
                fontSize: '0.95rem'
              }}>
                <CheckCircle size={18} style={{ color: 'var(--primary-color)' }} />
                <span>Success! Request submitted. Let's schedule something soon.</span>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Case Study Popup Modal */}
      {selectedProject && (
        <div className="adritian-modal-backdrop" onClick={() => setSelectedProject(null)}>
          <div className="adritian-modal-body" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedProject(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.8rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
            
            <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginBottom: '0.3rem' }}>{selectedProject.name}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {selectedProject.tags.map(tag => (
                <span key={tag} className="project-tag-pill">{tag}</span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Overview</h4>
                <p style={{ fontSize: '0.95rem' }}>{selectedProject.longDesc}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>The Technical Challenge</h4>
                <p style={{ fontSize: '0.95rem' }}>{selectedProject.challenge}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>My Solution</h4>
                <p style={{ fontSize: '0.95rem' }}>{selectedProject.solution}</p>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
              <a href={selectedProject.github} target="_blank" rel="noreferrer" className="btn-primary-adritian" style={{ textDecoration: 'none' }}>
                <GithubIcon size={14} /> View Repository
              </a>
              <button onClick={() => setSelectedProject(null)} className="btn-primary-adritian" style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adritian Footer */}
      <footer className="adritian-footer">
        <div>
          &copy; 2026 Mohamed Amine Amir. Built with React &amp; TypeScript. Free Hugo theme by Adrián Moreno Peña.
        </div>
      </footer>
    </>
  );
}
