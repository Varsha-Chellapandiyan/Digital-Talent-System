import { useEffect, useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from "../services/taskService";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";

function Tasks() {
  const navigate = useNavigate();

  // ✅ THEME
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  // ✅ STATES
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  // ✅ EDIT STATES
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDate, setEditDate] = useState("");

  const theme = darkMode ? dark : light;

  // 🔐 AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // 📡 LOAD TASKS
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks ❌");
    }
  };

  // 📅 DUE STATUS
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

  // ➕ ADD TASK
  const handleAdd = async () => {
    if (!title) return toast.error("Enter task");

    try {
      const res = await createTask({ title, priority, dueDate });
      setTasks([res.data, ...tasks]);
      setTitle("");
      setDueDate("");
    } catch {
      toast.error("Add failed ❌");
    }
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(tasks.filter(t => t._id !== id));
  };

  // ✔ TOGGLE STATUS
  const toggleStatus = async (task) => {
    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    await updateTask(task._id, { status: newStatus });

    setTasks(tasks.map(t =>
      t._id === task._id ? { ...t, status: newStatus } : t
    ));
  };

  // ✏ FULL UPDATE
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
    } catch {
      toast.error("Update failed ❌");
    }
  };

  return (
    <div style={{ ...styles.container, background: theme.bg, color: theme.text }}>
      <Toaster />

      {/* SIDEBAR */}
      <div style={{ ...styles.sidebar, background: theme.sidebar }}>
        <h2>🚀 TaskPro</h2>

        <div style={styles.menuBox}>
          <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>📊 Dashboard</NavLink>
          <NavLink to="/tasks" style={({ isActive }) => linkStyle(isActive)}>📝 Tasks</NavLink>
          <NavLink to="/settings" style={({ isActive }) => linkStyle(isActive)}>⚙️ Settings</NavLink>
        </div>

        <button
          style={styles.logout}
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.header}>
          <h1>Tasks</h1>

          {/* ✅ SAME AS DASHBOARD */}
          <button
            style={styles.toggle}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* ADD TASK */}
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

          <button style={styles.addBtn} onClick={handleAdd}>
            Add
          </button>
        </div>

        {/* TASK LIST */}
        <div style={styles.grid}>
          {tasks.map(task => (
            <motion.div key={task._id} whileHover={{ y: -5 }} style={styles.card(theme)}>

              {editId === task._id ? (
                <>
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
                    style={styles.input(theme)}
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  <button onClick={() => handleUpdate(task._id)}>💾 Save</button>
                </>
              ) : (
                <>
                  <h3 style={{
                    textDecoration: task.status === "completed" ? "line-through" : "none"
                  }}>
                    {task.title}
                  </h3>

                  <p style={{
                    color:
                      getDueStatus(task.dueDate) === "overdue" ? "#ef4444" :
                      getDueStatus(task.dueDate) === "today" ? "#f59e0b" :
                      "#10b981"
                  }}>
                    📅 {
                      task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-IN")
                        : "No date"
                    }
                  </p>

                  <div style={styles.actions}>
                    <button onClick={() => toggleStatus(task)}>✔</button>

                    <button onClick={() => {
                      setEditId(task._id);
                      setEditText(task.title);
                      setEditPriority(task.priority);
                      setEditDate(task.dueDate ? task.dueDate.split("T")[0] : "");
                    }}>
                      ✏️
                    </button>

                    <button onClick={() => handleDelete(task._id)}>❌</button>
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

// 🎨 THEMES
const light = {
  bg: "#f8fafc",
  text: "#000",
  sidebar: "#0f172a",
  card: "#fff",
  input: "#fff"
};

const dark = {
  bg: "#020617",
  text: "#fff",
  sidebar: "#020617",
  card: "#0f172a",
  input: "#020617"
};

// 🎨 STYLES
const styles = {
  container: { display: "flex", height: "100vh" },

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
    borderRadius: 6
  },

  main: { flex: 1, padding: 30 },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  toggle: {
    padding: 8,
    borderRadius: 6,
    border: "none",
    cursor: "pointer"
  },

  addBox: (theme) => ({
    marginTop: 20,
    display: "flex",
    gap: 10,
    background: theme.card,
    padding: 10,
    borderRadius: 10
  }),

  input: (theme) => ({
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
    background: theme.input,
    color: theme.text
  }),

  addBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: 8
  },

  grid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
    gap: 20
  },

  card: (theme) => ({
    padding: 15,
    borderRadius: 10,
    background: theme.card
  }),

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 10
  }
};

const linkStyle = (isActive) => ({
  color: isActive ? "#fff" : "#94a3b8",
  background: isActive ? "#2563eb" : "transparent",
  padding: 8,
  borderRadius: 6,
  textDecoration: "none"
});