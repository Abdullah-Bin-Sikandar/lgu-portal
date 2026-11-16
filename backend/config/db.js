const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = 'mongodb+srv://fa2023bsse067_db_user:5gBJvnVLIYg1gaqj@cluster0.vzqa7kq.mongodb.net/lgu_portal?retryWrites=true&w=majority';

const connectDB = async () => {
  // If already connected or connecting, reuse connection (essential for Vercel Serverless)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
