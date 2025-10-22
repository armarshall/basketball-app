import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI as string;

console.log("connecting to db: ", url);
mongoose
  .connect(url)
  .then((_result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const teamSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  players: { type: Array, requred: true },
  is_teen: { type: Boolean, required: true },
});

teamSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id; // come back to this
    // delete returnedObject.__v;
  },
});

export default mongoose.model("Team", teamSchema);
