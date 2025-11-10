import mongoose from "../database";
import { ITeenager } from "../types";
import { hashPassword } from "../services/hashing";

const teenagerSchema = new mongoose.Schema<ITeenager>({
  id: { type: String },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  teamId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: false 
  },
});

// Transform output when converting to JSON
teenagerSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete (returnedObject as any).password;
  },
});

// Hash password before saving
teenagerSchema.pre("save", async function (next) {
  const doc = this as any;
  if (!doc.isModified("password")) {
    return next();
  }
  try {
    doc.password = await hashPassword(doc.password);
    next();
  } catch (err) {
    next(err as any);
  }
});

export default mongoose.model("Teenager", teenagerSchema);