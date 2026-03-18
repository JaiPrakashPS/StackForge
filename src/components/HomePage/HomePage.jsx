import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

// ── Inline styles & keyframes injected once ───────────────────────────────────
// ── Mini animated canvas diagram ──────────────────────────────────────────────
function CanvasDiagram() {
  return (
    <div className="hp-diagram" style={{ height: 240 }}>
      {/* Fake nodes */}
      {[
        { label:"☁ CloudFront", color:"#06b6d4", top:"15%", left:"5%"  },
        { label:"⚖ Load Balancer",color:"#3b82f6",top:"15%",left:"37%"  },
        { label:"🖥 EC2 ×3",    color:"#8b5cf6", top:"55%", left:"25%" },
        { label:"🗄 RDS",        color:"#10b981", top:"55%", left:"60%" },
        { label:"🪣 S3",         color:"#f59e0b", top:"15%", left:"68%" },
      ].map((n, i) => (
        <div key={i} className="hp-node-mini" style={{
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
        fontFamily:"JetBrains Mono, monospace", fontSize:11, color:"#10b981",
      }}>
        Est. $234/mo ↗
      </div>
      {/* Security badge */}
      <div style={{
        position:"absolute", top:12, right:12,
        background:"#ef444415", border:"1px solid #ef444433",
        borderRadius:6, padding:"5px 10px",
        fontFamily:"JetBrains Mono, monospace", fontSize:10, color:"#ef4444",
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

      {/* Background atmosphere */}
      <div className="hp-grid-bg" />
      <div className="hp-blob hp-blob-1" />
      <div className="hp-blob hp-blob-2" />
      <div className="hp-blob hp-blob-3" />

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="hp-nav">
        <a className="hp-nav-logo" href="#">
          <div className="hp-nav-logo-mark">☁</div>
          <span style={{ fontFamily:"Inter, sans-serif", fontWeight:800, fontSize:16, letterSpacing:"-0.5px" }}>
            StackForge
          </span>
        </a>

        <div className="hp-nav-links" style={{ display: "flex" }}>
          {["Features","How It Works","Pricing","Docs"].map((l) => (
            <a key={l} className="hp-nav-link" href={`#${l.toLowerCase().replace(/ /g, "-")}`}>{l}</a>
          ))}
        </div>

        <div className="hp-nav-actions">
          <button className="btn-ghost" onClick={() => go("login")}>Log In</button>
          <button className="btn-primary" onClick={() => go("signup")}>Sign Up Free</button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="hp-hero hp-section">
        <div className="hp-hero-badge anim-fade-up">
          <span className="hp-hero-badge-dot" />
          Now in Public Beta — Free to start
        </div>

        <h1 className="hp-hero-title anim-fade-up delay-1">
          Design Cloud<br />
          <span className="hp-hero-title-accent">Architecture</span><br />
          Visually.
        </h1>

        <p className="hp-hero-sub anim-fade-up delay-2">
          Drag, drop, and connect AWS components on an infinite canvas.
          Get real-time cost estimates, security validation, and export
          to Terraform — all in one tool.
        </p>

        <div className="hp-hero-actions anim-fade-up delay-3">
          <button className="btn-hero" onClick={() => go("canvas")}>
            Launch Canvas →
          </button>
          <button className="btn-outline-hero" onClick={() => go("signup")}>
            ▶ Watch Demo
          </button>
        </div>

        {/* Stats strip */}
        <div className="hp-stats-strip anim-fade-up delay-4">
          {[
            { val:"12+",  label:"AWS COMPONENTS"  },
            { val:"$0",   label:"TO START"         },
            { val:"∞",    label:"CANVAS SIZE"      },
            { val:"1-CLICK", label:"IaC EXPORT"    },
          ].map((s) => (
            <div className="hp-stat-item" key={s.label}>
              <div className="hp-stat-value">{s.val}</div>
              <div className="hp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Hero mockup */}
        <div style={{ width:"100%", maxWidth:880, marginTop:48 }} className="anim-fade-up delay-5">
          <div className="hp-mockup">
            <div className="hp-mockup-bar">
              <div className="hp-mockup-dot" style={{ background:"#ef4444" }} />
              <div className="hp-mockup-dot" style={{ background:"#f59e0b" }} />
              <div className="hp-mockup-dot" style={{ background:"#22c55e" }} />
              <div className="hp-mockup-url">stackforge.app/canvas</div>
            </div>
            <div style={{ padding:24 }}>
              <CanvasDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="hp-section" id="features" style={{ padding:"100px 0" }}>
        <div className="hp-container">
          <div className="scroll-reveal" style={{ marginBottom:48 }}>
            <span className="hp-section-label">// FEATURES</span>
            <h2 className="hp-section-title">Everything you need to<br />architect with confidence.</h2>
            <p className="hp-section-sub">Stop switching between a whiteboard, cost calculator, and IaC editor. StackForge unifies them.</p>
          </div>

          <div className="hp-features-grid scroll-reveal">
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
              <div className="hp-feature-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="hp-feature-icon">{f.icon}</div>
                <div className="hp-feature-title">{f.title}</div>
                <div className="hp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="hp-section" id="how-it-works" style={{ padding:"100px 0", borderTop:"1px solid var(--border)" }}>
        <div className="hp-container" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"start" }}>
          <div className="scroll-reveal">
            <span className="hp-section-label">// HOW IT WORKS</span>
            <h2 className="hp-section-title">From idea to<br />infrastructure<br />in minutes.</h2>
            <p className="hp-section-sub" style={{ marginBottom:40 }}>
              StackForge collapses a 4-tool workflow into one focused environment.
            </p>

            <div className="hp-steps">
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
                <div className="hp-step" key={i}>
                  <div className="hp-step-num">{s.n}</div>
                  <div>
                    <div className="hp-step-title">{s.title}</div>
                    <div className="hp-step-desc">{s.desc}</div>
                    <span className="hp-step-tag">{s.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal animation */}
          <div className="scroll-reveal" style={{ position:"sticky", top:100 }}>
            <div className="hp-terminal anim-float">
              <div className="hp-terminal-line">
                <span className="hp-terminal-prompt">$ </span>
                <span className="hp-terminal-cmd">stackforge export --format=terraform</span>
              </div>
              <div className="hp-terminal-line hp-terminal-out">Analyzing 7 components...</div>
              <div className="hp-terminal-line hp-terminal-out">Validating connections... <span style={{color:"#22c55e"}}>✓</span></div>
              <div className="hp-terminal-line hp-terminal-out">Security scan... <span style={{color:"#f59e0b"}}>1 warning</span></div>
              <div className="hp-terminal-line hp-terminal-out">Cost estimate: <span style={{color:"#1d6fff"}}>$312/mo</span></div>
              <div className="hp-terminal-line hp-terminal-out">Generating main.tf...</div>
              <div style={{height:8}}/>
              <div className="hp-terminal-line hp-terminal-green">✓ Exported main.tf (48 lines)</div>
              <div className="hp-terminal-line hp-terminal-green">✓ Exported variables.tf</div>
              <div className="hp-terminal-line" style={{marginTop:8}}>
                <span className="hp-terminal-prompt">$ </span>
                <span className="hp-terminal-cursor"/>
              </div>
            </div>

            {/* Mini feature pills */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:24 }}>
              {["React Flow canvas","12 AWS components","Live cost calc","Terraform export","Security hints","Annotation tools","Keyboard shortcuts","Color palette"].map((t) => (
                <span key={t} style={{
                  fontFamily:"JetBrains Mono, monospace", fontSize:10, color:"var(--muted)",
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
      <section className="hp-section" id="pricing" style={{ padding:"100px 0", borderTop:"1px solid var(--border)" }}>
        <div className="hp-container">
          <div className="scroll-reveal" style={{ marginBottom:48, textAlign:"center" }}>
            <span className="hp-section-label">// PRICING</span>
            <h2 className="hp-section-title">Simple, honest pricing.</h2>
            <p className="hp-section-sub" style={{ margin:"0 auto" }}>Start free. Upgrade when you need more.</p>
          </div>

          <div className="hp-pricing-grid scroll-reveal">
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
              <div key={i} className={`hp-plan ${plan.primary ? "hp-plan-featured" : ""}`}>
                {plan.badge && <div className="hp-plan-badge">{plan.badge}</div>}
                <div className="hp-plan-name">{plan.name}</div>
                <div className="hp-plan-price">{plan.price}</div>
                <div className="hp-plan-period">{plan.period}</div>
                <ul className="hp-plan-features">
                  {plan.features.map((f) => (
                    <li key={f} className="hp-plan-feature">
                      <span className="hp-plan-feature-check">✓</span>
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
      <section className="hp-cta hp-section scroll-reveal">
        <span className="hp-section-label" style={{ display:"block", marginBottom:16 }}>// GET STARTED</span>
        <h2 className="hp-section-title" style={{ marginBottom:16 }}>
          Your cloud architecture,<br />designed right.
        </h2>
        <p style={{ fontFamily:"JetBrains Mono, monospace", fontSize:14, color:"var(--muted)", marginBottom:36 }}>
          Join engineers who design smarter with StackForge.
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
      <footer className="hp-footer">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div className="hp-nav-logo-mark" style={{ width:22, height:22, fontSize:12 }}>☁</div>
          <span>StackForge © {new Date().getFullYear()}</span>
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