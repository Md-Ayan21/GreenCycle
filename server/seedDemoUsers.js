
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

    if (process.env.SHOP_DEMO_PASSWORD) {
      if (process.env.SHOP_DEMO_PASSWORD.length < 8) {
        throw new Error("SHOP_DEMO_PASSWORD must be at least 8 characters");
      }

      const shopDemoUser = {
        name: "Demo Shop",
        email: "shop.demo@greencycle.test",
        password: process.env.SHOP_DEMO_PASSWORD,
        role: "shop",
        businessName: "GreenCycle Demo Shop",
        address: "Delhi, India",
      };
      const existingShopUser = await User.findOne({
        email: shopDemoUser.email,
      });

      if (existingShopUser) {
        console.log(`Already exists: ${shopDemoUser.email}`);
      } else {
        await User.create(shopDemoUser);
        console.log(`Created: ${shopDemoUser.email} (${shopDemoUser.role})`);
      }
    } else {
      console.log(
        "Shop demo account not configured; set SHOP_DEMO_PASSWORD to seed it."
      );
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
