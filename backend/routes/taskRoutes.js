const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

// 📥 GET
router.get("/", authMiddleware, getTasks);

// ➕ CREATE
router.post("/", authMiddleware, createTask);

// ✏️ UPDATE
router.put("/:id", authMiddleware, updateTask);

// ❌ DELETE
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;