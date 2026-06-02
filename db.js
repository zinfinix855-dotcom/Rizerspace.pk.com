process.env.MONGOMS_DEBUG = "1";
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod = null;

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rizerspace";

    // Detect if we should use memory server (if local mongo is missing or in dev)
    // We try to connect locally first; if it fails, spin up memory server.
    console.log("📡 Attempting local MongoDB connection...");
    
    // Set a small connection timeout so we fail fast and fallback to memory server
    const options = {
      serverSelectionTimeoutMS: 2000
    };

    let conn;
    try {
      conn = await mongoose.connect(dbUri, options);
      console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.log("⚠️ Local MongoDB connection failed. Spinning up MongoDB Memory Server...");
      mongod = await MongoMemoryServer.create({
        instance: {
          launchTimeout: 60000
        }
      });
      dbUri = mongod.getUri();
      console.log(`🚀 MongoDB Memory Server running at: ${dbUri}`);
      conn = await mongoose.connect(dbUri);
      console.log("📡 Connected to MongoDB Memory Server");
    }

    // Auto-seed if database is empty
    const Product = require("../models/Product");
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("🌱 Database is empty. Seeding dummy data automatically...");
      const { seedDB } = require("../seed/seedData");
      await seedDB(true); // true to skip connecting again
    }

  } catch (error) {
    console.error(`🚨 MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Shutdown handler to clean up MongoMemoryServer
process.on("SIGINT", async () => {
  if (mongod) {
    console.log("🛑 Stopping MongoDB Memory Server...");
    await mongod.stop();
  }
  process.exit(0);
});

module.exports = connectDB;
