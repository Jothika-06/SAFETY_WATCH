import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:"100vh", background:"#F5F7FF", fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background:"#fff", borderBottom:"1px solid #CBD5E1", padding:"0 48px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, boxShadow:"0 1px 3px rgba(15,23,42,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center" }}>
  
  <div style={{
    width:40,
    height:40,
    borderRadius:12,
    background:"linear-gradient(135deg,#1D4ED8,#1E40AF)",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontSize:18,
    color:"#fff",
    boxShadow:"0 3px 10px rgba(29,78,216,0.3)",
    marginRight:12
  }}>
    🛡️
  </div>

  <span style={{
    fontFamily:"'Instrument Serif',serif",
    fontSize:22,
    color:"#0F172A",
    fontWeight:700,
    marginRight:14
  }}>
    SafetyWatch
  </span>

  <span style={{
    fontSize:11,
    color:"#1D4ED8",
    fontWeight:700,
    letterSpacing:"0.08em",
    textTransform:"uppercase",
    background:"#EFF6FF",
    padding:"4px 10px",
    borderRadius:20
  }}>
    GOV PORTAL
  </span>

</div>
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={() => navigate("/login")} style={{ padding:"9px 22px", borderRadius:9, border:"1.5px solid #1D4ED8", background:"transparent", color:"#1D4ED8", fontWeight:600, fontSize:13.5, cursor:"pointer", transition:"all 0.18s" }}
            onMouseOver={e => { e.currentTarget.style.background="#EFF6FF"; }}
            onMouseOut={e => { e.currentTarget.style.background="transparent"; }}>
            Login
          </button>
          <button onClick={() => navigate("/register")} style={{ padding:"9px 22px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", color:"#fff", fontWeight:600, fontSize:13.5, cursor:"pointer", boxShadow:"0 4px 14px rgba(29,78,216,0.3)" }}>
            Register
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
  background:"linear-gradient(160deg,#1E3A8A 0%,#1D4ED8 55%,#2563EB 100%)",
  minHeight:"600px",
  padding:"120px 24px",
  textAlign:"center",
  display:"flex",
  flexDirection:"column",
  justifyContent:"center"
}}>
        {/* decorative circles */}
        <div style={{ position:"absolute", top:-80, right:-80, width:320, height:320, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-60, left:-60, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />

       

        <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(38px,5.5vw,64px)", fontWeight:400, margin:"0 0 22px", color:"#fff", lineHeight:1.1, letterSpacing:"-0.02em" }}>
          Your City's Safety,<br />In Your Hands
        </h1>

        <p style={{ fontSize:"clamp(15px,1.8vw,18px)", color:"rgba(255,255,255,0.82)", maxWidth:560, margin:"0 auto 14px", lineHeight:1.8 }}>
          SafetyWatch is a government-grade platform where citizens report public safety issues — and the right department gets notified <em>automatically</em>, within seconds.
        </p>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.6)", maxWidth:460, margin:"0 auto 40px", lineHeight:1.7 }}>
          From broken streetlights to burst pipelines — submit a complaint, attach a photo, and our AI handles the rest.
        </p>

        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => navigate("/register")}
            style={{ padding:"14px 36px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:"#fff", color:"#1D4ED8", boxShadow:"0 6px 20px rgba(0,0,0,0.18)", transition:"all 0.2s" }}
            onMouseOver={e => e.currentTarget.style.transform="translateY(-2px)"}
            onMouseOut={e => e.currentTarget.style.transform="translateY(0)"}>
            Report an Issue →
          </button>
          <button onClick={() => navigate("/login")}
            style={{ padding:"14px 36px", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:15, background:"transparent", border:"1.5px solid rgba(255,255,255,0.5)", color:"#fff", transition:"all 0.2s" }}
            onMouseOver={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
            onMouseOut={e => e.currentTarget.style.background="transparent"}>
            Sign In
          </button>
        </div>

        {/* Trust badge row */}
       
      </div>

    

      {/* How It Works */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"72px 24px 90px" }}>
      <div style={{ textAlign:"center", marginBottom:52 }}>
  <div style={{ fontSize:11, color:"#1D4ED8", fontWeight:700, letterSpacing:1.6, marginBottom:12, textTransform:"uppercase" }}>
    Public Services
  </div>

  <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:32, fontWeight:400, margin:"0 0 14px", color:"#0F172A" }}>
    Citizen Services & Portal Features
  </h3>

  <p style={{ fontSize:15.5, color:"#475569", maxWidth:620, margin:"0 auto", lineHeight:1.8 }}>
    The Smart City Public Complaint Management Portal provides digital public services for reporting,
    tracking, and resolving infrastructure and public safety issues through an AI-enabled governance system.
  </p>
</div>

<div style={{
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
  gap:18
}}>

  {[
    { step:"01", icon:"📝", title:"Submit Public Complaint", desc:"Report public infrastructure and safety issues including roads, water supply, street lights, sanitation and emergency issues." },
    { step:"02", icon:"📊", title:"Track Complaint Status", desc:"Track complaint status in real time including Pending, Assigned, In Progress and Resolved updates." },
    { step:"03", icon:"🤖", title:"AI Complaint Classification", desc:"The system automatically classifies complaints based on category and severity level using Artificial Intelligence." },
    { step:"04", icon:"🏛️", title:"Department Assignment", desc:"Complaints are automatically routed to the appropriate government department for action." },
    { step:"05", icon:"📁", title:"Complaint History", desc:"Citizens can view all previously submitted complaints along with status and resolution details." },
    { step:"06", icon:"📷", title:"Resolution Updates", desc:"Departments upload resolution proof and update complaint status after issue resolution." },
  ].map(item => (
    <div key={item.step}
      style={{
        borderRadius:14,
        padding:"26px 22px",
        border:"1px solid #E2E8F0",
        background:"#fff",
        boxShadow:"0 1px 4px rgba(15,23,42,0.05)",
        transition:"all 0.2s",
        cursor:"pointer"
      }}
      onMouseOver={e => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(29,78,216,0.12)";
        e.currentTarget.style.borderColor = "#BFDBFE";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseOut={e => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.05)";
        e.currentTarget.style.borderColor = "#E2E8F0";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ fontSize:11, fontWeight:800, color:"#1D4ED8", marginBottom:10 }}>
        SERVICE {item.step}
      </div>

      <div style={{
        width:44,
        height:44,
        borderRadius:"50%",
        background:"#EFF6FF",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontSize:20,
        marginBottom:12
      }}>
        {item.icon}
      </div>

      <div style={{ fontWeight:700, fontSize:15, color:"#0F172A", marginBottom:8 }}>
        {item.title}
      </div>

      <div style={{ fontSize:13.5, color:"#475569", lineHeight:1.7 }}>
        {item.desc}
      </div>
    </div>
  ))}

</div>
      </div>

      {/* CTA */}
      <div style={{ background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", padding:"64px 24px", textAlign:"center" }}>
        <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:32, fontWeight:400, color:"#fff", marginBottom:14 }}>Ready to Make Your City Safer?</h3>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.78)", marginBottom:32, maxWidth:460, margin:"0 auto 32px", lineHeight:1.75 }}>
          Join thousands of citizens who are already using SafetyWatch to report, track, and resolve public safety issues.
        </p>
        <button onClick={() => navigate("/register")}
          style={{ padding:"14px 40px", borderRadius:10, border:"none", background:"#fff", color:"#1D4ED8", fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 6px 20px rgba(0,0,0,0.18)" }}>
          Get Started — It's Free
        </button>
      </div>

      {/* Footer */}
      <div style={{ background:"#0F172A", padding:"28px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>🛡️</span>
          <span style={{ fontFamily:"'Instrument Serif',serif", fontSize:16, color:"#fff" }}>SafetyWatch</span>
          <span style={{ fontSize:11, color:"#64748B", marginLeft:4 }}>Government Public Safety Portal</span>
        </div>
        <div style={{ fontSize:12.5, color:"#475569" }}>© 2026 SafetyWatch. All rights reserved.</div>
      </div>
    </div>
  );
}
