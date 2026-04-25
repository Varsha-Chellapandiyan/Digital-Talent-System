import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getUsers
} from "../services/taskService";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { taskStyles as styles } from "./styles";
import { 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle, 
  Calendar,
  User,
  FileText
} from './Icons';

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const role = (localStorage.getItem("role") || "user").toLowerCase();

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTasks();
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks ❌");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users ❌");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    loadTasks();
    if (role === "admin") loadUsers();
  }, [navigate, loadTasks, loadUsers, role]);

  const handleAdd = async () => {
    if (!title) return toast.error("Enter title");

    try {
      const payload = { title, description, priority, dueDate };
      if (role === "admin" && assignedTo !== "all") {
          payload.assignedTo = assignedTo;
      }

      if (role === "admin" && assignedTo === "all") {
          await Promise.all(users.map(u => createTask({...payload, assignedTo: u._id})));
      } else {
          await createTask(payload);
      }
      
      toast.success("Task added ✅");
      loadTasks();

      setTitle("");
      setDescription("");
      setDueDate("");
      setAssignedTo("");
      setPriority("medium");
    } catch {
      toast.error("Add failed ❌");
    }
  };

  const toggleStatus = async (task) => {
    let newStatus =
      task.status === "pending"
        ? "in-progress"
        : task.status === "in-progress"
          ? "completed"
          : "pending";

    try {
        await updateTask(task._id, { status: newStatus });
        setTasks(tasks.map(t =>
          t._id === task._id ? { ...t, status: newStatus } : t
        ));
        toast.success(`Moved to ${newStatus}`);
    } catch {
        toast.error("Update failed ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "priority") {
        const pMap = { high: 3, medium: 2, low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      if (sortBy === "date") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });

    return filtered;
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#64748b";
    }
  };

  if (loading)
    return <div style={styles.loading}><h2>Syncing Workspace...</h2></div>;

  const displayTasks = getFilteredTasks();

  return (
    <div style={styles.pageWrap}>
      {role === "admin" && (
        <div style={styles.createCard}>
          <h3 style={styles.subTitle}><Plus size={14} /> Create New Task</h3>
          <div style={styles.formGrid}>
            <div style={styles.formRow}>
                <input
                  style={styles.input}
                  placeholder="Task Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <select
                  style={styles.select}
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Assign User...</option>
                  <option value="all">📢 All Users</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
                <select
                  style={styles.select}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
                <input
                  type="date"
                  style={styles.input}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
            </div>

            <div style={styles.formBottomRow}>
                <textarea
                  style={{...styles.textarea, minHeight: "48px", marginBottom: 0}}
                  placeholder="Task Description (Optional)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button style={styles.addBtn} onClick={handleAdd}>
                  <Plus size={18} /> Add Task
                </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.filterRow}>
        <div style={styles.filtersLeft}>
            <span style={{fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', opacity: 0.9}}>Status:</span>
            <select 
               style={styles.filterSelect} 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="all">🌐 All Status</option>
                <option value="pending">⏳ Pending Tasks</option>
                <option value="in-progress">🚀 In Progress</option>
                <option value="completed">✅ Completed</option>
            </select>
        </div>
        <div style={styles.filtersRight}>
             <span style={{fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', opacity: 0.9}}>Sort By:</span>
              <select 
                 style={styles.filterSelect} 
                 value={sortBy} 
                 onChange={(e) => setSortBy(e.target.value)}
              >
                 <option value="newest">🚀 Latest Contributions</option>
                 <option value="oldest">📜 Legacy Records</option>
                 <option value="priority">🎯 Highest Priority</option>
                 <option value="date">📅 Due Date</option>
              </select>
        </div>
      </div>

      <div style={styles.taskGrid}>
        <AnimatePresence mode="popLayout">
          {displayTasks.map(task => (
            <motion.div 
                key={task._id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                style={styles.taskCard}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.taskTitle}>{task.title}</h3>
                <span style={{...styles.priorityTag, background: getPriorityColor(task.priority)}}>
                    {task.priority}
                </span>
              </div>

              {role === "admin" && (
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <User size={14} color="#64748b" />
                    <p style={styles.userText}>{task.assignedTo?.name || task.user?.name || "Unassigned"}</p>
                </div>
              )}

              {task.description && (
                <div style={styles.descText}>
                    <FileText size={16} color="#8e2de2" style={{marginTop: '4px', flexShrink: 0}} />
                    <span>{task.description}</span>
                </div>
              )}

              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: "var(--text-muted)", marginTop: '10px'}}>
                <Calendar size={14} />
                <p style={styles.dateText}>Deadline: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Flexible"}</p>
              </div>

              <div style={styles.actions}>
                <button
                  style={styles.statusBtn(task.status)}
                  onClick={() => toggleStatus(task)}
                >
                  {task.status === "completed" ? <Check size={14} /> : task.status === "in-progress" ? <Clock size={14} /> : <AlertCircle size={14} />}
                  <span style={{marginLeft: '8px'}}>{task.status}</span>
                </button>

                {role === "admin" && (
                   <div style={styles.adminActions}>
                        <button style={styles.iconBtn} onClick={() => handleDelete(task._id)}>
                            <Trash2 size={16} color="#ef4444" />
                        </button>
                   </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {displayTasks.length === 0 && (
        <div style={styles.emptyState}>
            <h2>🎉 No tasks matched!</h2>
            <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

export default Tasks;