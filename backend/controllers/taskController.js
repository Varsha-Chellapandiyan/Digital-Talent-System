const Task = require("../models/Task");
const User = require("../models/User");
const mongoose = require("mongoose");
const transporter = require("../config/mailer");

exports.getTasks = async (req, res) => {
  try {
    console.log("USER:", req.user);

    const userEmail = req.user.email ? req.user.email.toLowerCase() : "";
    const isAdmin = req.user.role === "admin" || userEmail === "varshachellapandiyan06@gmail.com";

    let tasks;
    if (isAdmin) {
      tasks = await Task.find().populate("user", "name email").sort({ createdAt: -1 });
    } else {
      if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        return res.status(400).json({ msg: "Invalid user ID ❌" });
      }
      tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    }

    res.json(tasks);
  } catch (err) {
    console.error("GET TASK ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, priority, dueDate, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ msg: "Title is required ❌" });
    }

    const userEmail = req.user.email ? req.user.email.toLowerCase() : "";
    const isAdmin = req.user.role === "admin" || userEmail === "varshachellapandiyan06@gmail.com";
    
    if (isAdmin && assignedTo === "all") {
      const allUsers = await User.find({}, "_id email name"); // Fetch emails and names
      const tasksToCreate = allUsers.map(u => ({
        title,
        priority: priority || "medium",
        dueDate,
        user: u._id
      }));
      const savedTasks = await Task.insertMany(tasksToCreate);

      // 📧 Send email to all users
      allUsers.forEach(u => {
        const mailOptions = {
          from: process.env.EMAIL_USER || "varshachellapandiyan06@gmail.com",
          to: u.email,
          subject: "🚀 New Task Assigned: " + title,
          html: `
            <h3>Hello ${u.name},</h3>
            <p>A new task has been assigned to you by the Admin.</p>
            <p><b>Title:</b> ${title}</p>
            <p><b>Due Date:</b> ${dueDate ? new Date(dueDate).toLocaleDateString() : "No date set"}</p>
            <p><b>Priority:</b> ${priority.toUpperCase()}</p>
            <p>Please log in to your dashboard to view more details.</p>
          `
        };
        transporter.sendMail(mailOptions).catch(err => console.error("EMAIL ALL ERROR:", err));
      });

      return res.json({ msg: `Task assigned to ${savedTasks.length} users ✅`, count: savedTasks.length });
    }

    const taskUser = (isAdmin && assignedTo) ? assignedTo : req.user.id;

    const newTask = new Task({
      title,
      priority: priority || "medium",
      dueDate,
      user: taskUser
    });

    const savedTask = await newTask.save();

    // 📧 Send email to the assigned user if assigned by admin
    if (isAdmin && assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser && assignedUser.email) {
        const mailOptions = {
          from: process.env.EMAIL_USER || "varshachellapandiyan06@gmail.com",
          to: assignedUser.email,
          subject: "🚀 New Task Assigned: " + title,
          html: `
            <h3>Hello ${assignedUser.name},</h3>
            <p>A new task has been assigned to you by the Admin.</p>
            <p><b>Title:</b> ${title}</p>
            <p><b>Due Date:</b> ${dueDate ? new Date(dueDate).toLocaleDateString() : "No date set"}</p>
            <p><b>Priority:</b> ${priority.toUpperCase()}</p>
            <p>Please log in to your dashboard to view more details.</p>
          `
        };
        transporter.sendMail(mailOptions).catch(err => console.error("EMAIL SINGLE ERROR:", err));
      }
    }

    res.json(savedTask);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, status, priority, dueDate } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found ❌" });
    }

    const userEmail = req.user.email ? req.user.email.toLowerCase() : "";
    const isAdmin = req.user.role === "admin" || userEmail === "varshachellapandiyan06@gmail.com";
    if (task.user && task.user.toString() !== req.user.id && !isAdmin) {
      return res.status(401).json({ msg: "Not authorized ❌" });
    }

    // ✅ ENFORCE RESTRICTION: Only admins can change title, priority, and dueDate
    if (!isAdmin) {
      task.status = status ?? task.status;
      // title, priority, and dueDate remain unchanged for non-admins
    } else {
      task.title = title ?? task.title;
      task.status = status ?? task.status;
      task.priority = priority ?? task.priority;
      task.dueDate = dueDate ?? task.dueDate;
    }

    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found ❌" });
    }

    const userEmail = req.user.email ? req.user.email.toLowerCase() : "";
    const isAdmin = req.user.role === "admin" || userEmail === "varshachellapandiyan06@gmail.com";
    if (task.user && task.user.toString() !== req.user.id && !isAdmin) {
      return res.status(401).json({ msg: "Not authorized ❌" });
    }

    await task.deleteOne();

    res.json({ msg: "Task deleted ✅" });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({ total, completed, inProgress, pending, completionRate });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};

exports.getAdminAnalytics = async (req, res) => {
  try {
    const tasks = await Task.find();

    const totalUsers = await User.countDocuments();

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({ total, completed, inProgress, pending, completionRate, totalUsers });
  } catch (err) {
    console.error("ADMIN ANALYTICS ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};