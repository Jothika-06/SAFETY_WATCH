import axios from "axios";

const API = axios.create({
  baseURL: "https://safety-watch-1y4c.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");
export const submitComplaint = (data) => API.post("/complaints", data);
export const getMyComplaints = () => API.get("/complaints/my");
export const getComplaintById = (id) => API.get(`/complaints/${id}`);
export const getAllComplaints = () => API.get("/admin/complaints");
export const getDashboardStats = () => API.get("/admin/stats");
export const getDepartmentComplaints = () => API.get("/department/complaints");
export const resolveComplaint = (id, data) => API.put(`/department/complaints/${id}`, data);

export default API;