const express = require("express");
const router = express.Router();

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getAnalytics,
  getAdminAnalytics
} = require("../controllers/taskController");

router.get("/analytics", authMiddleware, getAnalytics);
router.get("/admin/analytics", authMiddleware, isAdmin, getAdminAnalytics);

router.get("/", authMiddleware, getTasks);

router.post("/", authMiddleware, createTask);

router.put("/:id", authMiddleware, updateTask);

router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;