import axios from "axios";

const API = "http://localhost:4000/api/tasks";

// ✅ GET AUTH HEADER (CLEAN WAY)
const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

// 📥 GET TASKS
export const getTasks = async () => {
  return await axios.get(API, getAuthHeader());
};

// ➕ CREATE TASK
export const createTask = async (data) => {
  return await axios.post(API, data, getAuthHeader());
};

// ✏️ UPDATE TASK
export const updateTask = async (id, data) => {
  return await axios.put(`${API}/${id}`, data, getAuthHeader());
};

// ❌ DELETE TASK
export const deleteTask = async (id) => {
  return await axios.delete(`${API}/${id}`, getAuthHeader());
};