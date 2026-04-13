import { useEffect, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getUsers
} from "../services/taskService";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";

function Tasks() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDate, setEditDate] = useState("");
  const [sortBy, setSortBy] = useState("none");
  const [statusFilter, setStatusFilter] = useState("all");

  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const role = localStorage.getItem("role") || "user";

  const theme = darkMode ? dark : light;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    loadTasks();
    if (role === "admin") {
      loadUsers();
    }
  }, [role]);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users ❌");
    }
  };

  const loadTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks ❌");
    }
  };

  const getDueStatus = (date) => {
    if (!date) return "none";

    const today = new Date();
    const due = new Date(date);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    if (due < today) return "overdue";
    if (due.getTime() === today.getTime()) return "today";
    return "upcoming";
  };

  const getPriorityColor = (p) => {
    if (p === "high") return "#ef4444";
    if (p === "medium") return "#f59e0b";
    return "#10b981";
  };

  const handleAdd = async () => {
    if (!title) return toast.error("Enter task");
    if (role === "admin" && !assignedTo) return toast.error("Please assign to a user");

    try {
      const payload = { title, priority, dueDate };
      if (role === "admin" && assignedTo) {
        payload.assignedTo = assignedTo;
      }
      const res = await createTask(payload);
      if (payload.assignedTo === "all") {
        toast.success(res.data.msg);
        loadTasks();
      } else {
        setTasks([res.data, ...tasks]);
      }
      setTitle("");
      setDueDate("");
      setAssignedTo("");
    } catch {
      toast.error("Add failed ❌");
    }
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(tasks.filter(t => t._id !== id));
  };

  const toggleStatus = async (task) => {
    let newStatus = "pending";
    if (task.status === "pending") newStatus = "in-progress";
    else if (task.status === "in-progress") newStatus = "completed";
    else if (task.status === "completed") newStatus = "pending";

    await updateTask(task._id, { status: newStatus });

    setTasks(tasks.map(t =>
      t._id === task._id ? { ...t, status: newStatus } : t
    ));
  };

  const handleUpdate = async (id) => {
    try {
      const res = await updateTask(id, {
        title: editText,
        priority: editPriority,
        dueDate: editDate
      });

      setTasks(tasks.map(t =>
        t._id === id ? res.data : t
      ));

      setEditId(null);
      setEditText("");
      setEditPriority("medium");
      setEditDate("");

    } catch {
      toast.error("Update failed ❌");
    }
  };
  const filteredTasks = tasks.filter(task => {
    if (statusFilter === "all") return true;
    return task.status === statusFilter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.priority] - order[a.priority];
    }

    if (sortBy === "date") {
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    }

    return 0;
  });

  return (
    <div style={{ ...styles.container, background: theme.bg, color: theme.text }}>
      <Toaster />

      <div style={{ ...styles.sidebar, background: theme.sidebar }}>
        <h2>🚀 TaskPro</h2>

        <div style={styles.menuBox}>
          <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>📊 Dashboard</NavLink>
          <NavLink to="/tasks" style={({ isActive }) => linkStyle(isActive)}>📝 Tasks</NavLink>
          <NavLink to="/settings" style={({ isActive }) => linkStyle(isActive)}>⚙️ Settings</NavLink>
        </div>

        <button style={styles.logout} onClick={() => {
          localStorage.clear();
          navigate("/");
        }}>
          Logout
        </button>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <h1>Tasks</h1>

          <button style={styles.toggle} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {role === "admin" && (
          <div style={styles.addBox(theme)}>
            <input
              style={styles.input(theme)}
              placeholder="Task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="date"
              style={styles.input(theme)}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <select
              style={styles.input(theme)}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              style={styles.input(theme)}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Assign To - User</option>
              {role === "admin" && <option value="all">🌟 All Users</option>}
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>

            <button style={styles.addBtn} onClick={handleAdd}>
              Add
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: 15 }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.input(theme)}
          >
            <option value="none">Sort By</option>
            <option value="priority">Priority</option>
            <option value="date">Due Date</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.input(theme)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={styles.grid}>
          {sortedTasks.map(task => (
            <motion.div key={task._id} whileHover={{ y: -5 }} style={styles.card(theme)}>

              {editId === task._id ? (
                <div style={styles.editBox}>
                  <input
                    style={styles.input(theme)}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />

                  <input
                    type="date"
                    style={styles.input(theme)}
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />

                  <select
                    style={{
                      ...styles.input(theme),
                      height: 40,
                      appearance: "none"
                    }}
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  <button
                    style={styles.saveBtn}
                    onClick={() => handleUpdate(task._id)}
                  >
                    💾 Save
                  </button>
                </div>
              ) : (
                <>
                  <h3
                    style={{
                      marginBottom: 6,
                      textDecoration:
                        task.status === "completed" ? "line-through" : "none"
                    }}
                  >
                    {task.title}
                  </h3>

                  {role === "admin" && task.user && (
                    <p style={{ fontSize: 13, marginBottom: 6, fontWeight: "bold", color: theme.text }}>
                      👤 {task.user.name || users.find(u => u._id === task.user)?.name || "Assigned User"}
                    </p>
                  )}

                  <span
                    style={{
                      fontSize: 12,
                      padding: "3px 8px",
                      borderRadius: 20,
                      background: getPriorityColor(task.priority),
                      color: "#fff",
                      width: "fit-content",
                      marginBottom: 6
                    }}
                  >
                    {task.priority.toUpperCase()}
                  </span>

                  <p
                    style={{
                      fontSize: 12,
                      marginBottom: 10,
                      color:
                        getDueStatus(task.dueDate) === "overdue"
                          ? "#ef4444"
                          : getDueStatus(task.dueDate) === "today"
                            ? "#f59e0b"
                            : "#10b981"
                    }}
                  >
                    📅{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-IN")
                      : "No date"}
                  </p>

                  <div style={styles.actions}>
                    <button
                      style={styles.completeBtn(theme, task.status)}
                      onClick={() => toggleStatus(task)}
                      title={`Move to ${task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'pending'}`}
                    >
                      {task.status === "pending" ? "⏱" : task.status === "in-progress" ? "🚀" : "✔"}
                    </button>

                    {role === "admin" && (
                      <button
                        style={styles.editBtn(theme)}
                        onClick={() => {
                          setEditId(task._id);
                          setEditText(task.title);
                          setEditPriority(task.priority);
                          setEditDate(
                            task.dueDate ? task.dueDate.split("T")[0] : ""
                          );
                        }}
                      >
                        ✏️
                      </button>
                    )}

                    {role === "admin" && (
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(task._id)}
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tasks;

const light = {
  bg: "#f1f5f9",
  text: "#0f172a",
  sidebar: "#0f172a",
  card: "#ffffff",
  input: "#f8fafc"
};

const dark = {
  bg: "#0f172a",
  text: "#f1f5f9",
  sidebar: "#020617",
  card: "#1e293b",
  input: "#334155"
};

const styles = {
  container: { display: "flex", height: "100vh", background: "#f1f5f9" },

  sidebar: {
    width: 240,
    color: "#fff",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  menuBox: { display: "flex", flexDirection: "column", gap: 12 },

  logout: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 6,
    cursor: "pointer"
  },

  main: { flex: 1, padding: 30 },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  toggle: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    background: "#000000",
    color: "#fff",
    fontWeight: "bold"
  },

  addBox: (theme) => ({
    marginTop: 20,
    display: "flex",
    gap: 10,
    alignItems: "center",
    background: theme.card,
    padding: 15,
    borderRadius: 10,
    boxShadow:
      theme.card === "#ffffff"
        ? "0 2px 6px rgba(0,0,0,0.05)"
        : "0 2px 6px rgba(0,0,0,0.5)"
  }),

  input: (theme) => ({
    padding: "0 10px",
    height: 40,
    borderRadius: 6,
    border: "1px solid #475569",
    background: theme.input,
    color: theme.text
  }),

  addBtn: {
    height: 40,
    background: "#7d7f85",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "-2px"
  },

  grid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
    gap: 20
  },

  card: (theme) => ({
    padding: 15,
    borderRadius: 12,
    background: theme.card,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 170,
    boxShadow:
      theme.card === "#ffffff"
        ? "0 4px 10px rgba(0,0,0,0.08)"
        : "0 4px 10px rgba(0,0,0,0.6)"
  }),

  editBox: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },

  completeBtn: (theme, status) => {
    let bg = theme.bg === "#020617" ? "#334155" : "#e2e8f0";
    let color = theme.bg === "#020617" ? "#94a3b8" : "#64748b";

    if (status === "completed") {
      bg = theme.bg === "#020617" ? "#064e3b" : "#d1fae5";
      color = theme.bg === "#020617" ? "#34d399" : "#065f46";
    } else if (status === "in-progress") {
      bg = theme.bg === "#020617" ? "#7e22ce" : "#f3e8ff";
      color = theme.bg === "#020617" ? "#d8b4fe" : "#7e22ce";
    }

    return {
      background: bg,
      color: color,
      border: "none",
      padding: "4px 8px",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 12
    };
  },

  editBtn: (theme) => ({
    background: theme.bg === "#020617" ? "#1e3a8a" : "#dbeafe",
    color: theme.bg === "#020617" ? "#60a5fa" : "#1e3a8a",
    border: "none",
    padding: "4px 8px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12
  }),

  deleteBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "4px 8px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12
  },

  saveBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: "auto"
  }
};

const linkStyle = (isActive) => ({
  color: isActive ? "#fff" : "#94a3b8",
  background: isActive ? "#2563eb" : "transparent",
  padding: 8,
  borderRadius: 6,
  textDecoration: "none"
});