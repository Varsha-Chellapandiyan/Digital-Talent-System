const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myapp");
    console.log(`MongoDB connected ✅: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error!");
    console.error(`Message: ${err.message}`);
    console.error("Please ensure your MongoDB service is running (e.g., 'net start MongoDB' or start MongoDB Compass).");
    process.exit(1);
  }
};

module.exports = connectDB;
