import mongoose from "mongoose";

mongoose.set("strictQuery", false);

export const connectDB = async () => {
  const url = process.env.MONGODB_URI;

  if (!url) {
    console.error("❌ MONGODB_URI is missing — check .env file format and location");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB Atlas...");
  
  try {
    await mongoose.connect(url);
    console.log("✅ Connected to MongoDB Atlas successfully");
  } catch (error: any) {
    console.log("❌ Error connecting to MongoDB Atlas:", error.message);
    process.exit(1);
  }
};

export default mongoose;