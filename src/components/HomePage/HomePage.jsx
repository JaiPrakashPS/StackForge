import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Inline styles & keyframes injected once ───────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #03070f;
    --surface:  #080f1e;
    --border:   #0e1f3a;
    --blue:     #1d6fff;
    --blue-dim: #1d6fff22;
    --cyan:     #00d4ff;
    --text:     #e2eaf4;
    --muted:    #4a6080;
    --mono:     'DM Mono', monospace;
    --display:  'Syne', sans-serif;
  }

  html { scroll-behavior: smooth; }

  body { background: var(--bg); color: var(--text); font-family: var(--display); overflow-x: hidden; }

  /* Grid background */
  .cf-grid-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%);
  }

  /* Glow orbs */
  .cf-orb {
    position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
    filter: blur(120px); opacity: 0.18;
  }
  .cf-orb-1 { width: 600px; height: 600px; background: #1d6fff; top: -200px; left: -100px; }
  .cf-orb-2 { width: 400px; height: 400px; background: #00d4ff; top: 40%; right: -100px; }
  .cf-orb-3 { width: 300px; height: 300px; background: #1d6fff; bottom: 10%; left: 30%; }

  /* Animations */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse    { 0%,100% { opacity:.6; } 50% { opacity:1; } }
  @keyframes scanline { from { transform:translateY(-100%); } to { transform:translateY(100vh); } }
  @keyframes blink    { 0%,100% { opacity:1; } 50% { opacity:0; } }
  @keyframes float    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
  @keyframes shimmer  { from { background-position: -200% 0; } to { background-position: 200% 0; } }
  @keyframes spin     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

  .anim-fade-up   { animation: fadeUp  0.7s ease both; }
  .anim-fade-in   { animation: fadeIn  0.5s ease both; }
  .anim-float     { animation: float   4s ease-in-out infinite; }
  .anim-pulse     { animation: pulse   2s ease-in-out infinite; }

  /* Stagger delays */
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.35s; }
  .delay-4 { animation-delay: 0.5s; }
  .delay-5 { animation-delay: 0.65s; }

  /* Nav */
  .cf-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 64px;
    background: #03070fcc; backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .cf-nav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
  .cf-nav-logo-mark {
    width:32px; height:32px; border-radius:8px;
    background: linear-gradient(135deg, #1d6fff, #00d4ff);
    display:flex; align-items:center; justify-content:center;
    font-size:16px; flex-shrink:0;
    box-shadow: 0 0 20px #1d6fff44;
  }
  .cf-nav-links { display:flex; align-items:center; gap:32px; }
  .cf-nav-link {
    font-family: var(--mono); font-size:13px; color:var(--muted);
    text-decoration:none; transition:color 0.2s;
  }
  .cf-nav-link:hover { color: var(--text); }
  .cf-nav-actions { display:flex; align-items:center; gap:12px; }

  /* Buttons */
  .btn-ghost {
    font-family: var(--mono); font-size:13px; color:var(--muted);
    background:transparent; border:1px solid var(--border);
    padding:8px 18px; border-radius:6px; cursor:pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover { color:var(--text); border-color:#1d6fff66; background:#1d6fff0a; }

  .btn-primary {
    font-family: var(--mono); font-size:13px; color:#fff; font-weight:500;
    background: linear-gradient(135deg, #1d6fff, #0051d4);
    border:none; padding:8px 20px; border-radius:6px; cursor:pointer;
    box-shadow: 0 0 24px #1d6fff33; transition: all 0.2s;
    position:relative; overflow:hidden;
  }
  .btn-primary::before {
    content:''; position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, #ffffff18, transparent);
    background-size:200% 100%; animation: shimmer 2s infinite;
  }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 32px #1d6fff55; }

  .btn-hero {
    font-family: var(--mono); font-size:14px; color:#fff; font-weight:500;
    background: linear-gradient(135deg, #1d6fff, #0051d4);
    border: none; padding:14px 32px; border-radius:8px; cursor:pointer;
    box-shadow: 0 0 40px #1d6fff44; transition:all 0.2s;
    display:inline-flex; align-items:center; gap:8px;
    position:relative; overflow:hidden;
  }
  .btn-hero::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,#ffffff14,transparent);
    background-size:200% 100%; animation:shimmer 2.5s infinite;
  }
  .btn-hero:hover { transform:translateY(-2px); box-shadow:0 8px 48px #1d6fff66; }

  .btn-outline-hero {
    font-family: var(--mono); font-size:14px; color:var(--text);
    background:transparent; border:1px solid var(--border);
    padding:14px 32px; border-radius:8px; cursor:pointer;
    transition:all 0.2s; display:inline-flex; align-items:center; gap:8px;
  }
  .btn-outline-hero:hover { border-color:#1d6fff66; background:#1d6fff08; }

  /* Sections */
  .cf-section { position:relative; z-index:1; }

  /* Hero */
  .cf-hero {
    min-height: 100vh;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    text-align:center; padding:120px 24px 80px;
    position:relative; z-index:1;
  }
  .cf-hero-badge {
    display:inline-flex; align-items:center; gap:8px;
    font-family:var(--mono); font-size:11px; color:var(--cyan);
    border:1px solid #00d4ff33; border-radius:20px;
    padding:5px 14px; margin-bottom:28px;
    background:#00d4ff08;
  }
  .cf-hero-badge-dot { width:6px; height:6px; border-radius:50%; background:var(--cyan); animation:pulse 2s infinite; }

  .cf-hero-title {
    font-family:var(--display); font-size:clamp(52px,8vw,96px);
    font-weight:800; line-height:1.0; letter-spacing:-3px;
    margin-bottom:24px;
  }
  .cf-hero-title-line2 {
    background: linear-gradient(90deg, #1d6fff, #00d4ff, #1d6fff);
    background-size: 200% 100%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }
  .cf-hero-sub {
    font-family:var(--mono); font-size:16px; color:var(--muted);
    max-width:540px; line-height:1.7; margin-bottom:40px;
  }
  .cf-hero-actions { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:64px; }

  /* Stats strip */
  .cf-stats {
    display:flex; gap:0; border:1px solid var(--border);
    border-radius:12px; overflow:hidden; background:var(--surface);
    margin-top:16px;
  }
  .cf-stat {
    padding:16px 32px; text-align:center; border-right:1px solid var(--border);
    flex:1;
  }
  .cf-stat:last-child { border-right:none; }
  .cf-stat-val { font-size:22px; font-weight:800; color:var(--blue); font-family:var(--mono); }
  .cf-stat-label { font-size:10px; color:var(--muted); font-family:var(--mono); margin-top:2px; letter-spacing:.08em; }

  /* Canvas preview mockup */
  .cf-mockup {
    position:relative; border-radius:16px; overflow:hidden;
    border:1px solid var(--border);
    box-shadow: 0 0 80px #1d6fff22, 0 40px 80px #00000088;
    background:var(--surface);
    max-width:880px; width:100%; margin:0 auto;
  }
  .cf-mockup-bar {
    height:36px; background:#080f1e; border-bottom:1px solid var(--border);
    display:flex; align-items:center; padding:0 16px; gap:8px;
  }
  .cf-mockup-dot { width:10px; height:10px; border-radius:50%; }
  .cf-mockup-url {
    flex:1; height:20px; background:#0e1f3a; border-radius:4px;
    margin:0 16px; display:flex; align-items:center;
    padding:0 10px; font-family:var(--mono); font-size:10px; color:var(--muted);
  }

  /* Features */
  .cf-features-grid {
    display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
    gap:1px; background:var(--border);
    border:1px solid var(--border); border-radius:16px; overflow:hidden;
  }
  .cf-feature-card {
    background:var(--surface); padding:32px;
    transition:background 0.2s;
    position:relative; overflow:hidden;
  }
  .cf-feature-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,transparent,var(--blue),transparent);
    opacity:0; transition:opacity 0.3s;
  }
  .cf-feature-card:hover { background:#080f1eee; }
  .cf-feature-card:hover::before { opacity:1; }
  .cf-feature-icon {
    width:44px; height:44px; border-radius:10px;
    background:var(--blue-dim); border:1px solid #1d6fff33;
    display:flex; align-items:center; justify-content:center;
    font-size:20px; margin-bottom:16px;
  }
  .cf-feature-title { font-size:17px; font-weight:700; margin-bottom:8px; }
  .cf-feature-desc { font-family:var(--mono); font-size:12px; color:var(--muted); line-height:1.7; }

  /* How it works */
  .cf-steps { display:flex; flex-direction:column; gap:0; }
  .cf-step {
    display:grid; grid-template-columns:60px 1fr;
    gap:24px; padding:32px 0;
    border-bottom:1px solid var(--border);
    position:relative;
  }
  .cf-step:last-child { border-bottom:none; }
  .cf-step-num {
    font-family:var(--mono); font-size:11px; color:var(--blue);
    width:36px; height:36px; border-radius:50%;
    border:1px solid #1d6fff44; background:#1d6fff0a;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; letter-spacing:.05em; margin-top:4px;
  }
  .cf-step-title { font-size:20px; font-weight:700; margin-bottom:6px; }
  .cf-step-desc { font-family:var(--mono); font-size:13px; color:var(--muted); line-height:1.7; }
  .cf-step-tag {
    display:inline-block; margin-top:10px;
    font-family:var(--mono); font-size:10px;
    padding:3px 10px; border-radius:4px;
    border:1px solid var(--border); color:var(--muted);
  }

  /* Pricing */
  .cf-pricing-grid {
    display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
    gap:16px;
  }
  .cf-plan {
    border:1px solid var(--border); border-radius:14px;
    padding:28px; background:var(--surface);
    position:relative; transition:all 0.2s;
  }
  .cf-plan:hover { border-color:#1d6fff44; transform:translateY(-2px); }
  .cf-plan-featured {
    border-color:#1d6fff88 !important;
    box-shadow:0 0 40px #1d6fff1a;
  }
  .cf-plan-badge {
    position:absolute; top:-11px; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,#1d6fff,#00d4ff);
    font-family:var(--mono); font-size:10px; color:#fff;
    padding:3px 12px; border-radius:10px; white-space:nowrap;
  }
  .cf-plan-name { font-size:14px; font-weight:700; color:var(--muted); font-family:var(--mono); letter-spacing:.1em; margin-bottom:8px; }
  .cf-plan-price { font-size:40px; font-weight:800; margin-bottom:4px; }
  .cf-plan-period { font-family:var(--mono); font-size:11px; color:var(--muted); margin-bottom:20px; }
  .cf-plan-features { list-style:none; display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
  .cf-plan-feature { font-family:var(--mono); font-size:12px; color:var(--muted); display:flex; align-items:center; gap:8px; }
  .cf-plan-feature-check { color:#00d4ff; flex-shrink:0; }

  /* CTA */
  .cf-cta {
    text-align:center; padding:100px 24px;
    border-top:1px solid var(--border);
    position:relative; overflow:hidden;
  }
  .cf-cta::before {
    content:''; position:absolute; top:-200px; left:50%; transform:translateX(-50%);
    width:600px; height:600px; border-radius:50%;
    background: radial-gradient(circle,#1d6fff18 0%,transparent 70%);
    pointer-events:none;
  }

  /* Footer */
  .cf-footer {
    border-top:1px solid var(--border);
    padding:32px 48px;
    display:flex; align-items:center; justify-content:space-between;
    font-family:var(--mono); font-size:11px; color:var(--muted);
  }

  /* Utility */
  .cf-container { max-width:1100px; margin:0 auto; padding:0 24px; }
  .cf-section-label {
    font-family:var(--mono); font-size:11px; color:var(--blue);
    letter-spacing:.15em; margin-bottom:12px; display:block;
  }
  .cf-section-title { font-size:clamp(32px,5vw,52px); font-weight:800; line-height:1.1; letter-spacing:-1px; margin-bottom:16px; }
  .cf-section-sub { font-family:var(--mono); font-size:14px; color:var(--muted); max-width:480px; line-height:1.7; }

  /* Terminal mockup inside hero */
  .cf-terminal {
    background:#03070f; border:1px solid var(--border); border-radius:10px;
    padding:16px 20px; font-family:var(--mono); font-size:12px;
    text-align:left; max-width:480px; margin:0 auto;
  }
  .cf-terminal-line { line-height:2; }
  .cf-terminal-prompt { color:var(--blue); }
  .cf-terminal-cmd   { color:var(--text); }
  .cf-terminal-out   { color:var(--muted); }
  .cf-terminal-green { color:#22c55e; }
  .cf-terminal-cursor { display:inline-block; width:7px; height:13px; background:var(--cyan); animation:blink 1s infinite; vertical-align:middle; margin-left:2px; }

  /* Scroll fade-in */
  .scroll-reveal { opacity:0; transform:translateY(20px); transition:opacity 0.6s ease, transform 0.6s ease; }
  .scroll-reveal.visible { opacity:1; transform:translateY(0); }

  /* Node mini diagram in feature section */
  .cf-diagram {
    border:1px solid var(--border); border-radius:12px;
    background:#03070f; padding:24px; position:relative;
    overflow:hidden; min-height:200px;
    display:flex; align-items:center; justify-content:center;
  }
  .cf-node-mini {
    border-radius:8px; padding:8px 14px;
    font-family:var(--mono); font-size:10px; font-weight:600;
    border:1px solid; white-space:nowrap;
    position:absolute;
  }
  .cf-connector {
    position:absolute; background:var(--blue); opacity:.4;
  }
`;

// ── Mini animated canvas diagram ──────────────────────────────────────────────
function CanvasDiagram() {
  return (
    <div className="cf-diagram" style={{ height: 240 }}>
      {/* Fake nodes */}
      {[
        { label:"☁ CloudFront", color:"#06b6d4", top:"15%", left:"5%"  },
        { label:"⚖ Load Balancer",color:"#3b82f6",top:"15%",left:"37%"  },
        { label:"🖥 EC2 ×3",    color:"#8b5cf6", top:"55%", left:"25%" },
        { label:"🗄 RDS",        color:"#10b981", top:"55%", left:"60%" },
        { label:"🪣 S3",         color:"#f59e0b", top:"15%", left:"68%" },
      ].map((n, i) => (
        <div key={i} className="cf-node-mini" style={{
          color: n.color, borderColor: n.color + "44",
          background: n.color + "0d",
          top: n.top, left: n.left,
          boxShadow: `0 0 12px ${n.color}22`,
          animation: `float ${3 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${i * 0.3}s`,
        }}>{n.label}</div>
      ))}
      {/* SVG connectors */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#1d6fff66" />
          </marker>
        </defs>
        <line x1="22%"  y1="28%" x2="38%"  y2="28%" stroke="#1d6fff44" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr)" />
        <line x1="55%"  y1="28%" x2="68%"  y2="28%" stroke="#1d6fff44" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr)" />
        <line x1="47%"  y1="35%" x2="37%"  y2="55%" stroke="#1d6fff44" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr)" />
        <line x1="52%"  y1="35%" x2="63%"  y2="55%" stroke="#1d6fff44" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr)" />
      </svg>
      {/* Cost badge */}
      <div style={{
        position:"absolute", bottom:12, right:12,
        background:"#10b98115", border:"1px solid #10b98133",
        borderRadius:6, padding:"5px 10px",
        fontFamily:"var(--mono)", fontSize:11, color:"#10b981",
      }}>
        Est. $234/mo ↗
      </div>
      {/* Security badge */}
      <div style={{
        position:"absolute", top:12, right:12,
        background:"#ef444415", border:"1px solid #ef444433",
        borderRadius:6, padding:"5px 10px",
        fontFamily:"var(--mono)", fontSize:10, color:"#ef4444",
      }}>
        ⚠ Port 22 exposed
      </div>
    </div>
  );
}

// ── Scroll reveal hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".scroll-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Main HomePage ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const go = (path) => { navigate(`/${path}`); window.scrollTo({ top: 0 }); };
  const [menuOpen, setMenuOpen] = useState(false);
  useScrollReveal();

  return (
    <>
      <style>{CSS}</style>

      {/* Background atmosphere */}
      <div className="cf-grid-bg" />
      <div className="cf-orb cf-orb-1" />
      <div className="cf-orb cf-orb-2" />
      <div className="cf-orb cf-orb-3" />

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="cf-nav">
        <a className="cf-nav-logo" href="#">
          <div className="cf-nav-logo-mark">☁</div>
          <span style={{ fontFamily:"var(--display)", fontWeight:800, fontSize:16, letterSpacing:"-0.5px" }}>
            CloudForge
          </span>
        </a>

        <div className="cf-nav-links" style={{ display: "flex" }}>
          {["Features","How It Works","Pricing","Docs"].map((l) => (
            <a key={l} className="cf-nav-link" href={`#${l.toLowerCase().replace(/ /g, "-")}`}>{l}</a>
          ))}
        </div>

        <div className="cf-nav-actions">
          <button className="btn-ghost" onClick={() => go("login")}>Log In</button>
          <button className="btn-primary" onClick={() => go("signup")}>Sign Up Free</button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="cf-hero cf-section">
        <div className="cf-hero-badge anim-fade-up">
          <span className="cf-hero-badge-dot" />
          Now in Public Beta — Free to start
        </div>

        <h1 className="cf-hero-title anim-fade-up delay-1">
          Design Cloud<br />
          <span className="cf-hero-title-line2">Architecture</span><br />
          Visually.
        </h1>

        <p className="cf-hero-sub anim-fade-up delay-2">
          Drag, drop, and connect AWS components on an infinite canvas.
          Get real-time cost estimates, security validation, and export
          to Terraform — all in one tool.
        </p>

        <div className="cf-hero-actions anim-fade-up delay-3">
          <button className="btn-hero" onClick={() => go("canvas")}>
            Launch Canvas →
          </button>
          <button className="btn-outline-hero" onClick={() => go("signup")}>
            ▶ Watch Demo
          </button>
        </div>

        {/* Stats strip */}
        <div className="cf-stats anim-fade-up delay-4">
          {[
            { val:"12+",  label:"AWS COMPONENTS"  },
            { val:"$0",   label:"TO START"         },
            { val:"∞",    label:"CANVAS SIZE"      },
            { val:"1-CLICK", label:"IaC EXPORT"    },
          ].map((s) => (
            <div className="cf-stat" key={s.label}>
              <div className="cf-stat-val">{s.val}</div>
              <div className="cf-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Hero mockup */}
        <div style={{ width:"100%", maxWidth:880, marginTop:48 }} className="anim-fade-up delay-5">
          <div className="cf-mockup">
            <div className="cf-mockup-bar">
              <div className="cf-mockup-dot" style={{ background:"#ef4444" }} />
              <div className="cf-mockup-dot" style={{ background:"#f59e0b" }} />
              <div className="cf-mockup-dot" style={{ background:"#22c55e" }} />
              <div className="cf-mockup-url">cloudforge.app/canvas</div>
            </div>
            <div style={{ padding:24 }}>
              <CanvasDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="cf-section" id="features" style={{ padding:"100px 0" }}>
        <div className="cf-container">
          <div className="scroll-reveal" style={{ marginBottom:48 }}>
            <span className="cf-section-label">// FEATURES</span>
            <h2 className="cf-section-title">Everything you need to<br />architect with confidence.</h2>
            <p className="cf-section-sub">Stop switching between a whiteboard, cost calculator, and IaC editor. CloudForge unifies them.</p>
          </div>

          <div className="cf-features-grid scroll-reveal">
            {[
              {
                icon:"🎯", title:"Drag & Drop Canvas",
                desc:"Place EC2, RDS, Lambda, S3, VPC, and 8 more AWS components onto an infinite canvas. Connect them by drawing edges between handles.",
              },
              {
                icon:"🔒", title:"Real-time Security Validation",
                desc:"The validation engine analyzes your connections as you build and flags issues like exposed ports, missing VPCs, and public database access.",
              },
              {
                icon:"💰", title:"Live Cost Estimation",
                desc:"See your estimated monthly AWS bill update live as you add components. No more bill shock — design within your budget from the start.",
              },
              {
                icon:"⚡", title:"IaC Export",
                desc:"One click to export your visual architecture as a Terraform .tf file or JSON. Deploy directly without rewriting what you already designed.",
              },
              {
                icon:"✏️", title:"Rich Annotation Tools",
                desc:"Add rectangles, circles, text labels, frames, comments, and freehand drawings. Document your architecture directly on the canvas.",
              },
              {
                icon:"👥", title:"Collaborative Design",
                desc:"Coming soon — real-time multiplayer canvas so your whole team can design together, leave comments, and review changes live.",
              },
            ].map((f, i) => (
              <div className="cf-feature-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="cf-feature-icon">{f.icon}</div>
                <div className="cf-feature-title">{f.title}</div>
                <div className="cf-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="cf-section" id="how-it-works" style={{ padding:"100px 0", borderTop:"1px solid var(--border)" }}>
        <div className="cf-container" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"start" }}>
          <div className="scroll-reveal">
            <span className="cf-section-label">// HOW IT WORKS</span>
            <h2 className="cf-section-title">From idea to<br />infrastructure<br />in minutes.</h2>
            <p className="cf-section-sub" style={{ marginBottom:40 }}>
              CloudForge collapses a 4-tool workflow into one focused environment.
            </p>

            <div className="cf-steps">
              {[
                {
                  n:"01", title:"Drag components onto the canvas",
                  desc:"Pick from the AWS component library on the left sidebar. Drag EC2, RDS, Lambda, S3, Load Balancers, and more onto the infinite canvas.",
                  tag:"Drag & Drop",
                },
                {
                  n:"02", title:"Connect them to define your architecture",
                  desc:"Draw edges between components to show traffic flow and dependencies. Use arrow or line tools to build your topology.",
                  tag:"Visual Wiring",
                },
                {
                  n:"03", title:"Review validation & cost in real time",
                  desc:"The sidebar shows live cost estimates. Security warnings appear automatically as you build — fix issues before they reach production.",
                  tag:"Instant Feedback",
                },
                {
                  n:"04", title:"Export to Terraform or JSON",
                  desc:"Click Export Terraform to download a ready-to-use main.tf. Or export JSON to save and reload your diagram later.",
                  tag:"One-click Export",
                },
              ].map((s, i) => (
                <div className="cf-step" key={i}>
                  <div className="cf-step-num">{s.n}</div>
                  <div>
                    <div className="cf-step-title">{s.title}</div>
                    <div className="cf-step-desc">{s.desc}</div>
                    <span className="cf-step-tag">{s.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal animation */}
          <div className="scroll-reveal" style={{ position:"sticky", top:100 }}>
            <div className="cf-terminal anim-float">
              <div className="cf-terminal-line">
                <span className="cf-terminal-prompt">$ </span>
                <span className="cf-terminal-cmd">cloudforge export --format=terraform</span>
              </div>
              <div className="cf-terminal-line cf-terminal-out">Analyzing 7 components...</div>
              <div className="cf-terminal-line cf-terminal-out">Validating connections... <span style={{color:"#22c55e"}}>✓</span></div>
              <div className="cf-terminal-line cf-terminal-out">Security scan... <span style={{color:"#f59e0b"}}>1 warning</span></div>
              <div className="cf-terminal-line cf-terminal-out">Cost estimate: <span style={{color:"#1d6fff"}}>$312/mo</span></div>
              <div className="cf-terminal-line cf-terminal-out">Generating main.tf...</div>
              <div style={{height:8}}/>
              <div className="cf-terminal-line cf-terminal-green">✓ Exported main.tf (48 lines)</div>
              <div className="cf-terminal-line cf-terminal-green">✓ Exported variables.tf</div>
              <div className="cf-terminal-line" style={{marginTop:8}}>
                <span className="cf-terminal-prompt">$ </span>
                <span className="cf-terminal-cursor"/>
              </div>
            </div>

            {/* Mini feature pills */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:24 }}>
              {["React Flow canvas","12 AWS components","Live cost calc","Terraform export","Security hints","Annotation tools","Keyboard shortcuts","Color palette"].map((t) => (
                <span key={t} style={{
                  fontFamily:"var(--mono)", fontSize:10, color:"var(--muted)",
                  border:"1px solid var(--border)", borderRadius:4,
                  padding:"4px 10px", background:"var(--surface)",
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section className="cf-section" id="pricing" style={{ padding:"100px 0", borderTop:"1px solid var(--border)" }}>
        <div className="cf-container">
          <div className="scroll-reveal" style={{ marginBottom:48, textAlign:"center" }}>
            <span className="cf-section-label">// PRICING</span>
            <h2 className="cf-section-title">Simple, honest pricing.</h2>
            <p className="cf-section-sub" style={{ margin:"0 auto" }}>Start free. Upgrade when you need more.</p>
          </div>

          <div className="cf-pricing-grid scroll-reveal">
            {[
              {
                name:"HOBBY", price:"$0", period:"Free forever",
                features:["Unlimited canvases","All 12 AWS components","Cost estimation","JSON export","Community support"],
                cta:"Start Free", primary:false,
              },
              {
                name:"PRO", price:"$19", period:"/ month per user",
                features:["Everything in Hobby","Terraform & CDK export","Security validation engine","Save & load diagrams","Priority support"],
                cta:"Start 14-day Trial", primary:true, badge:"MOST POPULAR",
              },
              {
                name:"TEAM", price:"$49", period:"/ month · 5 seats",
                features:["Everything in Pro","Real-time collaboration","Shared diagram library","SSO & access control","Dedicated support"],
                cta:"Contact Sales", primary:false,
              },
            ].map((plan, i) => (
              <div key={i} className={`cf-plan ${plan.primary ? "cf-plan-featured" : ""}`}>
                {plan.badge && <div className="cf-plan-badge">{plan.badge}</div>}
                <div className="cf-plan-name">{plan.name}</div>
                <div className="cf-plan-price">{plan.price}</div>
                <div className="cf-plan-period">{plan.period}</div>
                <ul className="cf-plan-features">
                  {plan.features.map((f) => (
                    <li key={f} className="cf-plan-feature">
                      <span className="cf-plan-feature-check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={plan.primary ? "btn-primary" : "btn-ghost"}
                  style={{ width:"100%", padding:"10px" }}
                  onClick={() => go(plan.price === "$0" ? "canvas" : "signup")}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="cf-cta cf-section scroll-reveal">
        <span className="cf-section-label" style={{ display:"block", marginBottom:16 }}>// GET STARTED</span>
        <h2 className="cf-section-title" style={{ marginBottom:16 }}>
          Your cloud architecture,<br />designed right.
        </h2>
        <p style={{ fontFamily:"var(--mono)", fontSize:14, color:"var(--muted)", marginBottom:36 }}>
          Join engineers who design smarter with CloudForge.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="btn-hero" onClick={() => go("canvas")}>
            Open Canvas — it's free →
          </button>
          <button className="btn-outline-hero" onClick={() => go("signup")}>
            Create account
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="cf-footer">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div className="cf-nav-logo-mark" style={{ width:22, height:22, fontSize:12 }}>☁</div>
          <span>CloudForge © {new Date().getFullYear()}</span>
        </div>
        <div style={{ display:"flex", gap:24 }}>
          {["Privacy","Terms","Docs","GitHub"].map((l) => (
            <a key={l} href="#" style={{ color:"var(--muted)", textDecoration:"none", transition:"color 0.2s" }}
               onMouseEnter={e => e.target.style.color="#e2eaf4"}
               onMouseLeave={e => e.target.style.color=""}>{l}</a>
          ))}
        </div>
        <span>Built with React + ReactFlow</span>
      </footer>
    </>
  );
}