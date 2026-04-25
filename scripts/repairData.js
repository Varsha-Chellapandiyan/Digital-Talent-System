const mongoose = require('../backend/node_modules/mongoose');

// This script normalizes all tasks to ensure they have valid lowercase status and priority.
const TaskSchema = new mongoose.Schema({
  status: String,
  priority: String,
});

const Task = mongoose.model('Task', TaskSchema);

async function repair() {
  try {
    const mongoURI = "mongodb://127.0.0.1:27017/myapp";
    console.log(`🔌 Connecting to ${mongoURI}...`);
    await mongoose.connect(mongoURI);

    const tasks = await Task.find();
    console.log(`🔍 Found ${tasks.length} tasks to check.`);

    let fixedCount = 0;
    for (let task of tasks) {
      const oldStatus = task.status;
      const oldPriority = task.priority;

      // Normalize status
      let newStatus = (task.status || 'pending').toLowerCase().trim();
      if (newStatus === 'to do' || newStatus === 'todo') newStatus = 'pending';
      
      // Normalize priority
      let newPriority = (task.priority || 'medium').toLowerCase().trim();

      if (newStatus !== oldStatus || newPriority !== oldPriority) {
        task.status = newStatus;
        task.priority = newPriority;
        await task.save();
        fixedCount++;
        console.log(`✅ Fixed Task: ${task._id} (${oldStatus} -> ${newStatus}, ${oldPriority} -> ${newPriority})`);
      }
    }

    console.log(`🎉 Cleanup complete! Fixed ${fixedCount} tasks.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ REPAIR ERROR:", err);
    process.exit(1);
  }
}

repair();
