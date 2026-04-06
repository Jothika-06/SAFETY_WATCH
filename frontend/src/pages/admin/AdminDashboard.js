import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllComplaints, getDashboardStats } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const sC   = (s) => s === "High" ? "#DC2626" : s === "Medium" ? "#D97706" : "#16A34A";
const sBg  = (s) => s === "High" ? "#FEE2E2" : s === "Medium" ? "#FEF3C7" : "#DCFCE7";
const stC  = (s) => s === "Resolved" ? "#16A34A" : s === "Assigned" ? "#1D4ED8" : "#D97706";
const stBg = (s) => s === "Resolved" ? "#DCFCE7" : s === "Assigned" ? "#EFF6FF" : "#FEF3C7";

const DEPT_ICONS = {
  "Electrical Department":       { icon:"⚡", color:"#D97706", bg:"#FEF3C7" },
  "Road Maintenance Department": { icon:"🛣️",  color:"#64748B", bg:"#F1F5F9" },
  "Sanitation Department":       { icon:"🧹", color:"#16A34A", bg:"#DCFCE7" },
  "Water Supply Department":     { icon:"💧", color:"#1D4ED8", bg:"#EFF6FF" },
  "Emergency Department":        { icon:"🚨", color:"#DC2626", bg:"#FEE2E2" },
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [tab, setTab]               = useState("overview");
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("All");
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);

  useEffect(() => { fetchData(); }, []);

const fetchData = async () => {
  setLoading(true);
  try {
    const [cRes, sRes] = await Promise.all([
      getAllComplaints(),
      getDashboardStats()
    ]);
    setComplaints(cRes.data.complaints || []);
    setStats(sRes.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  // Apply both status filter AND search
  const filtered = complaints
    .filter(c => filter === "All" || c.status === filter)
    .filter(c => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.description?.toLowerCase().includes(q) ||
        c.userName?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.severity?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
      );
    });

  const categoryData = ["Electrical","Roads","Sanitation","Water Supply","Emergency"].map(cat => ({
    name: cat,
    count: complaints.filter(c => c.category === cat).length,
    color: cat==="Electrical"?"#D97706":cat==="Roads"?"#64748B":cat==="Sanitation"?"#16A34A":cat==="Water Supply"?"#1D4ED8":"#DC2626"
  }));

  const severityData = [
    { name:"High",   count:complaints.filter(c=>c.severity==="High").length,   color:"#DC2626", bg:"#FEE2E2" },
    { name:"Medium", count:complaints.filter(c=>c.severity==="Medium").length, color:"#D97706", bg:"#FEF3C7" },
    { name:"Low",    count:complaints.filter(c=>c.severity==="Low").length,    color:"#16A34A", bg:"#DCFCE7" },
  ];
  const statusData = [
    { name:"Pending",  count:complaints.filter(c=>c.status==="Pending").length,  color:"#D97706", bg:"#FEF3C7" },
    { name:"Assigned", count:complaints.filter(c=>c.status==="Assigned").length, color:"#1D4ED8", bg:"#EFF6FF" },
    { name:"Resolved", count:complaints.filter(c=>c.status==="Resolved").length, color:"#16A34A", bg:"#DCFCE7" },
  ];

  const maxCat = Math.max(...categoryData.map(d => d.count), 1);
  const total  = complaints.length || 1;

  return (
    <div style={{ minHeight:"100vh", background:"#F5F7FF", fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background:"#fff", borderBottom:"1px solid #CBD5E1", padding:"0 36px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, boxShadow:"0 1px 3px rgba(15,23,42,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", display:"flex", alignItems:"center", justifyContent:"center" }}>🛡️</div>
          <span style={{ fontFamily:"'Instrument Serif',serif", fontSize:17, color:"#0F172A" }}>SafetyWatch</span>
          <span style={{ fontSize:11, color:"#64748B", marginLeft:4 }}>Admin Panel</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:13, fontWeight:600, color:"#0F172A" }}>Admin</span>
          <button onClick={() => { logout(); navigate("/login"); }}
            style={{ padding:"7px 16px", borderRadius:8, border:"1.5px solid #1D4ED8", background:"transparent", color:"#1D4ED8", fontWeight:600, fontSize:12, cursor:"pointer" }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 28px" }}>
{/* Header */}
<div style={{ 
  marginBottom:26, 
  paddingBottom:20, 
  borderBottom:"1px solid #E2E8F0",
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center"
}}>

  <div>
    <h2 style={{ margin:"0 0 5px", fontSize:22, fontWeight:800, color:"#0F172A", fontFamily:"'Instrument Serif',serif" }}>
      Admin Dashboard
    </h2>
    <p style={{ margin:0, fontSize:14, color:"#64748B" }}>
      Monitor and manage all public safety complaints
    </p>
  </div>

  <button
    onClick={fetchData}
    style={{
      padding:"8px 16px",
      borderRadius:8,
      border:"1px solid #CBD5E1",
      background:"#F8FAFC",
      cursor:"pointer",
      fontSize:13,
      fontWeight:600
    }}
  >
    🔄 Refresh
  </button>

</div>

        {/* Tab Bar */}
        <div style={{ display:"flex", gap:4, marginBottom:24, background:"#fff", border:"1px solid #CBD5E1", borderRadius:10, padding:5, width:"fit-content", flexWrap:"wrap" }}>
          {[["overview","📊 Overview"],["departments","🏢 Departments"],["analytics","📈 Analytics"],["monitor","🔍 All Complaints"]].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding:"8px 18px", borderRadius:7, border:"none", cursor:"pointer", fontWeight:600, fontSize:13, background:tab===key?"#1D4ED8":"transparent", color:tab===key?"#fff":"#64748B", fontFamily:"inherit" }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color:"#64748B" }}>Loading…</p> : (
          <>
            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
                  {[
                    { icon:"📋", label:"Total Complaints", value:stats?.stats.total,       color:"#1D4ED8", bg:"#EFF6FF", border:"#1D4ED8" },
                    { icon:"⏳", label:"Pending",          value:stats?.stats.pending,      color:"#D97706", bg:"#FEF3C7", border:"#D97706" },
                    { icon:"🔄", label:"Assigned",         value:stats?.stats.assigned,     color:"#1D4ED8", bg:"#EFF6FF", border:"#1D4ED8" },
                    { icon:"✅", label:"Resolved",         value:stats?.stats.resolved,     color:"#16A34A", bg:"#DCFCE7", border:"#16A34A" },
                    { icon:"🚨", label:"High Severity",    value:stats?.stats.highSeverity, color:"#DC2626", bg:"#FEE2E2", border:"#DC2626" },
                    { icon:"👥", label:"Total Citizens",   value:stats?.stats.totalUsers,   color:"#1D4ED8", bg:"#EFF6FF", border:"#1D4ED8" },
                  ].map(card => (
                    <div key={card.label} style={{ background:"#fff", border:"1px solid #CBD5E1", borderTop:`3px solid ${card.border}`, borderRadius:12, padding:20, display:"flex", alignItems:"center", gap:14, boxShadow:"0 1px 4px rgba(15,23,42,0.06)" }}>
                      <div style={{ width:46, height:46, borderRadius:10, background:card.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{card.icon}</div>
                      <div>
                        <div style={{ fontSize:24, fontWeight:800, color:card.color }}>{card.value ?? 0}</div>
                        <div style={{ fontSize:12, color:"#64748B", fontWeight:500 }}>{card.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(15,23,42,0.06)" }}>
                  <div style={{ fontWeight:700, fontSize:15, color:"#0F172A", marginBottom:16, fontFamily:"'Instrument Serif',serif" }}>Recent Complaints</div>
                  <ComplaintsTable data={complaints.slice(0,5)} onSelect={setSelected} />
                </div>
              </>
            )}

            {/* DEPARTMENTS TAB */}
            {tab === "departments" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:16 }}>
                {stats?.byDepartment.map(d => {
                  const info = DEPT_ICONS[d._id] || { icon:"🏢", color:"#1D4ED8", bg:"#EFF6FF" };
                  const resolveRate = d.total > 0 ? Math.round((d.resolved/d.total)*100) : 0;
                  return (
                    <div key={d._id} style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:14, padding:22, boxShadow:"0 1px 4px rgba(15,23,42,0.06)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, paddingBottom:16, borderBottom:"1px solid #E2E8F0" }}>
                        <div style={{ width:44, height:44, borderRadius:10, background:info.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{info.icon}</div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>{d._id}</div>
                          <div style={{ fontSize:12, color:"#64748B" }}>{d.total} total complaints</div>
                        </div>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
                        {[
                          { label:"Assigned", value:d.assigned, color:"#1D4ED8", bg:"#EFF6FF" },
                          { label:"Pending",  value:d.pending,  color:"#D97706", bg:"#FEF3C7" },
                          { label:"Resolved", value:d.resolved, color:"#16A34A", bg:"#DCFCE7" },
                        ].map(s => (
                          <div key={s.label} style={{ background:s.bg, borderRadius:10, padding:"12px 10px", textAlign:"center" }}>
                            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
                            <div style={{ fontSize:11, color:"#64748B", fontWeight:600 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#64748B", marginBottom:6 }}>
                        <span>Resolution Rate</span>
                        <span style={{ fontWeight:700, color:"#16A34A" }}>{resolveRate}%</span>
                      </div>
                      <div style={{ height:7, background:"#E2E8F0", borderRadius:4 }}>
                        <div style={{ height:"100%", width:`${resolveRate}%`, background:"#16A34A", borderRadius:4 }} />
                      </div>
                      {d.high > 0 && (
                        <div style={{ marginTop:12, padding:"8px 12px", background:"#FEE2E2", borderRadius:8, fontSize:12, color:"#DC2626", fontWeight:600 }}>
                          🚨 {d.high} High Priority complaint{d.high>1?"s":""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ANALYTICS TAB */}
            {tab === "analytics" && (
              <div style={{ display:"grid", gap:20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  {/* Category bar */}
                  <div style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:14, padding:24, boxShadow:"0 1px 4px rgba(15,23,42,0.06)" }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"#0F172A", marginBottom:6 }}>AI Category Classification</div>
                    <div style={{ fontSize:12, color:"#64748B", marginBottom:20 }}>Complaints classified by AI per category</div>
                    <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:160, padding:"0 8px" }}>
                      {categoryData.map(d => (
                        <div key={d.name} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:d.color }}>{d.count}</div>
                          <div style={{ width:"100%", background:d.color, borderRadius:"4px 4px 0 0", height:`${(d.count/maxCat)*120}px`, minHeight:d.count>0?8:3, opacity:0.85 }} />
                          <div style={{ fontSize:10, color:"#64748B", textAlign:"center", fontWeight:600, lineHeight:1.3 }}>{d.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Severity */}
                  <div style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:14, padding:24, boxShadow:"0 1px 4px rgba(15,23,42,0.06)" }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"#0F172A", marginBottom:6 }}>AI Severity Prediction</div>
                    <div style={{ fontSize:12, color:"#64748B", marginBottom:20 }}>Severity levels predicted by AI model</div>
                    <div style={{ display:"flex", height:28, borderRadius:8, overflow:"hidden", marginBottom:10 }}>
                      {severityData.map(s => (
                        <div key={s.name} style={{ width:`${(s.count/total)*100}%`, background:s.color, minWidth:s.count>0?4:0 }} />
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
                      {severityData.map(s => (
                        <div key={s.name} style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:10, height:10, borderRadius:2, background:s.color }} />
                          <span style={{ fontSize:12, color:"#64748B" }}>{s.name}</span>
                        </div>
                      ))}
                    </div>
                    {severityData.map(s => (
                      <div key={s.name} style={{ marginBottom:14 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                          <span style={{ color:s.color, fontWeight:700 }}>{s.name}</span>
                          <span style={{ color:"#0F172A", fontWeight:700 }}>{s.count} <span style={{ color:"#94A3B8", fontWeight:400 }}>({Math.round((s.count/total)*100)}%)</span></span>
                        </div>
                        <div style={{ height:8, background:"#E2E8F0", borderRadius:4 }}>
                          <div style={{ height:"100%", width:`${(s.count/total)*100}%`, background:s.color, borderRadius:4 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  {/* Status */}
                  <div style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:14, padding:24, boxShadow:"0 1px 4px rgba(15,23,42,0.06)" }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"#0F172A", marginBottom:6 }}>Complaint Status Flow</div>
                    <div style={{ fontSize:12, color:"#64748B", marginBottom:24 }}>Current distribution across all statuses</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                      {statusData.map(s => (
                        <div key={s.name} style={{ background:s.bg, borderRadius:12, padding:20, textAlign:"center", border:`2px solid ${s.color}20` }}>
                          <div style={{ fontSize:32, fontWeight:800, color:s.color, marginBottom:4 }}>{s.count}</div>
                          <div style={{ fontSize:12, fontWeight:700, color:s.color }}>{s.name}</div>
                          <div style={{ fontSize:11, color:"#94A3B8", marginTop:4 }}>{Math.round((s.count/total)*100)}%</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop:20 }}>
                      <div style={{ display:"flex", height:12, borderRadius:6, overflow:"hidden" }}>
                        {statusData.map(s => (
                          <div key={s.name} title={s.name} style={{ width:`${(s.count/total)*100}%`, background:s.color, minWidth:s.count>0?4:0 }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* AI Confidence */}
                  <div style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:14, padding:24, boxShadow:"0 1px 4px rgba(15,23,42,0.06)" }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"#0F172A", marginBottom:6 }}>AI Model Confidence</div>
                    <div style={{ fontSize:12, color:"#64748B", marginBottom:20 }}>Average prediction confidence per category</div>
                    {categoryData.map(d => {
                      const cats = complaints.filter(c => c.category===d.name);
                      const avg  = cats.length > 0 ? Math.round((cats.reduce((a,c)=>a+(c.confidenceScore||0),0)/cats.length)*100) : 0;
                      return (
                        <div key={d.name} style={{ marginBottom:14 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                            <span style={{ color:"#334155", fontWeight:600 }}>{d.name}</span>
                            <span style={{ color:d.color, fontWeight:700 }}>{cats.length>0?`${avg}%`:"—"}</span>
                          </div>
                          <div style={{ height:8, background:"#E2E8F0", borderRadius:4 }}>
                            <div style={{ height:"100%", width:`${avg}%`, background:d.color, borderRadius:4 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Department Performance */}
                <div style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:14, padding:24, boxShadow:"0 1px 4px rgba(15,23,42,0.06)" }}>
                  <div style={{ fontWeight:700, fontSize:15, color:"#0F172A", marginBottom:6 }}>Department Performance</div>
                  <div style={{ fontSize:12, color:"#64748B", marginBottom:20 }}>Resolution rate per department</div>
                  <div style={{ display:"grid", gap:14 }}>
                    {stats?.byDepartment.map(d => {
                      const info = DEPT_ICONS[d._id] || { icon:"🏢", color:"#1D4ED8", bg:"#EFF6FF" };
                      const rate = d.total>0?Math.round((d.resolved/d.total)*100):0;
                      return (
                        <div key={d._id} style={{ display:"flex", alignItems:"center", gap:16 }}>
                          <div style={{ width:36, height:36, borderRadius:8, background:info.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{info.icon}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                              <span style={{ fontSize:13, fontWeight:600, color:"#0F172A" }}>{d._id?.replace(" Department","")}</span>
                              <span style={{ fontSize:12, color:"#64748B" }}>{d.resolved}/{d.total} resolved · <span style={{ color:rate>=70?"#16A34A":rate>=40?"#D97706":"#DC2626", fontWeight:700 }}>{rate}%</span></span>
                            </div>
                            <div style={{ height:10, background:"#E2E8F0", borderRadius:5 }}>
                              <div style={{ height:"100%", width:`${rate}%`, background:rate>=70?"#16A34A":rate>=40?"#D97706":"#DC2626", borderRadius:5, transition:"width 0.3s" }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MONITOR TAB — with full search */}
            {tab === "monitor" && (
              <div style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(15,23,42,0.06)" }}>
                <div style={{ fontWeight:700, fontSize:16, color:"#0F172A", marginBottom:18, fontFamily:"'Instrument Serif',serif" }}>All Complaints</div>

                {/* Search + Filter row */}
                <div style={{ display:"flex", gap:12, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
                  {/* Search bar */}
                  <div style={{ flex:1, minWidth:240, position:"relative" }}>
                    <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:15, color:"#94A3B8", pointerEvents:"none" }}>🔍</span>
                    <input
                      style={{ width:"100%", padding:"10px 14px 10px 40px", borderRadius:9, border:"1.5px solid #CBD5E1", background:"#F8FAFF", color:"#0F172A", fontSize:13.5, outline:"none", fontFamily:"inherit", boxSizing:"border-box", transition:"border-color 0.2s, box-shadow 0.2s" }}
                      placeholder="Search by citizen, description, category, department, location…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onFocus={e => { e.target.style.borderColor="#1D4ED8"; e.target.style.boxShadow="0 0 0 3px rgba(29,78,216,0.1)"; }}
                      onBlur={e => { e.target.style.borderColor="#CBD5E1"; e.target.style.boxShadow="none"; }}
                    />
                    {search && (
                      <button onClick={() => setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:15, color:"#94A3B8", lineHeight:1 }}>✕</button>
                    )}
                  </div>

                  {/* Status filters */}
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {["All","Pending","Assigned","Resolved"].map(s => (
                      <button key={s} onClick={() => setFilter(s)}
                        style={{ padding:"8px 16px", borderRadius:8, border:`1.5px solid ${filter===s?"#1D4ED8":"#CBD5E1"}`, background:filter===s?"#EFF6FF":"#fff", color:filter===s?"#1D4ED8":"#64748B", fontWeight:600, fontSize:12.5, cursor:"pointer", fontFamily:"inherit" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results count */}
                <div style={{ fontSize:13, color:"#64748B", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontWeight:700, color:"#0F172A" }}>{filtered.length}</span> complaint{filtered.length!==1?"s":""} found
                  {search && <span>for "<strong>{search}</strong>"</span>}
                  {(search||filter!=="All") && (
                    <button onClick={() => { setSearch(""); setFilter("All"); }} style={{ marginLeft:8, padding:"3px 10px", borderRadius:6, border:"1px solid #CBD5E1", background:"#F1F5F9", color:"#475569", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                      Clear filters
                    </button>
                  )}
                </div>

                <ComplaintsTable data={filtered} onSelect={setSelected} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.3)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:24 }}
          onClick={e => e.target===e.currentTarget && setSelected(null)}>
          <div style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:14, padding:32, width:"100%", maxWidth:520, boxShadow:"0 8px 40px rgba(15,23,42,0.12)", maxHeight:"88vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:"#0F172A", fontFamily:"'Instrument Serif',serif" }}>Complaint Details</h3>
              <button onClick={() => setSelected(null)} style={{ background:"#F4F6FA", border:"1px solid #CBD5E1", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:15, color:"#64748B" }}>✕</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {[["Citizen",selected.userName],["Category",selected.category],["Severity",selected.severity],["Department",selected.department],["Status",selected.status],["Date",new Date(selected.createdAt).toLocaleDateString("en-IN")]].map(([k,v]) => (
                <div key={k} style={{ background:"#F8FAFF", borderRadius:8, padding:12 }}>
                  <div style={{ fontSize:10, color:"#64748B", fontWeight:700, marginBottom:4, textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#0F172A" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#F8FAFF", borderRadius:8, padding:14, marginBottom:12 }}>
              <div style={{ fontSize:10, color:"#64748B", fontWeight:700, marginBottom:6, textTransform:"uppercase" }}>Description</div>
              <div style={{ fontSize:14, color:"#334155", lineHeight:1.65 }}>{selected.description}</div>
            </div>
            {selected.image && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, color:"#1D4ED8", fontWeight:700, marginBottom:8, textTransform:"uppercase" }}>📷 Complaint Photo</div>
                <img src={selected.image} alt="Complaint" style={{ width:"100%", maxHeight:200, objectFit:"cover", borderRadius:10, border:"1.5px solid #BFDBFE" }} />
              </div>
            )}
            {selected.remarks && (
              <div style={{ background:"#DCFCE7", borderRadius:8, padding:14, marginBottom:12 }}>
                <div style={{ fontSize:10, color:"#16A34A", fontWeight:700, marginBottom:6, textTransform:"uppercase" }}>Resolution Remarks</div>
                <div style={{ fontSize:14, color:"#334155" }}>{selected.remarks}</div>
              </div>
            )}
            {selected.resolutionImage && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, color:"#16A34A", fontWeight:700, marginBottom:8, textTransform:"uppercase" }}>📷 Resolution Proof</div>
                <img src={selected.resolutionImage} alt="Resolution" style={{ width:"100%", maxHeight:200, objectFit:"cover", borderRadius:10, border:"1.5px solid #BBF7D0" }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ComplaintsTable({ data, onSelect }) {
  if (data.length === 0) return <p style={{ color:"#64748B", fontSize:14, textAlign:"center", padding:"32px 0" }}>No complaints found.</p>;
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:"#F8FAFF" }}>
            {["Citizen","Description","Category","Severity","Department","Status","Date",""].map(h => (
              <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:"#64748B", fontWeight:700, fontSize:11, letterSpacing:0.5, textTransform:"uppercase", borderBottom:"2px solid #CBD5E1" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((c,i) => (
            <tr key={c._id} style={{ borderBottom:"1px solid #E2E8F0", background:i%2===0?"#fff":"#F8FAFF" }}
              onMouseOver={e => e.currentTarget.style.background="#EFF6FF"}
              onMouseOut={e => e.currentTarget.style.background=i%2===0?"#fff":"#F8FAFF"}
            >
              <td style={{ padding:"11px 14px", color:"#0F172A", fontWeight:600 }}>{c.userName}</td>
              <td style={{ padding:"11px 14px", color:"#334155", maxWidth:180 }}>{c.description}</td>
              <td style={{ padding:"11px 14px", color:"#334155" }}>{c.category}</td>
              <td style={{ padding:"11px 14px" }}><span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:sBg(c.severity), color:sC(c.severity) }}>{c.severity}</span></td>
              <td style={{ padding:"11px 14px", color:"#334155", fontSize:12 }}>{c.department}</td>
              <td style={{ padding:"11px 14px" }}><span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:stBg(c.status), color:stC(c.status) }}>{c.status}</span></td>
              <td style={{ padding:"11px 14px", color:"#64748B" }}>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
              <td style={{ padding:"11px 14px" }}><button onClick={() => onSelect(c)} style={{ padding:"5px 12px", borderRadius:7, border:"1.5px solid #1D4ED8", background:"transparent", color:"#1D4ED8", fontWeight:600, fontSize:12, cursor:"pointer" }}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}