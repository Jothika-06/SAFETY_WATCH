import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const FAKE_DOMAINS = new Set(["test.com","fake.com","example.com","mailinator.com","guerrillamail.com","tempmail.com","throwaway.email","yopmail.com","10minutemail.com","trashmail.com","dispostable.com","spamgourmet.com","maildrop.cc","sharklasers.com","spam4.me","tempr.email","binkmail.com","fakeinbox.com","getnada.com","harakirimail.com","trashmail.me","trashmail.io","trashmail.at","trashmail.net","trashmail.org","mytempemail.com","mintemail.com","getairmail.com","temporaryemail.net","temporary-email.com","guerrillamail.info","trash-mail.com","mailnull.com"]);
const TEST_NAMES = new Set(["test","fake","sample","demo","placeholder","noemail","noreply","invalid","dummy","abc","xyz","foo","bar","baz","temp","null","none","random","asdf","qwerty"]);

function validateEmail(email) {
  const fmt = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email)             return "Email address is required.";
  if (!fmt.test(email))   return "Enter a valid email (e.g. john@gmail.com).";
  if (email.includes("..")) return "Email cannot contain consecutive dots.";
  const [local, domain] = email.toLowerCase().split("@");
  if (local.length < 2)  return "The part before @ must be at least 2 characters.";
  const parts = domain.split("."); const tld = parts.pop(); const base = parts.join(".");
  if (tld.length < 2 || /^\d+$/.test(tld)) return "Invalid email domain extension.";
  if (base.length < 4)   return "Email domain is too short — use a real email address.";
  if (FAKE_DOMAINS.has(domain)) return "Disposable emails are not allowed. Please use your real email.";
  if (TEST_NAMES.has(base))     return "This looks like a test email. Use your actual email address.";
  return null;
}

const DEPTS = [
  { v:"Electrical Department",       l:"⚡ Electrical Department" },
  { v:"Road Maintenance Department", l:"🛣️ Road Maintenance Department" },
  { v:"Sanitation Department",       l:"🧹 Sanitation Department" },
  { v:"Water Supply Department",     l:"💧 Water Supply Department" },
  { v:"Emergency Department",        l:"🚨 Emergency Department" },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  // All fields start EMPTY — no pre-filled data
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"", role:"citizen", department:"" });
  const [err, setErr]         = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [emailOk, setEmailOk]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const onEmailBlur = () => {
    if (!form.email) return;
    const e = validateEmail(form.email);
    setEmailErr(e || ""); setEmailOk(!e);
  };

  const handleSubmit = async () => {
    setErr(""); setEmailErr("");
    if (!form.name.trim()) return setErr("Please enter your full name.");
    const eErr = validateEmail(form.email);
    if (eErr) { setEmailErr(eErr); return; }
    if (!form.password)   return setErr("Please create a password.");
    if (form.password.length < 6) return setErr("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setErr("Passwords do not match.");
    if (form.role === "department" && !form.department) return setErr("Please select your department.");
    setLoading(true);
    try {
      const res = await registerUser({ name:form.name, email:form.email, password:form.password, role:form.role, department:form.department });
      login(res.data.user, res.data.token);
      const r = res.data.user.role;
      nav(r==="admin"?"/admin":r==="department"?"/department":"/citizen");
    } catch (e) {
      setErr(e.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = form.password.length===0?0:form.password.length<6?1:form.password.length<10?2:3;
  const pwdLabel    = ["","Weak","Fair","Strong"][pwdStrength];
  const pwdColor    = ["","#DC2626","#D97706","#16A34A"][pwdStrength];

  const inputStyle = {
    width:"100%", padding:"11px 15px", borderRadius:10,
    border:"1.5px solid #CBD5E1", background:"#fff",
    color:"#0F172A", fontSize:14, outline:"none",
    transition:"border-color 0.2s, box-shadow 0.2s", boxSizing:"border-box",
    fontFamily:"'Plus Jakarta Sans',sans-serif",
    // Disable browser autofill styling
    WebkitBoxShadow:"0 0 0 30px white inset",
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F5F7FF" }}>

      {/* LEFT BLUE PANEL */}
      <div style={{ width:400, background:"linear-gradient(160deg,#1E3A8A 0%,#1D4ED8 60%,#2563EB 100%)", display:"flex", flexDirection:"column", justifyContent:"center", padding:"56px 48px", flexShrink:0, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-70, right:-70, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-50, left:-50, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:52 }}>
            <div style={{ width:44, height:44, borderRadius:13, background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, border:"1px solid rgba(255,255,255,0.2)" }}>🛡️</div>
            <div>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:19, color:"#fff" }}>SafetyWatch</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.55)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>Government Portal</div>
            </div>
          </div>

          <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:34, fontWeight:400, color:"#fff", lineHeight:1.15, marginBottom:16 }}>
            Join SafetyWatch<br />— Make a Difference
          </h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.72)", lineHeight:1.8, marginBottom:40 }}>
            Register to report public safety issues directly to the right government department. Your reports lead to real action.
          </p>

          <div style={{ display:"grid", gap:11 }}>
            {[
              ["👤","Citizen","Report issues and track complaint status in real time"],
              ["🏢","Department","Receive assigned cases and mark them as resolved"],
              ["⚙️","Admin","Monitor and oversee the entire platform"],
            ].map(([icon, r, d]) => (
              <div key={r} style={{ padding:"13px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.18)", background:"rgba(255,255,255,0.09)", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:"#fff" }}>{r}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginTop:2 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"44px 40px", overflowY:"auto", background:"#F5F7FF" }}>
        <div style={{ width:"100%", maxWidth:500 }}>
          <button onClick={() => nav("/")} style={{ padding:"6px 14px", borderRadius:8, border:"1.5px solid #CBD5E1", background:"transparent", color:"#475569", fontWeight:600, fontSize:12.5, cursor:"pointer", marginBottom:30, fontFamily:"inherit" }}>← Back to Home</button>

          <div style={{ marginBottom:30 }}>
            <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:30, fontWeight:400, color:"#0F172A", marginBottom:6 }}>Create Account</h2>
            <p style={{ fontSize:14, color:"#475569", lineHeight:1.6 }}>Fill in your details below to register. Fields marked * are required.</p>
          </div>

          <div style={{ display:"grid", gap:20 }}>

            {/* Name */}
            <div>
              <label style={{ fontSize:12, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Full Name *</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:"#94A3B8", pointerEvents:"none" }}>👤</span>
                <input
                  style={{ ...inputStyle, paddingLeft:44 }}
                  type="text"
                  placeholder="Your full name"
                  autoComplete="off"
                  value={form.name}
                  onChange={e => setForm({...form, name:e.target.value})}
                  onFocus={e => { e.target.style.borderColor="#1D4ED8"; e.target.style.boxShadow="0 0 0 3px rgba(29,78,216,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor="#CBD5E1"; e.target.style.boxShadow="none"; }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize:12, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Email Address *</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:"#94A3B8", pointerEvents:"none" }}>📧</span>
                <input
                  style={{ ...inputStyle, paddingLeft:44, paddingRight:40, borderColor:emailErr?"#DC2626":emailOk?"#16A34A":undefined, boxShadow:emailErr?"0 0 0 3px rgba(220,38,38,0.1)":emailOk?"0 0 0 3px rgba(22,163,74,0.1)":undefined }}
                  type="email"
                  placeholder="yourname@gmail.com"
                  autoComplete="new-password"
                  value={form.email}
                  onChange={e => { setForm({...form,email:e.target.value}); if(emailErr||emailOk){setEmailErr("");setEmailOk(false);} }}
                  onBlur={onEmailBlur}
                  onFocus={e => { if(!emailErr&&!emailOk){ e.target.style.borderColor="#1D4ED8"; e.target.style.boxShadow="0 0 0 3px rgba(29,78,216,0.12)"; }}}
                />
                {emailOk && !emailErr && <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>✅</span>}
                {emailErr && <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>❌</span>}
              </div>
              {emailErr && <div style={{ marginTop:7, fontSize:12.5, color:"#DC2626", display:"flex", alignItems:"flex-start", gap:5 }}><span>⚠️</span><span>{emailErr}</span></div>}
              {emailOk && !emailErr && <div style={{ marginTop:7, fontSize:12.5, color:"#16A34A", fontWeight:600 }}>✅ Valid email address</div>}
              {!emailErr && !emailOk && <div style={{ marginTop:6, fontSize:12, color:"#94A3B8" }}>Use a real address like yourname@gmail.com</div>}
            </div>

            {/* Password */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div>
                <label style={{ fontSize:12, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Password *</label>
                <div style={{ position:"relative" }}>
                  <input
                    style={{ ...inputStyle, paddingRight:40 }}
                    type={showPwd?"text":"password"}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => setForm({...form, password:e.target.value})}
                    onFocus={e => { e.target.style.borderColor="#1D4ED8"; e.target.style.boxShadow="0 0 0 3px rgba(29,78,216,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor="#CBD5E1"; e.target.style.boxShadow="none"; }}
                  />
                  <button onClick={() => setShowPwd(s => !s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#94A3B8", cursor:"pointer", fontSize:15, padding:0, lineHeight:1 }}>{showPwd?"🙈":"👁️"}</button>
                </div>
                {form.password && (
                  <div style={{ marginTop:7 }}>
                    <div style={{ height:3, borderRadius:2, background:"#E2E8F0", overflow:"hidden", marginBottom:4 }}>
                      <div style={{ height:"100%", borderRadius:2, transition:"width 0.3s,background 0.3s", width:`${[0,33,66,100][pwdStrength]}%`, background:pwdColor }} />
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:pwdColor }}>{pwdLabel}</span>
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize:12, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Confirm *</label>
                <input
                  style={{ ...inputStyle, borderColor:form.confirm&&form.password!==form.confirm?"#DC2626":form.confirm&&form.password===form.confirm?"#16A34A":undefined }}
                  type={showPwd?"text":"password"}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={e => setForm({...form, confirm:e.target.value})}
                  onFocus={e => { if(!(form.confirm&&form.password!==form.confirm)){ e.target.style.borderColor="#1D4ED8"; e.target.style.boxShadow="0 0 0 3px rgba(29,78,216,0.12)"; }}}
                  onBlur={e => { e.target.style.boxShadow="none"; }}
                />
                {form.confirm && form.password===form.confirm && <div style={{ marginTop:6, fontSize:11.5, color:"#16A34A", fontWeight:600 }}>✅ Passwords match</div>}
                {form.confirm && form.password!==form.confirm && <div style={{ marginTop:6, fontSize:11.5, color:"#DC2626", fontWeight:600 }}>❌ Passwords don't match</div>}
              </div>
            </div>

            {/* Role toggle */}
            <div>
              <label style={{ fontSize:12, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:10 }}>Register As *</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {[["citizen","👤","Citizen"],["department","🏢","Department"],["admin","⚙️","Admin"]].map(([v,icon,l]) => (
                  <button key={v} onClick={() => setForm({...form, role:v, department:""})}
                    style={{ padding:"14px 8px", borderRadius:12, border:`1.5px solid ${form.role===v?"#1D4ED8":"#CBD5E1"}`, background:form.role===v?"#EFF6FF":"#fff", color:form.role===v?"#1D4ED8":"#475569", fontWeight:700, fontSize:12.5, cursor:"pointer", transition:"all 0.18s", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:6, boxShadow:form.role===v?"0 0 0 3px rgba(29,78,216,0.12)":"none" }}>
                    <span style={{ fontSize:22 }}>{icon}</span>{l}
                  </button>
                ))}
              </div>
            </div>

            {/* Department selector */}
            {form.role === "department" && (
              <div>
                <label style={{ fontSize:12, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Your Department *</label>
                <select
                  style={{ ...inputStyle, cursor:"pointer" }}
                  value={form.department}
                  onChange={e => setForm({...form, department:e.target.value})}
                  onFocus={e => { e.target.style.borderColor="#1D4ED8"; e.target.style.boxShadow="0 0 0 3px rgba(29,78,216,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor="#CBD5E1"; e.target.style.boxShadow="none"; }}
                >
                  <option value="">— Select your department —</option>
                  {DEPTS.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
                </select>
              </div>
            )}
          </div>

          {err && (
            <div style={{ marginTop:20, padding:"13px 18px", borderRadius:11, background:"#FEE2E2", border:"1.5px solid rgba(220,38,38,0.25)", fontSize:13.5, color:"#DC2626", fontWeight:500, display:"flex", alignItems:"flex-start", gap:10 }}>
              <span style={{ fontSize:17, flexShrink:0 }}>⚠️</span>{err}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !!emailErr}
            style={{ marginTop:26, width:"100%", padding:"16px", fontSize:15, borderRadius:12, border:"none", background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", color:"#fff", fontWeight:700, cursor:(loading||!!emailErr)?"not-allowed":"pointer", boxShadow:"0 8px 28px rgba(29,78,216,0.32)", opacity:(loading||!!emailErr)?0.7:1, fontFamily:"inherit", transition:"transform 0.18s" }}
            onMouseOver={e => { if(!loading&&!emailErr) e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseOut={e => e.currentTarget.style.transform="translateY(0)"}
          >
            {loading ? (
              <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
                <span style={{ width:16, height:16, border:"2.5px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />
                Creating Account…
              </span>
            ) : "Create Account →"}
          </button>

          <p style={{ marginTop:20, textAlign:"center", fontSize:14, color:"#475569" }}>
            Already have an account?{" "}
            <span onClick={() => nav("/login")} style={{ color:"#1D4ED8", fontWeight:700, cursor:"pointer" }}>Sign in here</span>
          </p>
        </div>
      </div>
    </div>
  );
}
