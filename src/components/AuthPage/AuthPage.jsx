import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .auth-wrap {
    min-height: 100vh;
    background: #03070f;
    display: flex;
    font-family: 'DM Mono', monospace;
    position: relative;
    overflow: hidden;
  }
  .auth-grid-bg {
    position: fixed; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(#0e1f3a 1px, transparent 1px),
      linear-gradient(90deg, #0e1f3a 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 70% 80% at 30% 50%, black 0%, transparent 70%);
  }
  .auth-orb {
    position: fixed; border-radius: 50%; pointer-events: none;
    filter: blur(100px); opacity: 0.15;
  }

  /* Left panel */
  .auth-left {
    width: 55%; min-height: 100vh;
    display: flex; flex-direction: column; justify-content: center;
    padding: 60px 80px; position: relative; z-index: 1;
  }
  .auth-brand {
    position: absolute; top: 32px; left: 48px;
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; cursor: pointer;
  }
  .auth-brand-mark {
    width: 30px; height: 30px; border-radius: 7px;
    background: linear-gradient(135deg, #1d6fff, #00d4ff);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; box-shadow: 0 0 16px #1d6fff44;
  }
  .auth-brand-name {
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 15px; color: #e2eaf4;
    letter-spacing: -0.5px;
  }

  .auth-eyebrow {
    font-size: 10px; color: #1d6fff; letter-spacing: .15em;
    margin-bottom: 16px;
  }
  .auth-heading {
    font-family: 'Syne', sans-serif;
    font-size: 44px; font-weight: 800; line-height: 1.05;
    letter-spacing: -1.5px; color: #e2eaf4; margin-bottom: 12px;
  }
  .auth-sub {
    font-size: 13px; color: #4a6080; line-height: 1.7; margin-bottom: 36px;
    max-width: 360px;
  }

  /* Form */
  .auth-form { display: flex; flex-direction: column; gap: 14px; max-width: 400px; }
  .auth-field { display: flex; flex-direction: column; gap: 6px; }
  .auth-label { font-size: 10px; color: #4a6080; letter-spacing: .1em; }
  .auth-input {
    background: #080f1e; border: 1px solid #0e1f3a;
    border-radius: 7px; padding: 11px 14px;
    font-family: 'DM Mono', monospace; font-size: 13px; color: #e2eaf4;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
  }
  .auth-input:focus {
    border-color: #1d6fff66;
    box-shadow: 0 0 0 3px #1d6fff15;
  }
  .auth-input::placeholder { color: #1e3558; }

  .auth-row { display: flex; gap: 12px; }
  .auth-row .auth-field { flex: 1; }

  .auth-divider {
    display: flex; align-items: center; gap: 12px;
    font-size: 10px; color: #1e3558; margin: 4px 0;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: #0e1f3a;
  }

  .auth-btn-primary {
    background: linear-gradient(135deg, #1d6fff, #0051d4);
    border: none; border-radius: 7px; padding: 12px;
    font-family: 'DM Mono', monospace; font-size: 13px;
    color: #fff; font-weight: 500; cursor: pointer;
    box-shadow: 0 0 28px #1d6fff33; transition: all 0.2s;
    margin-top: 4px;
  }
  .auth-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 32px #1d6fff55; }
  .auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .auth-btn-oauth {
    background: #080f1e; border: 1px solid #0e1f3a;
    border-radius: 7px; padding: 11px;
    font-family: 'DM Mono', monospace; font-size: 12px;
    color: #4a6080; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .auth-btn-oauth:hover { border-color: #1d6fff44; color: #e2eaf4; background: #1d6fff08; }

  .auth-switch {
    font-size: 11px; color: #4a6080; margin-top: 8px; text-align: center;
  }
  .auth-switch-link {
    color: #1d6fff; cursor: pointer; text-decoration: underline;
    background: none; border: none; font-family: 'DM Mono', monospace;
    font-size: 11px;
  }

  .auth-error {
    background: #ef444415; border: 1px solid #ef444433;
    border-radius: 6px; padding: 8px 12px;
    font-size: 11px; color: #ef4444;
  }
  .auth-success {
    background: #10b98115; border: 1px solid #10b98133;
    border-radius: 6px; padding: 8px 12px;
    font-size: 11px; color: #10b981;
  }

  /* Right panel */
  .auth-right {
    width: 45%; background: #080f1e;
    border-left: 1px solid #0e1f3a;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 48px;
    position: relative; z-index: 1; gap: 20px;
  }
  .auth-feature-pill {
    width: 100%; max-width: 320px;
    background: #03070f; border: 1px solid #0e1f3a;
    border-radius: 10px; padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
    transition: border-color 0.2s;
  }
  .auth-feature-pill:hover { border-color: #1d6fff44; }
  .auth-feature-pill-icon {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .auth-feature-pill-title { font-size: 12px; font-weight: 500; color: #e2eaf4; margin-bottom: 2px; }
  .auth-feature-pill-desc  { font-size: 10px; color: #4a6080; line-height: 1.5; }

  .auth-testimonial {
    max-width: 320px; width: 100%;
    background: #03070f; border: 1px solid #0e1f3a;
    border-radius: 10px; padding: 16px;
    margin-top: 4px;
  }
  .auth-testimonial-text { font-size: 12px; color: #4a6080; line-height: 1.7; font-style: italic; margin-bottom: 10px; }
  .auth-testimonial-author { font-size: 10px; color: #1d6fff; }

  @keyframes fadeUpAuth { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .auth-animate { animation: fadeUpAuth 0.5s ease both; }
  .auth-animate-d1 { animation-delay: 0.05s; }
  .auth-animate-d2 { animation-delay: 0.12s; }
  .auth-animate-d3 { animation-delay: 0.20s; }
`;

export default function AuthPage({ mode = "login" }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, signup } = useAuth();
  const go = (path) => navigate(`/${path}`);
  // After login, go to where the user was trying to go, or canvas
  const redirectTo = location.state?.from || "/canvas";
  const [view, setView]         = useState(mode); // "login" | "signup"
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", password:"" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (view === "signup" && !form.firstName) { setError("First name is required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      if (view === "login") {
        await login(form.email, form.password);
        navigate(redirectTo, { replace: true });
      } else {
        await signup(form.firstName, form.lastName, form.email, form.password);
        setSuccess("Account created! Redirecting...");
        setTimeout(() => navigate(redirectTo, { replace: true }), 800);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = view === "login";

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-wrap">
        <div className="auth-grid-bg" />
        <div className="auth-orb" style={{ width:400,height:400,background:"#1d6fff",top:-100,left:-100 }} />
        <div className="auth-orb" style={{ width:300,height:300,background:"#00d4ff",bottom:50,left:"40%" }} />

        {/* Left — Form */}
        <div className="auth-left">
          {/* Brand */}
          <div className="auth-brand" onClick={() => go("home")}>
            <div className="auth-brand-mark">☁</div>
            <span className="auth-brand-name">CloudForge</span>
          </div>

          <div className="auth-animate">
            <div className="auth-eyebrow">// {isLogin ? "WELCOME BACK" : "GET STARTED"}</div>
            <h1 className="auth-heading">
              {isLogin ? <>Sign in to<br/>your workspace.</> : <>Create your<br/>free account.</>}
            </h1>
            <p className="auth-sub">
              {isLogin
                ? "Pick up right where you left off. Your architectures are waiting."
                : "Start designing cloud infrastructure for free. No credit card required."}
            </p>
          </div>

          <form className="auth-form auth-animate auth-animate-d1" onSubmit={handleSubmit}>
            {/* OAuth */}
            <button type="button" className="auth-btn-oauth">
              <span>G</span> Continue with Google
            </button>
            <button type="button" className="auth-btn-oauth">
              <span>⌘</span> Continue with GitHub
            </button>

            <div className="auth-divider">or continue with email</div>

            {/* Name row (signup only) */}
            {!isLogin && (
              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label">FIRST NAME</label>
                  <input className="auth-input" placeholder="Ada" value={form.firstName} onChange={set("firstName")} />
                </div>
                <div className="auth-field">
                  <label className="auth-label">LAST NAME</label>
                  <input className="auth-input" placeholder="Lovelace" value={form.lastName} onChange={set("lastName")} />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">EMAIL ADDRESS</label>
              <input className="auth-input" type="email" placeholder="ada@example.com" value={form.email} onChange={set("email")} />
            </div>

            <div className="auth-field">
              <label className="auth-label">PASSWORD</label>
              <input className="auth-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
            </div>

            {isLogin && (
              <div style={{ textAlign:"right", marginTop:-4 }}>
                <button type="button" className="auth-switch-link" style={{ fontSize:10 }}>Forgot password?</button>
              </div>
            )}

            {error   && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In →" : "Create Account →"}
            </button>

            {!isLogin && (
              <div style={{ fontSize:10, color:"#1e3558", textAlign:"center" }}>
                By signing up you agree to our Terms & Privacy Policy.
              </div>
            )}
          </form>

          <div className="auth-switch auth-animate auth-animate-d2" style={{ marginTop:20, maxWidth:400 }}>
            {isLogin ? (
              <>Don't have an account?{" "}
                <button className="auth-switch-link" onClick={() => { setView("signup"); setError(""); setSuccess(""); }}>
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button className="auth-switch-link" onClick={() => { setView("login"); setError(""); setSuccess(""); }}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right — Feature highlights */}
        <div className="auth-right">
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#1e3558", letterSpacing:".12em", marginBottom:8 }}>
            // WHY CLOUDFORGE
          </div>

          {[
            { icon:"🎯", color:"#1d6fff", bg:"#1d6fff15", title:"Visual-first design", desc:"Drag & drop AWS components on an infinite canvas. No YAML until you're ready." },
            { icon:"💰", color:"#10b981", bg:"#10b98115", title:"Real-time cost estimates", desc:"See your monthly bill update live as you add components. No more surprises." },
            { icon:"🔒", color:"#ef4444", bg:"#ef444415", title:"Security validation", desc:"Catch misconfigurations like exposed ports and public databases before deployment." },
            { icon:"⚡", color:"#f59e0b", bg:"#f59e0b15", title:"One-click Terraform export", desc:"Export a ready-to-deploy main.tf directly from your visual architecture." },
          ].map((f, i) => (
            <div className="auth-feature-pill" key={i}>
              <div className="auth-feature-pill-icon" style={{ background:f.bg }}>
                {f.icon}
              </div>
              <div>
                <div className="auth-feature-pill-title">{f.title}</div>
                <div className="auth-feature-pill-desc">{f.desc}</div>
              </div>
            </div>
          ))}

          <div className="auth-testimonial">
            <div className="auth-testimonial-text">
              "CloudForge saved our team hours of back-and-forth. We designed our entire staging environment visually and exported the Terraform in one click."
            </div>
            <div className="auth-testimonial-author">— Priya S., Senior DevOps Engineer</div>
          </div>
        </div>
      </div>
    </>
  );
}