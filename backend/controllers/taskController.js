const Task = require("../models/Task");
const mongoose = require("mongoose");

// ================= GET ALL TASKS =================
exports.getTasks = async (req, res) => {
  try {
    console.log("USER:", req.user);

    // ✅ Prevent crash
    if (!mongoose.Types.ObjectId.isValid(req.user)) {
      return res.status(400).json({ msg: "Invalid user ID ❌" });
    }

    const tasks = await Task.find({ user: req.user }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("GET TASK ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};

// ================= CREATE TASK =================
exports.createTask = async (req, res) => {
  try {
    const { title, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ msg: "Title is required ❌" });
    }

    const newTask = new Task({
      title,
      priority: priority || "medium",
      dueDate,
      user: req.user
    });

    const savedTask = await newTask.save();

    res.json(savedTask);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};

// ================= UPDATE TASK =================
exports.updateTask = async (req, res) => {
  try {
    const { title, status, priority, dueDate } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found ❌" });
    }

    // 🔒 Ownership check
    if (task.user.toString() !== req.user) {
      return res.status(401).json({ msg: "Not authorized ❌" });
    }

    // ✅ Update fields
    task.title = title ?? task.title;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate ?? task.dueDate;

    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};

// ================= DELETE TASK =================
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found ❌" });
    }

    // 🔒 Ownership check
    if (task.user.toString() !== req.user) {
      return res.status(401).json({ msg: "Not authorized ❌" });
    }

    await task.deleteOne();

    res.json({ msg: "Task deleted ✅" });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};