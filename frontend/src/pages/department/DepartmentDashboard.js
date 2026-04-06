import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartmentComplaints, resolveComplaint } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const sevCol = s => s==="High"?"#DC2626":s==="Medium"?"#D97706":"#16A34A";
const sevBg  = s => s==="High"?"#FEE2E2":s==="Medium"?"#FEF3C7":"#DCFCE7";
const stCol  = s => s==="Resolved"?"#16A34A":s==="Assigned"?"#1D4ED8":"#D97706";
const stBg   = s => s==="Resolved"?"#DCFCE7":s==="Assigned"?"#EFF6FF":"#FEF3C7";

export default function DepartmentDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const fileRef = useRef();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(null);
  const [remarks, setRemarks]     = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [resImg, setResImg]       = useState(null);
  const [resPrev, setResPrev]     = useState(null);
  const [resDrag, setResDrag]     = useState(false);

  useEffect(() => { fetchC(); }, []);

  const fetchC = async () => {
    try {
      setFetchError("");
      const r = await getDepartmentComplaints();
      setComplaints(r.data.complaints || []);
    } catch (e) {
      console.error("Fetch error:", e);
      setFetchError(e.response?.data?.message || "Failed to load complaints. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const processResFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }
    const r = new FileReader();
    r.onloadend = () => { setResImg(r.result); setResPrev(r.result); };
    r.readAsDataURL(file);
  };

  const clearResImg = () => {
    setResImg(null); setResPrev(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const doResolve = async () => {
    if (!remarks.trim()) {
      setResolveError("Resolution remarks are required.");
      return;
    }
    setResolveError("");
    setResolving(true);
    try {
      const payload = { remarks };
      if (resImg) payload.resolutionImage = resImg;

      await resolveComplaint(selected._id, payload);

      // Update local state immediately so counts refresh
      setComplaints(prev =>
        prev.map(c =>
          c._id === selected._id
            ? { ...c, status:"Resolved", remarks, resolutionImage: resImg || c.resolutionImage, resolvedAt: new Date().toISOString() }
            : c
        )
      );
      setSelected(null);
      setRemarks("");
      clearResImg();
    } catch (e) {
      console.error("Resolve error:", e);
      setResolveError(e.response?.data?.message || "Failed to resolve complaint. Please try again.");
    } finally {
      setResolving(false);
    }
  };

  const openModal = (c) => {
    setSelected(c);
    setRemarks(c.remarks || "");
    setResImg(null);
    setResPrev(null);
    setResolveError("");
  };

  // Hotspot detection: same location + category with 2+ unresolved
  const hotspots = Object.entries(
    complaints
      .filter(c => c.status !== "Resolved")
      .reduce((a, c) => {
        const k = `${c.location}|${c.category}`;
        a[k] = a[k] || [];
        a[k].push(c);
        return a;
      }, {})
  ).filter(([, v]) => v.length >= 2);

  const filtered = complaints
    .filter(c => filter === "All" || c.severity === filter || c.status === filter)
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.description?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.userName?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => ({ High:0, Medium:1, Low:2 }[a.severity] - { High:0, Medium:1, Low:2 }[b.severity]));

  const active   = complaints.filter(c => c.status !== "Resolved").length;
  const highP    = complaints.filter(c => c.severity === "High").length;
  const pending  = complaints.filter(c => c.status === "Pending").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;

  return (
    <div className="sw-page">
      {/* NAV */}
      <nav className="sw-nav">
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, boxShadow:"0 3px 14px rgba(29,78,216,0.3)" }}>🛡️</div>
          <div>
            <span style={{ fontFamily:"'Instrument Serif',serif", fontSize:18, color:"var(--ink)" }}>SafetyWatch</span>
            <span style={{ fontSize:10, color:"var(--teal)", fontWeight:700, marginLeft:8, letterSpacing:"0.08em", textTransform:"uppercase", background:"var(--tealL)", padding:"2px 8px", borderRadius:20 }}>Gov Portal</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ padding:"6px 14px", borderRadius:20, background:"var(--tealL)", border:"1.5px solid rgba(29,78,216,0.2)", display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#16A34A", display:"inline-block", animation:"ping 2s infinite" }} />
            <span style={{ fontSize:12.5, color:"var(--teal)", fontWeight:700 }}>{user?.department || "Department"}</span>
          </div>
          {hotspots.length > 0 && (
            <div style={{ padding:"6px 12px", borderRadius:20, background:"#FEE2E2", border:"1.5px solid rgba(220,38,38,0.25)", display:"flex", alignItems:"center", gap:6 }}>
              <span>🚨</span>
              <span style={{ fontSize:12, color:"#DC2626", fontWeight:700 }}>{hotspots.length} Hotspot{hotspots.length > 1 ? "s" : ""}</span>
            </div>
          )}
          <button className="sw-btn-ghost" onClick={() => { logout(); nav("/login"); }} style={{ padding:"7px 16px", fontSize:12.5 }}>Logout</button>
        </div>
      </nav>

      <div className="sw-content">
        {/* HEADER */}
        <div className="anim-fu" style={{ marginBottom:26 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <div style={{ width:4, height:30, borderRadius:2, background:"var(--teal)" }} />
            <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:30, fontWeight:400 }}>{user?.department || "Department Dashboard"}</h2>
          </div>
          <p style={{ fontSize:14.5, color:"var(--muted)", paddingLeft:12 }}>Review and resolve complaints assigned to your department</p>
        </div>

        {/* Fetch error */}
        {fetchError && (
          <div style={{ padding:"12px 18px", borderRadius:10, background:"#FEE2E2", border:"1.5px solid rgba(220,38,38,0.3)", color:"#DC2626", fontSize:13.5, marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            ⚠️ {fetchError}
            <button onClick={fetchC} style={{ marginLeft:"auto", padding:"5px 14px", borderRadius:8, border:"1.5px solid #DC2626", background:"transparent", color:"#DC2626", fontWeight:700, fontSize:12, cursor:"pointer" }}>Retry</button>
          </div>
        )}

        {/* HOTSPOT ALERT */}
        {hotspots.length > 0 && (
          <div className="anim-fu" style={{ marginBottom:24, borderRadius:16, overflow:"hidden", boxShadow:"0 4px 18px rgba(220,38,38,0.12)" }}>
            <div style={{ background:"#DC2626", padding:"14px 22px", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:22 }}>🚨</span>
              <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:17, fontWeight:400, color:"#fff" }}>Complaint Hotspot Alert — Urgent Action Required</div>
            </div>
            <div style={{ background:"#FEE2E2", padding:"16px 22px", border:"1.5px solid rgba(220,38,38,0.25)", borderTop:"none", borderRadius:"0 0 16px 16px" }}>
              <div style={{ display:"grid", gap:8 }}>
                {hotspots.map(([key, items]) => {
                  const [loc, cat] = key.split("|");
                  return (
                    <div key={key} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.18)" }}>
                      <span style={{ fontWeight:800, fontSize:16, color:"#DC2626", minWidth:26 }}>{items.length}×</span>
                      <span className="sw-badge" style={{ background:"#DC2626", color:"#fff", fontSize:11 }}>{cat}</span>
                      <span style={{ fontSize:13.5, color:"#7F1D1D" }}>📍 {loc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="anim-fu1" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
          {[
            ["📋","Active Cases", active,   "#1D4ED8","#EFF6FF"],
            ["🚨","High Priority",highP,   "#DC2626","#FEE2E2"],
            ["⏳","Pending",      pending,  "#D97706","#FEF3C7"],
            ["✅","Resolved",     resolved, "#16A34A","#DCFCE7"],
          ].map(([icon, l, v, col, bg]) => (
            <div key={l} className="sw-card" style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14, borderTop:`3px solid ${col}` }}>
              <div style={{ width:46, height:46, borderRadius:13, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:21, flexShrink:0 }}>{icon}</div>
              <div>
                <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:28, color:col, lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginTop:2 }}>{l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH + FILTER */}
        <div style={{ display:"flex", gap:12, marginBottom:18, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:220, position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:"var(--mutedL)", pointerEvents:"none" }}>🔍</span>
            <input className="sw-input" style={{ paddingLeft:42 }} placeholder="Search by description, citizen or location…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {["All","High","Medium","Low","Pending","Assigned","Resolved"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${filter===f?"var(--teal)":"var(--border)"}`, background:filter===f?"var(--teal)":"var(--white)", color:filter===f?"#fff":"var(--muted)", fontWeight:700, fontSize:12.5, cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* COMPLAINT LIST */}
        <div className="anim-fu2 sw-card" style={{ padding:26 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:21, fontWeight:400 }}>Assigned Complaints</h3>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12.5, color:"var(--muted)", background:"var(--ivory2)", padding:"4px 14px", borderRadius:20, fontWeight:700, border:"1px solid var(--border)" }}>{filtered.length} cases</span>
              <button onClick={fetchC} style={{ padding:"5px 14px", borderRadius:8, border:"1.5px solid var(--border)", background:"transparent", color:"var(--muted)", fontWeight:600, fontSize:12, cursor:"pointer" }}>🔄 Refresh</button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:"44px 0" }}>
              <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid #EFF6FF", borderTopColor:"#1D4ED8", animation:"spin 1s linear infinite", margin:"0 auto 14px" }} />
              <p style={{ color:"var(--muted)", fontSize:14 }}>Loading complaints…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"52px 0" }}>
              <div style={{ fontSize:44, marginBottom:12 }}>📭</div>
              <p style={{ color:"var(--muted)", fontSize:14, fontWeight:500 }}>
                {complaints.length === 0 ? "No complaints assigned to your department yet" : "No complaints match this filter"}
              </p>
            </div>
          ) : (
            <div style={{ display:"grid", gap:12 }}>
              {filtered.map(c => {
                const isHot = hotspots.some(([k]) => k === `${c.location}|${c.category}`);
                return (
                  <div key={c._id}
                    onClick={() => openModal(c)}
                    style={{ borderRadius:13, padding:"16px 20px", border:`1.5px solid ${isHot?"rgba(220,38,38,0.3)":"var(--border)"}`, borderLeft:`4px solid ${sevCol(c.severity)}`, background:isHot?"rgba(220,38,38,0.03)":"var(--ivory)", cursor:"pointer", transition:"all 0.18s", display:"flex", alignItems:"center", gap:14 }}
                    onMouseOver={e => { e.currentTarget.style.boxShadow="var(--shadow)"; e.currentTarget.style.transform="translateX(4px)"; e.currentTarget.style.background=isHot?"rgba(220,38,38,0.06)":"var(--white)"; }}
                    onMouseOut={e => { e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="translateX(0)"; e.currentTarget.style.background=isHot?"rgba(220,38,38,0.03)":"var(--ivory)"; }}
                  >
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:7, marginBottom:8, flexWrap:"wrap" }}>
                        <span className="sw-badge" style={{ background:sevBg(c.severity), color:sevCol(c.severity) }}>{c.severity}</span>
                        <span className="sw-badge" style={{ background:stBg(c.status), color:stCol(c.status) }}>{c.status}</span>
                        {c.image && <span className="sw-badge" style={{ background:"#EFF6FF", color:"#1D4ED8" }}>📷 Photo</span>}
                        {c.resolutionImage && <span className="sw-badge" style={{ background:"#DCFCE7", color:"#16A34A" }}>✅ Proof</span>}
                        {isHot && <span className="sw-badge" style={{ background:"#DC2626", color:"#fff" }}>🚨 Hotspot</span>}
                      </div>
                      <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)", marginBottom:5, lineHeight:1.4 }}>{c.description}</div>
                      <div style={{ fontSize:12.5, color:"var(--muted)", display:"flex", flexWrap:"wrap", gap:"3px 14px" }}>
                        <span>📍 {c.location}</span>
                        <span>👤 {c.userName}</span>
                        <span>📅 {new Date(c.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); openModal(c); }}
                      style={{ padding:"9px 20px", borderRadius:10, border: c.status==="Resolved" ? "1.5px solid var(--border)" : "none", background: c.status==="Resolved" ? "var(--white)" : "var(--teal)", color: c.status==="Resolved" ? "var(--muted)" : "#fff", fontWeight:700, fontSize:13, cursor:"pointer", flexShrink:0, fontFamily:"inherit", transition:"all 0.18s", boxShadow: c.status==="Resolved" ? "none" : "0 4px 14px rgba(29,78,216,0.28)" }}
                    >
                      {c.status === "Resolved" ? "View Details" : "Resolve →"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ MODAL ══ */}
      {selected && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.55)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20, overflowY:"auto" }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="anim-si" style={{ background:"var(--white)", borderRadius:22, width:"100%", maxWidth:580, boxShadow:"var(--shadow-lg)", border:"1px solid var(--border)", maxHeight:"92vh", overflowY:"auto", margin:"auto" }}>

            {/* Modal header */}
            <div style={{ background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", padding:"22px 28px", position:"relative", overflow:"hidden", borderRadius:"22px 22px 0 0" }}>
              <div style={{ position:"absolute", top:-25, right:-25, width:110, height:110, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
              <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.7)", fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:5 }}>Complaint Details</div>
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:20, color:"#fff", fontWeight:400 }}>Filed {new Date(selected.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ width:34, height:34, borderRadius:9, border:"1.5px solid rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                <span style={{ padding:"4px 12px", borderRadius:20, background:"rgba(255,255,255,0.2)", color:"#fff", fontSize:12, fontWeight:700 }}>{selected.category}</span>
                <span style={{ padding:"4px 12px", borderRadius:20, background:sevBg(selected.severity), color:sevCol(selected.severity), fontSize:12, fontWeight:700 }}>{selected.severity}</span>
                <span style={{ padding:"4px 12px", borderRadius:20, background:stBg(selected.status), color:stCol(selected.status), fontSize:12, fontWeight:700 }}>{selected.status}</span>
              </div>
            </div>

            <div style={{ padding:"26px 28px 30px" }}>
              {/* Info grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                {[
                  ["Citizen",   selected.userName,   "var(--ink2)",         "var(--ivory)"],
                  ["Location",  selected.location,   "var(--muted)",        "var(--ivory)"],
                  ["Category",  selected.category,   "var(--teal)",         "var(--tealL)"],
                  ["Status",    selected.status,     stCol(selected.status), stBg(selected.status)],
                  ["Severity",  selected.severity,   sevCol(selected.severity), sevBg(selected.severity)],
                  ["Date",      new Date(selected.createdAt).toLocaleDateString("en-IN"), "var(--muted)", "var(--ivory)"],
                ].map(([k, v, col, bg]) => (
                  <div key={k} style={{ background:bg, border:"1px solid var(--border)", borderRadius:11, padding:"11px 14px" }}>
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
                  <div style={{ fontSize:10, color:"#1D4ED8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:9 }}>📷 Citizen's Complaint Photo</div>
                  <img src={selected.image} alt="Complaint" style={{ width:"100%", maxHeight:220, objectFit:"cover", borderRadius:12, border:"1.5px solid #BFDBFE", display:"block" }} />
                </div>
              )}

              {/* ── RESOLVED VIEW ── */}
              {selected.status === "Resolved" ? (
                <>
                  <div style={{ background:"#DCFCE7", border:"1.5px solid rgba(22,163,74,0.2)", borderRadius:13, padding:"15px 17px", marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
                      <span>✅</span>
                      <div style={{ fontSize:10, color:"#16A34A", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>Resolution Remarks</div>
                    </div>
                    <div style={{ fontSize:14, color:"var(--ink2)", lineHeight:1.65 }}>{selected.remarks}</div>
                  </div>
                  {selected.resolutionImage && (
                    <div>
                      <div style={{ fontSize:10, color:"#16A34A", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:9 }}>📷 Resolution Proof Photo</div>
                      <img src={selected.resolutionImage} alt="Proof" style={{ width:"100%", maxHeight:230, objectFit:"cover", borderRadius:12, border:"1.5px solid rgba(22,163,74,0.3)", display:"block" }} />
                    </div>
                  )}
                  <button onClick={() => setSelected(null)} className="sw-btn-ghost" style={{ width:"100%", marginTop:20, padding:"13px" }}>Close</button>
                </>
              ) : (
                /* ── RESOLVE FORM ── */
                <div style={{ borderTop:"1.5px dashed var(--border)", paddingTop:22 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📝</div>
                    <span style={{ fontSize:15, fontWeight:700, color:"var(--ink)" }}>Mark as Resolved</span>
                  </div>

                  <label style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Resolution Remarks *</label>
                  <textarea
                    className="sw-input"
                    style={{ height:100, resize:"vertical", marginBottom:6, lineHeight:1.65 }}
                    placeholder="Describe steps taken, who was involved, when it was fixed…"
                    value={remarks}
                    onChange={e => { setRemarks(e.target.value); if(resolveError) setResolveError(""); }}
                  />
                  <div style={{ fontSize:12, color:"var(--mutedL)", marginBottom:18 }}>{remarks.length} characters{remarks.length < 10 && remarks.length > 0 ? " — please add more detail" : ""}</div>

                  <label style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:8 }}>
                    Resolution Proof Photo <span style={{ fontSize:10.5, color:"var(--mutedL)", fontWeight:400, marginLeft:6, textTransform:"none", letterSpacing:"normal" }}>optional</span>
                  </label>

                  {!resPrev ? (
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setResDrag(true); }}
                      onDragLeave={() => setResDrag(false)}
                      onDrop={e => { e.preventDefault(); setResDrag(false); processResFile(e.dataTransfer.files[0]); }}
                      style={{ border:`2px dashed ${resDrag?"var(--teal)":"var(--border)"}`, borderRadius:12, padding:"26px", textAlign:"center", cursor:"pointer", background:resDrag?"var(--tealL)":"var(--ivory)", transition:"all 0.18s", marginBottom:18 }}
                      onMouseOver={e => { e.currentTarget.style.borderColor="var(--teal)"; e.currentTarget.style.background="var(--tealL)"; }}
                      onMouseOut={e => { if(!resDrag){ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--ivory)"; }}}
                    >
                      <div style={{ fontSize:26, marginBottom:8 }}>📷</div>
                      <div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)", marginBottom:4 }}>Upload resolution proof photo</div>
                      <div style={{ fontSize:12.5, color:"var(--muted)" }}>Drag & drop or click · JPG/PNG · max 5 MB</div>
                    </div>
                  ) : (
                    <div style={{ borderRadius:12, overflow:"hidden", border:"1.5px solid #16A34A", marginBottom:18 }}>
                      <img src={resPrev} alt="Preview" style={{ width:"100%", maxHeight:170, objectFit:"cover", display:"block" }} />
                      <div style={{ background:"#DCFCE7", padding:"10px 15px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <span>✅</span>
                          <span style={{ fontSize:13, color:"#16A34A", fontWeight:700 }}>Proof photo attached</span>
                        </div>
                        <button onClick={clearResImg} style={{ fontSize:12, color:"#DC2626", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700, padding:"3px 8px", borderRadius:6 }}>Remove</button>
                      </div>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => processResFile(e.target.files[0])} />

                  {/* Resolve error */}
                  {resolveError && (
                    <div style={{ padding:"11px 16px", borderRadius:10, background:"#FEE2E2", border:"1.5px solid rgba(220,38,38,0.3)", color:"#DC2626", fontSize:13, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                      ⚠️ {resolveError}
                    </div>
                  )}

                  <button
                    onClick={doResolve}
                    disabled={resolving || !remarks.trim()}
                    style={{ width:"100%", padding:"15px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#16A34A,#15803D)", color:"#fff", fontWeight:700, fontSize:15, cursor: resolving || !remarks.trim() ? "not-allowed" : "pointer", fontFamily:"inherit", transition:"all 0.18s", boxShadow:"0 6px 22px rgba(22,163,74,0.3)", opacity: resolving || !remarks.trim() ? 0.65 : 1, letterSpacing:"0.01em" }}
                  >
                    {resolving ? (
                      <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
                        <span style={{ width:16, height:16, border:"2.5px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />
                        Resolving…
                      </span>
                    ) : "✓ Mark as Resolved"}
                  </button>
                  <p style={{ textAlign:"center", fontSize:12, color:"var(--mutedL)", marginTop:10 }}>The citizen will be notified of the resolution immediately</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}