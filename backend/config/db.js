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

  let uri = process.env.MONGO_URI;
  // If MONGO_URI is not set, empty, or points to localhost/127.0.0.1 (which doesn't exist in serverless), fall back to Atlas
  if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
    uri = DEFAULT_MONGO_URI;
  }

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
