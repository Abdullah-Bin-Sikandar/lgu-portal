const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = 'mongodb+srv://fa2023bsse067_db_user:5gBJvnVLIYg1gaqj@cluster0.vzqa7kq.mongodb.net/lgu_portal?retryWrites=true&w=majority';

let cachedConnection = null;

const connectDB = async () => {
  // If already connected, reuse connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection is already in progress, wait for it
  if (cachedConnection) {
    return cachedConnection;
  }

  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  cachedConnection = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  }).then((conn) => {
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  }).catch((err) => {
    cachedConnection = null;
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    throw err;
  });

  return cachedConnection;
};

module.exports = connectDB;
