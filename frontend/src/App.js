import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import SubmitComplaint from "./pages/citizen/SubmitComplaint";
import ComplaintHistory from "./pages/citizen/ComplaintHistory";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DepartmentDashboard from "./pages/department/DepartmentDashboard";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F5F7FF" }}>
      <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid #EFF6FF", borderTopColor:"#1D4ED8", animation:"spin 1s linear infinite" }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard based on role
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "department") return <Navigate to="/department" replace />;
    return <Navigate to="/citizen" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen routes */}
          <Route path="/citizen" element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <CitizenDashboard />
            </ProtectedRoute>
          } />
          <Route path="/citizen/submit" element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <SubmitComplaint />
            </ProtectedRoute>
          } />
          <Route path="/citizen/history" element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <ComplaintHistory />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Department routes */}
          <Route path="/department" element={
            <ProtectedRoute allowedRoles={["department"]}>
              <DepartmentDashboard />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
