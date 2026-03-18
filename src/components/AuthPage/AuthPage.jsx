import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AuthPage.css";

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
      <div className="auth-wrap">
        <div className="auth-grid-bg" style={{display:"none"}} />
        <div className="auth-blob" style={{ width:400,height:400,background:"#bfdbfe",top:-100,left:-100 }} />
        <div className="auth-blob" style={{ width:300,height:300,background:"#a5f3fc",bottom:50,left:"40%" }} />

        {/* Left — Form */}
        <div className="auth-left">
          {/* Brand */}
          <div className="auth-brand" onClick={() => go("home")}>
            <div className="auth-brand-mark">☁</div>
            <span className="auth-brand-name">StackForge</span>
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
              "StackForge saved our team hours of back-and-forth. We designed our entire staging environment visually and exported the Terraform in one click."
            </div>
            <div className="auth-testimonial-author">— Priya S., Senior DevOps Engineer</div>
          </div>
        </div>
      </div>
    </>
  );
}