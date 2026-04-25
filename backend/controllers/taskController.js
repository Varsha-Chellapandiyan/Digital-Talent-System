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
    const { title, description, priority, dueDate, assignedTo } = req.body;

    if (!title) return res.status(400).json({ msg: "Title is required ❌" });

    const userEmail = req.user?.email ? req.user.email.toLowerCase() : "";
    const isAdmin = req.user?.role === "admin" || userEmail === "varshachellapandiyan06@gmail.com";

    if (isAdmin && (Array.isArray(assignedTo) || assignedTo === "all")) {
      let usersToAssign = [];
      if (assignedTo === "all" || (Array.isArray(assignedTo) && assignedTo.includes("all"))) {
        usersToAssign = await User.find({}, "_id email name");
        usersToAssign = usersToAssign.filter(u => String(u._id) !== String(req.user.id));
      } else if (Array.isArray(assignedTo)) {
        usersToAssign = await User.find({ _id: { $in: assignedTo } }, "_id email name");
      }

      if (usersToAssign.length > 0) {
        const savedTasks = await Promise.all(usersToAssign.map(async u => {
          let taskObj = {
            title,
            description: description || "",
            priority: priority || "medium",
            user: u._id,
            status: "pending"
          };
          if (dueDate && String(dueDate).trim() !== "") taskObj.dueDate = dueDate;
          return await new Task(taskObj).save();
        }));

        usersToAssign.forEach(u => {
          if (u.email) {
            const mailOptions = {
              from: `"DTMS ADMIN" <${process.env.EMAIL_USER || "varshachellapandiyan06@gmail.com"}>`,
              to: u.email,
              subject: "🚀 New Task Assigned: " + title,
              html: `
                <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; background: #fff;">
                  <h2 style="margin-top: 0; color: #4a00e0;">🚀 Task Assigned</h2>
                  <p>Hello <strong>${u.name}</strong>,</p>
                  <p>A new task has been assigned to you by the Admin.</p>
                  
                  <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #cbd5e1; margin: 25px 0;">
                    <p style="margin: 0 0 12px 0;"><strong>📌 Title:</strong> ${title}</p>
                    <p style="margin: 0 0 12px 0;"><strong>📝 Description:</strong> ${description || "No description provided"}</p>
                    <p style="margin: 0 0 12px 0;"><strong>📅 Due Date:</strong> ${dueDate && String(dueDate).trim() !== "" ? new Date(dueDate).toLocaleDateString() : "No date set"}</p>
                    <p style="margin: 0;"><strong>🎯 Priority:</strong> <span style="color: ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981'}; font-weight: 800; text-transform: uppercase;">${priority}</span></p>
                  </div>
                  
                  <p>Please log in to the dashboard for more details.</p>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #64748b; text-align: center;">
                    <strong>Digital Talent Management System</strong><br/>
                    Empowering your professional journey.
                  </div>
                </div>
              `
            };
            transporter.sendMail(mailOptions).catch(() => { });
          }
        });

        return res.json({ msg: `Task assigned to ${savedTasks.length} users ✅`, count: savedTasks.length });
      }
    }

    if (isAdmin && assignedTo === "all") {
      return res.status(400).json({ msg: "No users found to assign." });
    }

    const taskUser = (isAdmin && typeof assignedTo === "string") ? assignedTo : req.user?.id;

    const newTask = new Task({
      title,
      description: description || "",
      priority: priority || "medium",
      user: taskUser,
      status: "pending"
    });
    if (dueDate && String(dueDate).trim() !== "") newTask.dueDate = dueDate;

    const savedTask = await newTask.save();

    if (isAdmin && typeof assignedTo === "string") {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser && assignedUser.email) {
        const mailOptions = {
          from: `"DTMS ADMIN" <${process.env.EMAIL_USER || "varshachellapandiyan06@gmail.com"}>`,
          to: assignedUser.email,
          subject: "🚀 New Task Assigned: " + title,
          html: `
            <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; background: #fff;">
              <h2 style="margin-top: 0; color: #4a00e0;">🚀 Task Assigned</h2>
              <p>Hello <strong>${assignedUser.name}</strong>,</p>
              <p>A new task has been assigned to you by the Admin.</p>
              
              <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #cbd5e1; margin: 25px 0;">
                <p style="margin: 0 0 12px 0;"><strong>📌 Title:</strong> ${title}</p>
                <p style="margin: 0 0 12px 0;"><strong>📝 Description:</strong> ${description || "No description provided"}</p>
                <p style="margin: 0 0 12px 0;"><strong>📅 Due Date:</strong> ${dueDate && String(dueDate).trim() !== "" ? new Date(dueDate).toLocaleDateString() : "No date set"}</p>
                <p style="margin: 0;"><strong>🎯 Priority:</strong> <span style="color: ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981'}; font-weight: 800; text-transform: uppercase;">${priority}</span></p>
              </div>
              
              <p>Please log in to the dashboard for more details.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #64748b; text-align: center;">
                <strong>Digital Talent Management System</strong><br/>
                Empowering your professional journey.
              </div>
            </div>
          `
        };
        transporter.sendMail(mailOptions).catch(() => { });
      }
    }

    return res.json(savedTask);

  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    return res.status(500).json({ msg: "Server error ❌" });
  }
};



exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

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
      task.description = description ?? task.description;
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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "User not authenticated ❌" });
    }

    const tasks = await Task.find({ user: req.user.id }).sort({ dueDate: 1 });
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    // 🗓️ Deadlines: Next 5 upcoming tasks that are not completed
    const deadlines = tasks
      .filter(t => t.status !== "completed" && t.dueDate)
      .slice(0, 5);

    // 📊 Status distribution for pie chart
    const statusData = [
      { name: "Completed", value: completed, color: "#10b981" },
      { name: "In Progress", value: inProgress, color: "#3b82f6" },
      { name: "Pending", value: pending, color: "#f59e0b" }
    ];

    // 📊 Priority distribution
    const high = tasks.filter(t => t.priority === "high").length;
    const medium = tasks.filter(t => t.priority === "medium").length;
    const low = tasks.filter(t => t.priority === "low").length;
    const priorityData = [
      { name: "High", count: high, fill: "#ef4444" },
      { name: "Medium", count: medium, fill: "#f59e0b" },
      { name: "Low", count: low, fill: "#10b981" }
    ];

    // 🔔 Recent Activity (simulation based on task updates)
    const recentTasks = await Task.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      total,
      completed,
      inProgress,
      pending,
      completionRate,
      deadlines,
      statusData,
      priorityData,
      recentTasks
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};

exports.getAdminAnalytics = async (req, res) => {
  try {
    const tasks = await Task.find().populate("user", "name email");
    const totalUsers = await User.countDocuments();
    const allUsers = await User.find({}, "name email");

    // Verbose diagnostics for troubleshooting
    const dbInfo = {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      tasksInCollection: tasks.length
    };
    console.log(`📊 DB DIAGNOSTIC: ${dbInfo.name} on ${dbInfo.host} has ${dbInfo.tasksInCollection} tasks.`);

    const total = tasks.length;
    const completed = tasks.filter(t => t.status && t.status.toLowerCase() === "completed").length;
    const inProgress = tasks.filter(t => t.status && t.status.toLowerCase() === "in-progress").length;
    const pending = tasks.filter(t => t.status && (t.status.toLowerCase() === "pending" || t.status.toLowerCase() === "todo")).length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    const statusData = [
      { name: "Completed", value: completed, color: "#10b981" },
      { name: "In Progress", value: inProgress, color: "#3b82f6" },
      { name: "Pending", value: pending, color: "#f59e0b" }
    ];

    const high = tasks.filter(t => t.priority && t.priority.toLowerCase() === "high").length;
    const medium = tasks.filter(t => t.priority && t.priority.toLowerCase() === "medium").length;
    const low = tasks.filter(t => t.priority && t.priority.toLowerCase() === "low").length;
    const priorityData = [
      { name: "High", count: high, fill: "#ef4444" },
      { name: "Medium", count: medium, fill: "#f59e0b" },
      { name: "Low", count: low, fill: "#10b981" }
    ];

    const userPerformance = allUsers.map(u => {
      const uId = u._id.toString();
      const userTasks = tasks.filter(t => t.user && (t.user._id || t.user).toString() === uId);
      const userCompleted = userTasks.filter(t => t.status && t.status.toLowerCase() === "completed").length;
      return {
        name: u.name,
        email: u.email,
        total: userTasks.length,
        completed: userCompleted,
        rate: userTasks.length === 0 ? 0 : Math.round((userCompleted / userTasks.length) * 100)
      };
    }).sort((a, b) => b.rate - a.rate);

    const recentActivity = await Task.find()
      .populate("user", "name")
      .sort({ updatedAt: -1 })
      .limit(8);

    res.json({
      total,
      completed,
      inProgress,
      pending,
      completionRate,
      totalUsers,
      statusData,
      priorityData,
      userPerformance,
      recentActivity,
      _debug: dbInfo // Exposed for diagnostic purposes
    });
  } catch (err) {
    console.error("ADMIN ANALYTICS ERROR:", err);
    res.status(500).json({ msg: "Server error ❌", error: err.message });
  }
};