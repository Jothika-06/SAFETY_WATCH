import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyComplaints } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const sevCol = s => s==="High"?"#DC2626":s==="Medium"?"#D97706":"#16A34A";
const sevBg  = s => s==="High"?"#FEE2E2":s==="Medium"?"#FEF3C7":"#DCFCE7";
const stCol  = s => s==="Resolved"?"#16A34A":s==="Assigned"?"#1D4ED8":"#D97706";
const stBg   = s => s==="Resolved"?"#DCFCE7":s==="Assigned"?"#EFF6FF":"#FEF3C7";

const STEPS = ["Pending","Assigned","Resolved"];

function Timeline({ status }) {
  const idx = STEPS.indexOf(status);
  return (
    <div style={{ display:"flex", alignItems:"flex-start", marginTop:16 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : "none" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{
              width:26, height:26, borderRadius:"50%",
              background: i < idx ? "#1D4ED8" : i === idx ? "#fff" : "#F1F5F9",
              border: i <= idx ? "2.5px solid #1D4ED8" : "2.5px solid var(--border)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, color: i < idx ? "#fff" : i === idx ? "#1D4ED8" : "var(--mutedL)",
              fontWeight:800,
              boxShadow: i === idx ? "0 0 0 4px rgba(29,78,216,0.15)" : "none",
              transition:"all 0.3s"
            }}>
              {i < idx ? "✓" : i === idx ? "●" : "○"}
            </div>
            <span style={{ fontSize:10, fontWeight:700, color: i <= idx ? "#1D4ED8" : "var(--muted)", whiteSpace:"nowrap" }}>{s}</span>
          </div>
          {i < 2 && (
            <div style={{ flex:1, height:2.5, background: i < idx ? "#1D4ED8" : "var(--border)", margin:"0 5px", marginBottom:20, borderRadius:2, transition:"background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ComplaintHistory() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("All");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setError("");
      const r = await getMyComplaints();
      setComplaints(r.data.complaints || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total:    complaints.length,
    pending:  complaints.filter(c => c.status === "Pending").length,
    assigned: complaints.filter(c => c.status === "Assigned").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
  };

  const filtered = complaints
    .filter(c => filter === "All" || c.status === filter)
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.description?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="sw-page">
      {/* NAV */}
      <nav className="sw-nav">
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, boxShadow:"0 3px 14px rgba(29,78,216,0.3)" }}>🛡️</div>
          <div>
            <span style={{ fontFamily:"'Instrument Serif',serif", fontSize:18, color:"var(--ink)", letterSpacing:"-0.01em" }}>SafetyWatch</span>
            <span style={{ fontSize:10, color:"var(--teal)", fontWeight:700, marginLeft:8, letterSpacing:"0.08em", textTransform:"uppercase", background:"var(--tealL)", padding:"2px 8px", borderRadius:20 }}>Citizen Portal</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ padding:"5px 14px", borderRadius:20, background:"var(--ivory2)", border:"1px solid var(--border)", fontSize:12.5, color:"var(--muted)" }}>
            Hello, <strong style={{ color:"var(--ink)" }}>{user?.name}</strong>
          </div>
          <button className="sw-btn-ghost" onClick={() => nav("/citizen")} style={{ padding:"7px 16px", fontSize:12.5 }}>← Dashboard</button>
          <button className="sw-btn-primary" onClick={() => nav("/citizen/submit")} style={{ padding:"7px 16px", fontSize:12.5 }}>+ New Complaint</button>
          <button className="sw-btn-ghost" onClick={() => { logout(); nav("/login"); }} style={{ padding:"7px 16px", fontSize:12.5 }}>Logout</button>
        </div>
      </nav>

      <div className="sw-content">
        {/* HEADER */}
        <div className="anim-fu" style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <div style={{ width:4, height:30, borderRadius:2, background:"var(--teal)" }} />
            <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:30, fontWeight:400 }}>Complaint History</h2>
          </div>
          <p style={{ fontSize:14.5, color:"var(--muted)", paddingLeft:12 }}>Track all your submitted complaints and their real-time resolution status</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding:"12px 18px", borderRadius:10, background:"#FEE2E2", border:"1.5px solid rgba(220,38,38,0.3)", color:"#DC2626", fontSize:13.5, marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            ⚠️ {error}
            <button onClick={fetchComplaints} style={{ marginLeft:"auto", padding:"5px 14px", borderRadius:8, border:"1.5px solid #DC2626", background:"transparent", color:"#DC2626", fontWeight:700, fontSize:12, cursor:"pointer" }}>Retry</button>
          </div>
        )}

        {/* STATS — clickable filters */}
        <div className="anim-fu1" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
          {[
            ["📋","Total",    stats.total,    "#1D4ED8","#EFF6FF","All"],
            ["⏳","Pending",  stats.pending,  "#D97706","#FEF3C7","Pending"],
            ["🔄","Assigned", stats.assigned, "#1D4ED8","#EFF6FF","Assigned"],
            ["✅","Resolved", stats.resolved, "#16A34A","#DCFCE7","Resolved"],
          ].map(([icon, l, v, col, bg, f]) => (
            <div
              key={l}
              onClick={() => setFilter(f)}
              className="sw-card"
              style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", borderLeft:`4px solid ${filter===f?col:"transparent"}`, background:filter===f?bg:"var(--white)", transition:"all 0.18s" }}
            >
              <div style={{ width:46, height:46, borderRadius:13, background:filter===f?"var(--white)":bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:21, flexShrink:0 }}>{icon}</div>
              <div>
                <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:28, color:col, lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginTop:2 }}>{l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH + FILTERS */}
        <div className="anim-fu2" style={{ display:"flex", gap:12, marginBottom:22, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:240, position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:"var(--mutedL)", pointerEvents:"none" }}>🔍</span>
            <input className="sw-input" style={{ paddingLeft:42 }} placeholder="Search by description, location or category…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {["All","Pending","Assigned","Resolved"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:"10px 20px", borderRadius:10, border:`1.5px solid ${filter===f?"var(--teal)":"var(--border)"}`, background:filter===f?"var(--teal)":"var(--white)", color:filter===f?"#fff":"var(--muted)", fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"72px 0", color:"var(--muted)" }}>
            <div style={{ width:44, height:44, borderRadius:"50%", border:"3px solid #EFF6FF", borderTopColor:"#1D4ED8", animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
            <p style={{ fontSize:14 }}>Loading your complaints…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="anim-fu" style={{ textAlign:"center", padding:"90px 0" }}>
            <div style={{ width:80, height:80, borderRadius:22, background:"var(--ivory2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, margin:"0 auto 18px" }}>📭</div>
            <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:22, fontWeight:400, marginBottom:8 }}>No complaints found</h3>
            <p style={{ color:"var(--muted)", fontSize:14.5, marginBottom:26 }}>
              {search ? `No results for "${search}"` : "You haven't submitted any complaints yet"}
            </p>
            <button className="sw-btn-primary" onClick={() => nav("/citizen/submit")} style={{ padding:"12px 28px", fontSize:14 }}>Submit Your First Complaint →</button>
          </div>
        ) : (
          <div className="anim-fu3" style={{ display:"grid", gap:14 }}>
            {filtered.map(c => (
              <div
                key={c._id}
                onClick={() => setSelected(c)}
                className="sw-card"
                style={{ padding:"20px 24px", cursor:"pointer", borderLeft:`4px solid ${sevCol(c.severity)}` }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                    <span className="sw-badge" style={{ background:sevBg(c.severity), color:sevCol(c.severity) }}>{c.severity}</span>
                    <span className="sw-badge" style={{ background:stBg(c.status), color:stCol(c.status) }}>{c.status}</span>
                    <span className="sw-badge" style={{ background:"var(--tealL)", color:"var(--teal)" }}>{c.category}</span>
                    {c.image && <span className="sw-badge" style={{ background:"#EFF6FF", color:"#1D4ED8" }}>📷 Photo</span>}
                    {c.resolutionImage && <span className="sw-badge" style={{ background:"#DCFCE7", color:"#16A34A" }}>✅ Proof</span>}
                  </div>
                  <span style={{ fontSize:20, color:"var(--border2)", lineHeight:1, flexShrink:0 }}>›</span>
                </div>
                <div style={{ fontSize:14.5, fontWeight:600, color:"var(--ink)", marginBottom:7, lineHeight:1.45 }}>{c.description}</div>
                <div style={{ fontSize:12.5, color:"var(--muted)", display:"flex", flexWrap:"wrap", gap:"3px 16px" }}>
                  <span>📍 {c.location}</span>
                  <span>🏢 {c.department}</span>
                  <span>📅 {new Date(c.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span>
                </div>
                <Timeline status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selected && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.55)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20, overflowY:"auto" }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="anim-si" style={{ background:"var(--white)", borderRadius:22, width:"100%", maxWidth:580, boxShadow:"var(--shadow-lg)", border:"1px solid var(--border)", maxHeight:"92vh", overflowY:"auto", margin:"auto" }}>

            {/* Modal header */}
            <div style={{ background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", padding:"22px 28px", position:"relative", overflow:"hidden", borderRadius:"22px 22px 0 0" }}>
              <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
              <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6 }}>Complaint Details</div>
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:20, color:"#fff", fontWeight:400 }}>Filed {new Date(selected.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ width:34, height:34, borderRadius:9, border:"1.5px solid rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
                <span style={{ padding:"5px 13px", borderRadius:20, background:"rgba(255,255,255,0.2)", color:"#fff", fontSize:12, fontWeight:700 }}>{selected.category}</span>
                <span style={{ padding:"5px 13px", borderRadius:20, background:sevBg(selected.severity), color:sevCol(selected.severity), fontSize:12, fontWeight:700 }}>{selected.severity}</span>
                <span style={{ padding:"5px 13px", borderRadius:20, background:stBg(selected.status), color:stCol(selected.status), fontSize:12, fontWeight:700 }}>{selected.status}</span>
              </div>
            </div>

            <div style={{ padding:"26px 28px 30px" }}>
              {/* Timeline */}
              <div style={{ background:"var(--ivory)", borderRadius:13, padding:"14px 18px", border:"1px solid var(--border)", marginBottom:20 }}>
                <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>Progress</div>
                <Timeline status={selected.status} />
              </div>

              {/* Info grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                {[
                  ["Department", selected.department,  "var(--ink2)",  "var(--ivory)"],
                  ["Location",   selected.location,    "var(--muted)", "var(--ivory)"],
                  ["AI Score",   `${Math.round((selected.confidenceScore||0)*100)}%`, "#1D4ED8", "#EFF6FF"],
                  ["Date",       new Date(selected.createdAt).toLocaleDateString("en-IN"), "var(--muted)", "var(--ivory)"],
                ].map(([k, v, col, bg]) => (
                  <div key={k} style={{ background:bg, border:"1px solid var(--border)", borderRadius:11, padding:"12px 14px" }}>
                    <div style={{ fontSize:9.5, color:"var(--mutedL)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{k}</div>
                    <div style={{ fontSize:13.5, fontWeight:700, color:col, lineHeight:1.3, wordBreak:"break-word" }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={{ background:"var(--ivory)", border:"1px solid var(--border)", borderRadius:11, padding:"14px 16px", marginBottom:16 }}>
                <div style={{ fontSize:10, color:"var(--mutedL)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Description</div>
                <div style={{ fontSize:14, color:"var(--ink2)", lineHeight:1.7 }}>{selected.description}</div>
              </div>

              {/* Citizen photo */}
              {selected.image && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:10, color:"#1D4ED8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:9 }}>📷 Your Attached Photo</div>
                  <img src={selected.image} alt="Complaint" style={{ width:"100%", maxHeight:230, objectFit:"cover", borderRadius:12, border:"1.5px solid #BFDBFE", display:"block" }} />
                </div>
              )}

              {/* Resolution remarks */}
              {selected.remarks && (
                <div style={{ background:"#DCFCE7", border:"1.5px solid rgba(22,163,74,0.2)", borderRadius:13, padding:"15px 17px", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
                    <span style={{ fontSize:17 }}>✅</span>
                    <div style={{ fontSize:10, color:"#16A34A", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>Resolution from Department</div>
                  </div>
                  <div style={{ fontSize:14, color:"var(--ink2)", lineHeight:1.65 }}>{selected.remarks}</div>
                </div>
              )}

              {/* Department resolution proof */}
              {selected.resolutionImage && (
                <div style={{ background:"#DCFCE7", border:"1.5px solid rgba(22,163,74,0.25)", borderRadius:13, padding:"15px 17px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <span style={{ fontSize:17 }}>📷</span>
                    <div style={{ fontSize:10, color:"#16A34A", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>Resolution Proof Photo</div>
                  </div>
                  <img src={selected.resolutionImage} alt="Proof" style={{ width:"100%", maxHeight:240, objectFit:"cover", borderRadius:11, border:"1.5px solid rgba(22,163,74,0.3)", display:"block", marginBottom:10 }} />
                  <p style={{ fontSize:12.5, color:"#16A34A", fontWeight:700, textAlign:"center" }}>✅ The department has resolved this complaint and provided visual proof</p>
                </div>
              )}

              <button onClick={() => setSelected(null)} className="sw-btn-ghost" style={{ width:"100%", marginTop:20, padding:"12px" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}