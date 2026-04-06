import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // All fields start EMPTY
  const [form, setForm]     = useState({ email:"", password:"" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) return setError("Please enter your email and password.");
    try {
      setLoading(true);
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === "admin")           navigate("/admin");
      else if (role === "department") navigate("/department");
      else                            navigate("/citizen");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:"100%", padding:"11px 13px", borderRadius:9,
    border:"1.5px solid #CBD5E1", background:"#FAFBFD",
    color:"#0F172A", fontSize:14, outline:"none",
    transition:"border-color 0.2s, box-shadow 0.2s", boxSizing:"border-box",
    fontFamily:"'Plus Jakarta Sans',sans-serif",
  };
  const focusIn  = e => { e.target.style.borderColor="#1D4ED8"; e.target.style.boxShadow="0 0 0 3px rgba(29,78,216,0.12)"; };
  const focusOut = e => { e.target.style.borderColor="#CBD5E1"; e.target.style.boxShadow="none"; };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"#F5F7FF", fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif" }}>

      {/* Left Blue Panel */}
      <div style={{ flex:"0 0 400px", background:"linear-gradient(160deg,#1E3A8A,#2563EB)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 40px", color:"#fff" }}>
        <div style={{ fontSize:44, marginBottom:18 }}>🛡️</div>
        <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:24, fontWeight:400, margin:"0 0 8px", color:"#fff", textAlign:"center" }}>SafetyWatch Portal</h2>
        <div style={{ width:36, height:2, background:"rgba(255,255,255,0.35)", borderRadius:2, margin:"14px auto 20px" }} />
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.85)", lineHeight:1.9, textAlign:"center", marginBottom:16 }}>
          The secure login page for the SafetyWatch Public Safety Platform.
        </p>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.8, textAlign:"center" }}>
          Sign in with your registered email and password. You will be automatically redirected to your role-specific dashboard.
        </p>
        <div style={{ marginTop:36, display:"grid", gap:10, width:"100%" }}>
          {[["👤","Citizens — Report & track safety issues"],["🏢","Departments — Manage assigned cases"],["⚙️","Admins — Platform-wide oversight"]].map(([icon,text]) => (
            <div key={text} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", fontSize:12.5, color:"rgba(255,255,255,0.85)" }}>
              <span style={{ fontSize:18 }}>{icon}</span> {text}
            </div>
          ))}
        </div>
      </div>

      {/* Right Form */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:14, padding:"40px 36px", width:"100%", maxWidth:420, boxShadow:"0 4px 24px rgba(15,23,42,0.08)" }}>
          <h2 style={{ margin:"0 0 6px", fontFamily:"'Instrument Serif',serif", fontSize:26, fontWeight:400, color:"#0F172A" }}>Welcome Back</h2>
          <p style={{ margin:"0 0 28px", fontSize:13.5, color:"#64748B" }}>Sign in to your SafetyWatch account to continue</p>

          {/* Email */}
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:12, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:8, display:"block" }}>Email Address</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="yourname@gmail.com"
              autoComplete="username"
name="email"
              value={form.email}
              onChange={e => setForm({...form, email:e.target.value})}
              onFocus={focusIn} onBlur={focusOut}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:24, position:"relative" }}>
            <label style={{ fontSize:12, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:8, display:"block" }}>Password</label>
            <div style={{ position:"relative" }}>
              <input
                style={{ ...inputStyle, paddingRight:44 }}
                type={showPwd?"text":"password"}
                placeholder="Enter your password"
                autoComplete="current-password"
name="password"
                value={form.password}
                onChange={e => setForm({...form, password:e.target.value})}
                onFocus={focusIn} onBlur={focusOut}
                onKeyDown={e => e.key==="Enter" && handleSubmit()}
              />
              <button
                onClick={() => setShowPwd(s => !s)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#94A3B8", cursor:"pointer", fontSize:16, lineHeight:1, padding:0 }}
              >
                {showPwd?"🙈":"👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color:"#DC2626", fontSize:13, marginBottom:16, padding:"10px 14px", background:"#FEE2E2", borderRadius:9, display:"flex", alignItems:"center", gap:8 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width:"100%", padding:"13px", fontSize:14.5, fontWeight:700, border:"none", borderRadius:10, cursor:loading?"not-allowed":"pointer", background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", color:"#fff", opacity:loading?0.75:1, fontFamily:"inherit", boxShadow:"0 6px 20px rgba(29,78,216,0.3)", transition:"transform 0.18s" }}
            onMouseOver={e => { if(!loading) e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseOut={e => e.currentTarget.style.transform="translateY(0)"}
          >
            {loading ? (
              <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
                <span style={{ width:16, height:16, border:"2.5px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />
                Signing in…
              </span>
            ) : "Sign In →"}
          </button>

          <p style={{ textAlign:"center", fontSize:13.5, color:"#64748B", marginTop:20 }}>
            No account?{" "}
            <Link to="/register" style={{ color:"#1D4ED8", fontWeight:600, textDecoration:"none" }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
