import mongoose from "mongoose";
require("dotenv").config();

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI as string;

// Log which database we're connecting to (without exposing credentials)
const dbName = url.split("/").pop()?.split("?")[0];
console.log(`connecting to database: ${dbName}`);

mongoose
  .connect(url)
  .then((_result) => {
    console.log(`connected to MongoDB database: ${dbName}`);
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

export default mongoose;
