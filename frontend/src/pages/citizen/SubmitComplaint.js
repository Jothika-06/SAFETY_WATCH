import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { submitComplaint } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const sevColor = s => s==="High"?"#DC2626":s==="Medium"?"#D97706":"#16A34A";
const sevBg    = s => s==="High"?"#FEE2E2":s==="Medium"?"#FEF3C7":"#DCFCE7";

export default function SubmitComplaint() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const fileRef = useRef();

  const [form, setForm]         = useState({ location:"", description:"" });
  const [image, setImage]       = useState(null);
  const [imgPrev, setImgPrev]   = useState(null);
  const [imgName, setImgName]   = useState("");
  const [result, setResult]     = useState(null);
  const [err, setErr]           = useState("");
  const [stage, setStage]       = useState("form");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) { setErr("Please select a valid image (JPG, PNG, WEBP)."); return; }
    if (file.size > 5 * 1024 * 1024) { setErr("Image must be smaller than 5 MB."); return; }
    setErr("");
    setImgName(file.name);
    const r = new FileReader();
    r.onloadend = () => { setImage(r.result); setImgPrev(r.result); };
    r.readAsDataURL(file);
  };

  const removeImg = () => {
    setImage(null); setImgPrev(null); setImgName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const fetchGPS = () => {
    if (!navigator.geolocation) { setErr("Geolocation not supported by this browser."); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const d = await res.json();
          setForm(f => ({ ...f, location: d.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
        } catch {
          setForm(f => ({ ...f, location:`${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
        }
        setGpsLoading(false);
      },
      (e) => {
        setGpsLoading(false);
        setErr(e.code === e.PERMISSION_DENIED ? "Location access denied. Please type your location." : "Could not detect location. Please enter manually.");
      },
      { timeout:10000, maximumAge:60000 }
    );
  };

  const handleSubmit = async () => {
    if (!form.location.trim()) return setErr("Please enter the location of the issue.");
    if (!form.description.trim()) return setErr("Please describe the issue.");
    if (form.description.trim().length < 10) return setErr("Description too short. Please provide at least 10 characters.");
    setErr(""); setStage("analyzing");
    try {
      const res = await submitComplaint({ ...form, image });
      setResult(res.data.complaint);
      setStage("done");
    } catch (e) {
      setErr(e.response?.data?.message || "Submission failed. Please try again.");
      setStage("form");
    }
  };

  const inputStyle = {
    width:"100%", padding:"12px 15px", borderRadius:10,
    border:"1.5px solid #CBD5E1", background:"#fff",
    color:"#0F172A", fontSize:14, outline:"none",
    transition:"border-color 0.2s, box-shadow 0.2s", boxSizing:"border-box",
    fontFamily:"inherit",
  };
  const focusIn  = e => { e.target.style.borderColor="#1D4ED8"; e.target.style.boxShadow="0 0 0 3px rgba(29,78,216,0.12)"; };
  const focusOut = e => { e.target.style.borderColor="#CBD5E1"; e.target.style.boxShadow="none"; };

  return (
    <div style={{ minHeight:"100vh", background:"#F5F7FF", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* NAV */}
      <nav style={{ background:"rgba(255,255,255,0.95)", backdropFilter:"blur(18px)", borderBottom:"1px solid #CBD5E1", position:"sticky", top:0, zIndex:100, padding:"0 36px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, boxShadow:"0 1px 0 #CBD5E1, 0 2px 8px rgba(15,23,42,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, boxShadow:"0 3px 14px rgba(29,78,216,0.3)" }}>🛡️</div>
          <div>
            <span style={{ fontFamily:"'Instrument Serif',serif", fontSize:18, color:"#0F172A" }}>SafetyWatch</span>
            <span style={{ fontSize:10, color:"#1D4ED8", fontWeight:700, marginLeft:8, letterSpacing:"0.08em", textTransform:"uppercase", background:"#EFF6FF", padding:"2px 8px", borderRadius:20 }}>Citizen Portal</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ padding:"5px 14px", borderRadius:20, background:"#F1F5F9", border:"1px solid #CBD5E1", fontSize:12.5, color:"#475569" }}>
            Hello, <strong style={{ color:"#0F172A" }}>{user?.name}</strong>
          </div>
          <button onClick={() => nav("/citizen")} style={{ padding:"7px 16px", borderRadius:10, border:"1.5px solid #CBD5E1", background:"transparent", color:"#475569", fontWeight:600, fontSize:12.5, cursor:"pointer" }}>← Dashboard</button>
          <button onClick={() => { logout(); nav("/login"); }} style={{ padding:"7px 16px", borderRadius:10, border:"1.5px solid #CBD5E1", background:"transparent", color:"#475569", fontWeight:600, fontSize:12.5, cursor:"pointer" }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth:660, margin:"0 auto", padding:"44px 28px 80px" }}>

        {/* ANALYZING */}
        {stage === "analyzing" && (
          <div style={{ textAlign:"center", padding:"90px 0" }}>
            <div style={{ position:"relative", width:90, height:90, margin:"0 auto 30px" }}>
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid #EFF6FF" }} />
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid #1D4ED8", borderTopColor:"transparent", animation:"spin 1s linear infinite" }} />
              <div style={{ position:"absolute", inset:9, borderRadius:"50%", background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30 }}>🤖</div>
            </div>
            <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:28, fontWeight:400, marginBottom:10, color:"#0F172A" }}>AI is Analyzing Your Report</h2>
            <p style={{ fontSize:14.5, color:"#475569", marginBottom:32 }}>Classifying category and predicting severity using Naive Bayes + TF-IDF…</p>
            <div style={{ height:4, borderRadius:2, background:"#E2E8F0", maxWidth:200, margin:"0 auto", overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:2, background:"linear-gradient(90deg,#1D4ED8,#60A5FA,#1D4ED8)", backgroundSize:"400px 100%", animation:"shimmer 1.3s infinite" }} />
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {stage === "done" && result && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", borderRadius:20, padding:"30px 32px", marginBottom:22, color:"#fff", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-30, right:-30, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>✅</div>
                  <div>
                    <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:26, fontWeight:400, color:"#fff", marginBottom:3 }}>Complaint Submitted!</h2>
                    <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.78)" }}>AI has classified and routed it to the correct department</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {[["📍",result.location],["🏢",result.department],["📅",new Date(result.createdAt||Date.now()).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})]].map(([icon,v]) => (
                    <div key={v} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, background:"rgba(255,255,255,0.15)", fontSize:12.5, color:"rgba(255,255,255,0.9)" }}>
                      {icon} {v?.length>35?v.slice(0,35)+"…":v}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #CBD5E1", padding:"24px 26px", marginBottom:20 }}>
              <div style={{ fontSize:11, color:"#1D4ED8", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:16, paddingBottom:12, borderBottom:"1px solid #E2E8F0" }}>🤖 AI Classification Results</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                {[
                  ["Category",   result.category,   "#1D4ED8","#EFF6FF"],
                  ["Severity",   result.severity,   sevColor(result.severity), sevBg(result.severity)],
                  ["AI Score",   `${Math.round((result.confidenceScore||0)*100)}%`, "#1D4ED8","#EFF6FF"],
                  ["Status",     result.status,     "#16A34A","#DCFCE7"],
                  ["Department", result.department, "#0F172A","#F8FAFF"],
                  ["Location",   result.location,   "#475569","#F8FAFF"],
                ].map(([k,v,col,bg]) => (
                  <div key={k} style={{ background:bg, borderRadius:12, padding:"13px 14px", border:"1px solid #E2E8F0" }}>
                    <div style={{ fontSize:9.5, color:"#94A3B8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>{k}</div>
                    <div style={{ fontSize:13.5, fontWeight:700, color:col, lineHeight:1.3, wordBreak:"break-word" }}>{v?.length>28?v.slice(0,28)+"…":v}</div>
                  </div>
                ))}
              </div>
              {result.image && (
                <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid #E2E8F0" }}>
                  <div style={{ fontSize:10, color:"#1D4ED8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>📷 Attached Photo</div>
                  <img src={result.image} alt="Complaint" style={{ width:"100%", maxHeight:220, objectFit:"cover", borderRadius:12, border:"1.5px solid #BFDBFE" }} />
                </div>
              )}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <button onClick={() => { setStage("form"); setForm({location:"",description:""}); setResult(null); removeImg(); }}
                style={{ padding:"13px", fontSize:14, borderRadius:10, border:"1.5px solid #CBD5E1", background:"#fff", color:"#475569", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                Submit Another
              </button>
              <button onClick={() => nav("/citizen/history")}
                style={{ padding:"13px", fontSize:14, borderRadius:10, border:"none", background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", color:"#fff", fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 14px rgba(29,78,216,0.28)" }}>
                View My Complaints →
              </button>
            </div>
          </div>
        )}

        {/* FORM */}
        {stage === "form" && (
          <div>
            <div style={{ marginBottom:36 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div style={{ width:4, height:34, borderRadius:2, background:"#1D4ED8" }} />
                <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:34, fontWeight:400, color:"#0F172A" }}>Submit a Complaint</h2>
              </div>
              <p style={{ fontSize:15, color:"#334155", lineHeight:1.7, paddingLeft:12 }}>
                Our AI instantly classifies and routes your complaint to the correct government authority
              </p>
            </div>

            <div style={{ display:"grid", gap:28 }}>

              {/* LOCATION */}
              <div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:13, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:5 }}>Location *</div>
                  <div style={{ fontSize:13.5, color:"#334155" }}>We'll use this to identify the exact problem area</div>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ flex:1, position:"relative" }}>
                    <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none", color:"#94A3B8" }}>📍</span>
                    <input
                      style={{ ...inputStyle, paddingLeft:44 }}
                      placeholder="e.g. MG Road, Near Bus Stand, Coimbatore"
                      value={form.location}
                      onChange={e => setForm({...form, location:e.target.value})}
                      onFocus={focusIn} onBlur={focusOut}
                    />
                  </div>
                  <button onClick={fetchGPS} disabled={gpsLoading}
                    style={{ padding:"0 18px", minWidth:148, borderRadius:10, border:"1.5px solid #1D4ED8", background:gpsLoading?"#F1F5F9":"#fff", color:"#1D4ED8", fontWeight:700, fontSize:13, cursor:gpsLoading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, flexShrink:0, fontFamily:"inherit", transition:"all 0.18s" }}
                    onMouseOver={e => { if(!gpsLoading){ e.currentTarget.style.background="#1D4ED8"; e.currentTarget.style.color="#fff"; }}}
                    onMouseOut={e => { if(!gpsLoading){ e.currentTarget.style.background="#fff"; e.currentTarget.style.color="#1D4ED8"; }}}
                  >
                    {gpsLoading ? <><span style={{width:13,height:13,border:"2px solid #1D4ED8",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.8s linear infinite"}}/>Locating…</> : <>📍 Current Location</>}
                  </button>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:13, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:5 }}>Description *</div>
                  <div style={{ fontSize:13.5, color:"#334155" }}>Be specific — the AI uses your text to classify correctly</div>
                </div>
                <textarea
                  style={{ ...inputStyle, height:148, resize:"vertical", lineHeight:1.7 }}
                  placeholder="e.g. Street light not working near Bus Stand causing safety hazards at night. This has been happening for 3 days and several vehicles have had near-misses…"
                  value={form.description}
                  onChange={e => setForm({...form, description:e.target.value})}
                  onFocus={focusIn} onBlur={focusOut}
                />
                <div style={{ marginTop:7, display:"flex", justifyContent:"space-between" }}>
                  <div style={{ fontSize:12.5, color:"#64748B" }}>More detail improves AI accuracy</div>
                  <div style={{ fontSize:12.5, fontWeight:700, color: form.description.length===0?"#94A3B8":form.description.length<20?"#DC2626":form.description.length<60?"#D97706":"#16A34A" }}>
                    {form.description.length > 0 && <span>{form.description.length<20?"Too short — ":form.description.length<60?"Decent — ":"Great — "}</span>}
                    {form.description.length} chars
                  </div>
                </div>
              </div>

              {/* IMAGE UPLOAD */}
              <div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:13, color:"#0F172A", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:5 }}>Attach Photo</div>
                  <div style={{ fontSize:13.5, color:"#334155" }}>Help authorities understand the issue with a photo (optional · max 5 MB)</div>
                </div>
                {!imgPrev ? (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileRef.current?.click()}
                    style={{ border:`2px dashed ${dragging?"#1D4ED8":"#CBD5E1"}`, borderRadius:14, padding:"44px 24px", textAlign:"center", cursor:"pointer", background:dragging?"#EFF6FF":"#fff", transition:"all 0.2s" }}
                    onMouseOver={e => { if(!dragging){ e.currentTarget.style.borderColor="#1D4ED8"; e.currentTarget.style.background="#EFF6FF"; }}}
                    onMouseOut={e => { if(!dragging){ e.currentTarget.style.borderColor="#CBD5E1"; e.currentTarget.style.background="#fff"; }}}
                  >
                    <div style={{ width:58, height:58, borderRadius:15, background:"#F1F5F9", border:"1.5px solid #CBD5E1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>📷</div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#1E293B", marginBottom:6 }}>Drop your photo here, or click to browse</div>
                    <div style={{ fontSize:13.5, color:"#64748B" }}>JPG, PNG, WEBP · Max 5 MB</div>
                  </div>
                ) : (
                  <div style={{ borderRadius:14, overflow:"hidden", border:"1.5px solid #CBD5E1" }}>
                    <img src={imgPrev} alt="Preview" style={{ width:"100%", maxHeight:260, objectFit:"cover", display:"block" }} />
                    <div style={{ padding:"12px 18px", background:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid #E2E8F0" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:9, background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>📷</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{imgName}</div>
                          <div style={{ fontSize:11.5, color:"#16A34A", fontWeight:600 }}>✅ Photo attached and ready</div>
                        </div>
                      </div>
                      <button onClick={removeImg} style={{ padding:"5px 13px", borderRadius:8, border:"1.5px solid #CBD5E1", background:"transparent", color:"#DC2626", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Remove</button>
                    </div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => processFile(e.target.files[0])} />
              </div>
            </div>

            {err && (
              <div style={{ marginTop:20, padding:"13px 18px", borderRadius:11, background:"#FEE2E2", border:"1.5px solid rgba(220,38,38,0.25)", fontSize:13.5, color:"#DC2626", fontWeight:500, display:"flex", alignItems:"flex-start", gap:10 }}>
                <span style={{ fontSize:17, flexShrink:0 }}>⚠️</span> {err}
              </div>
            )}

            <div style={{ marginTop:28 }}>
              <button onClick={handleSubmit}
                style={{ width:"100%", padding:"16px", fontSize:15.5, borderRadius:12, border:"none", background:"linear-gradient(135deg,#1D4ED8,#1E40AF)", color:"#fff", fontWeight:700, cursor:"pointer", boxShadow:"0 8px 28px rgba(29,78,216,0.32)", letterSpacing:"0.01em", fontFamily:"inherit", transition:"transform 0.18s" }}
                onMouseOver={e => e.currentTarget.style.transform="translateY(-1px)"}
                onMouseOut={e => e.currentTarget.style.transform="translateY(0)"}
              >
                Analyze &amp; Submit Complaint →
              </button>
              <p style={{ textAlign:"center", fontSize:12.5, color:"#94A3B8", marginTop:12 }}>
                Processed by AI in under 2 seconds · Automatically routed to the correct department
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}