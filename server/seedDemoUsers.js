
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const demoUsers = [
  {
    name: "GreenCycle Admin",
    email: "admin.demo@greencycle.test",
    password: "AdminDemo@123",
    role: "admin",
    businessName: "GreenCycle",
    address: "Delhi, India",
  },
  {
    name: "Demo Collector",
    email: "collector.demo@greencycle.test",
    password: "CollectorDemo@123",
    role: "collector",
    businessName: "GreenCycle Collection",
    address: "Delhi, India",
  },
  {
    name: "Demo Recycler",
    email: "recycler.demo@greencycle.test",
    password: "RecyclerDemo@123",
    role: "recycler",
    businessName: "GreenCycle Recycling",
    address: "Delhi, India",
  },
];

async function seedDemoUsers() {
  try {
    await connectDB();

    for (const demoUser of demoUsers) {
      const existingUser = await User.findOne({
        email: demoUser.email,
      });

      if (existingUser) {
        console.log(`Already exists: ${demoUser.email}`);
        continue;
      }

      await User.create(demoUser);
      console.log(`Created: ${demoUser.email} (${demoUser.role})`);
    }

    console.log("Demo account setup complete.");
    process.exitCode = 0;
  } catch (error) {
    console.error("Demo account setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = require("mongoose");
    await mongoose.disconnect();
  }
}

seedDemoUsers();
