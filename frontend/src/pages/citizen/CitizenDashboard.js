import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyComplaints } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const sC  = (s) => s === "High" ? "#DC2626" : s === "Medium" ? "#D97706" : "#16A34A";
const sBg = (s) => s === "High" ? "#FEE2E2" : s === "Medium" ? "#FEF3C7" : "#DCFCE7";
const stC  = (s) => s === "Resolved" ? "#16A34A" : s === "Assigned" ? "#1D4ED8" : "#D97706";
const stBg = (s) => s === "Resolved" ? "#DCFCE7" : s === "Assigned" ? "#EFF6FF" : "#FEF3C7";

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setError("");
      const res = await getMyComplaints();
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      setError("Failed to load complaints. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const total    = complaints.length;
  const pending  = complaints.filter(c => c.status === "Pending").length;
  const assigned = complaints.filter(c => c.status === "Assigned").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;

  return (
    <div className="sw-page">
      {/* Navbar */}
      <nav className="sw-nav">
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, boxShadow:"0 3px 14px rgba(29,78,216,0.3)" }}>🛡️</div>
          <div>
            <span style={{ fontFamily:"'Instrument Serif',serif", fontSize:18, color:"var(--ink)", letterSpacing:"-0.01em" }}>SafetyWatch</span>
            <span style={{ fontSize:10, color:"var(--teal)", fontWeight:700, marginLeft:8, letterSpacing:"0.08em", textTransform:"uppercase", background:"var(--tealL)", padding:"2px 8px", borderRadius:20 }}>Citizen Portal</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ padding:"5px 14px", borderRadius:20, background:"var(--ivory2)", border:"1px solid var(--border)", fontSize:12.5, color:"var(--muted)" }}>
            Hello, <strong style={{ color:"var(--ink)" }}>{user?.name}</strong>
          </div>
          <button className="sw-btn-ghost" onClick={() => { logout(); navigate("/login"); }} style={{ padding:"7px 16px", fontSize:12.5 }}>Logout</button>
        </div>
      </nav>

      <div className="sw-content">
        {/* Header */}
        <div className="anim-fu" style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <div style={{ width:4, height:30, borderRadius:2, background:"var(--teal)" }} />
            <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:30, fontWeight:400 }}>Welcome, {user?.name} 👋</h2>
          </div>
          <p style={{ fontSize:14.5, color:"var(--muted)", paddingLeft:12 }}>Manage and track your public safety complaints</p>
        </div>

        {/* ── Action Buttons ── */}
        <div className="anim-fu1" style={{ display:"flex", gap:14, marginBottom:28, flexWrap:"wrap" }}>
          <button
            onClick={() => navigate("/citizen/submit")}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 26px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 6px 20px rgba(29,78,216,0.35)", transition:"all 0.2s" }}
            onMouseOver={e => e.currentTarget.style.transform="translateY(-2px)"}
            onMouseOut={e => e.currentTarget.style.transform="translateY(0)"}
          >
            <span style={{ fontSize:18 }}>➕</span>
            Raise New Complaint
          </button>
          <button
            onClick={() => navigate("/citizen/history")}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 26px", borderRadius:12, border:"2px solid #1D4ED8", background:"transparent", color:"#1D4ED8", fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.2s" }}
            onMouseOver={e => { e.currentTarget.style.background="#EFF6FF"; e.currentTarget.style.transform="translateY(-2px)"; }}
            onMouseOut={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.transform="translateY(0)"; }}
          >
            <span style={{ fontSize:18 }}>📋</span>
            View All Complaints
          </button>
          <button
            onClick={fetchComplaints}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 20px", borderRadius:12, border:"1.5px solid var(--border)", background:"var(--white)", color:"var(--muted)", fontWeight:600, fontSize:13, cursor:"pointer", transition:"all 0.2s" }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="anim-fu2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:14, marginBottom:28 }}>
          {[
            { icon:"📋", label:"Total Complaints", value:total,    color:"#1D4ED8", bg:"#EFF6FF", border:"#1D4ED8" },
            { icon:"⏳", label:"Pending",          value:pending,  color:"#D97706", bg:"#FEF3C7", border:"#D97706" },
            { icon:"🔄", label:"Assigned",         value:assigned, color:"#1D4ED8", bg:"#EFF6FF", border:"#1D4ED8" },
            { icon:"✅", label:"Resolved",         value:resolved, color:"#16A34A", bg:"#DCFCE7", border:"#16A34A" },
          ].map(card => (
            <div key={card.label} style={{ background:"var(--white)", border:`1px solid var(--border)`, borderTop:`3px solid ${card.border}`, borderRadius:14, padding:"20px 22px", display:"flex", alignItems:"center", gap:14, boxShadow:"var(--shadow-sm)", transition:"all 0.2s" }}
              onMouseOver={e => e.currentTarget.style.boxShadow="var(--shadow)"}
              onMouseOut={e => e.currentTarget.style.boxShadow="var(--shadow-sm)"}
            >
              <div style={{ width:48, height:48, borderRadius:12, background:card.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{card.icon}</div>
              <div>
                <div style={{ fontSize:28, fontWeight:800, color:card.color, lineHeight:1 }}>{card.value}</div>
                <div style={{ fontSize:12, color:"var(--muted)", fontWeight:600, marginTop:3 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding:"12px 18px", borderRadius:10, background:"#FEE2E2", border:"1.5px solid rgba(220,38,38,0.3)", color:"#DC2626", fontSize:13.5, marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            ⚠️ {error}
            <button onClick={fetchComplaints} style={{ marginLeft:"auto", padding:"5px 14px", borderRadius:8, border:"1.5px solid #DC2626", background:"transparent", color:"#DC2626", fontWeight:700, fontSize:12, cursor:"pointer" }}>Retry</button>
          </div>
        )}

        {/* Recent Complaints Table */}
        <div className="anim-fu3 sw-card" style={{ padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:20, fontWeight:400, color:"var(--ink)" }}>Recent Complaints</div>
            {complaints.length > 0 && (
              <button onClick={() => navigate("/citizen/history")} style={{ padding:"6px 16px", borderRadius:8, border:"1.5px solid #1D4ED8", background:"transparent", color:"#1D4ED8", fontWeight:600, fontSize:12, cursor:"pointer" }}>
                View All →
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid #EFF6FF", borderTopColor:"#1D4ED8", animation:"spin 1s linear infinite", margin:"0 auto 14px" }} />
              <p style={{ color:"var(--muted)", fontSize:14 }}>Loading your complaints…</p>
            </div>
          ) : complaints.length === 0 ? (
            <div style={{ textAlign:"center", padding:"56px 0" }}>
              <div style={{ width:80, height:80, borderRadius:22, background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, margin:"0 auto 18px" }}>📭</div>
              <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:22, fontWeight:400, marginBottom:8 }}>No complaints yet</h3>
              <p style={{ color:"var(--muted)", fontSize:14, marginBottom:24 }}>Click "Raise New Complaint" to submit your first complaint</p>
              <button onClick={() => navigate("/citizen/submit")} className="sw-btn-primary" style={{ padding:"12px 28px", fontSize:14 }}>
                ➕ Raise New Complaint
              </button>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#F8FAFF" }}>
                    {["Description","Location","Category","Severity","Status","Date"].map(h => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:"var(--muted)", fontWeight:700, fontSize:11, letterSpacing:0.5, textTransform:"uppercase", borderBottom:"2px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 5).map((c, i) => (
                    <tr key={c._id} style={{ borderBottom:"1px solid var(--border)", background: i % 2 === 0 ? "#fff" : "#F8FAFF", cursor:"pointer" }}
                      onClick={() => navigate("/citizen/history")}
                      onMouseOver={e => e.currentTarget.style.background="#EFF6FF"}
                      onMouseOut={e => e.currentTarget.style.background= i % 2 === 0 ? "#fff" : "#F8FAFF"}
                    >
                      <td style={{ padding:"12px 14px", color:"var(--ink)", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.description}</td>
                      <td style={{ padding:"12px 14px", color:"var(--muted)" }}>{c.location}</td>
                      <td style={{ padding:"12px 14px", color:"var(--ink2)", fontWeight:600 }}>{c.category}</td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:sBg(c.severity), color:sC(c.severity) }}>{c.severity}</span>
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:stBg(c.status), color:stC(c.status) }}>{c.status}</span>
                      </td>
                      <td style={{ padding:"12px 14px", color:"var(--muted)" }}>{new Date(c.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {complaints.length > 5 && (
                <div style={{ textAlign:"center", marginTop:16 }}>
                  <button onClick={() => navigate("/citizen/history")} style={{ padding:"8px 22px", borderRadius:9, border:"1.5px solid #1D4ED8", background:"transparent", color:"#1D4ED8", fontWeight:600, fontSize:13, cursor:"pointer" }}>
                    View all {complaints.length} complaints →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}