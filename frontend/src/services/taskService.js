import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
const API = `${API_BASE}/api/tasks`;

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

export const getTasks = async () => {
  return await axios.get(API, getAuthHeader());
};

export const createTask = async (data) => {
  return await axios.post(API, data, getAuthHeader());
};

export const updateTask = async (id, data) => {
  return await axios.put(`${API}/${id}`, data, getAuthHeader());
};

export const deleteTask = async (id) => {
  return await axios.delete(`${API}/${id}`, getAuthHeader());
};

export const getAnalytics = async () => {
  return await axios.get(`${API}/analytics`, getAuthHeader());
};

export const getAdminAnalytics = async () => {
  return await axios.get(`${API}/admin/analytics`, getAuthHeader());
};

export const getUsers = async () => {
  return await axios.get(`${API_BASE}/api/auth/users`, getAuthHeader());
};