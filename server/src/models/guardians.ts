import mongoose from "../database";
import { IGuardian } from "../types";
import { hashPassword } from "../services/hashing";

const guardianSchema = new mongoose.Schema<IGuardian>({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  childId: { type: String, required: false },
  isManager: { type: Boolean, default: false },
  managedTeamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  isAdmin: { type: Boolean, required: false },
});

// Transform output when converting to JSON
guardianSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    // Fix: Use type assertion to handle the ObjectId properly
    const obj = returnedObject as any;
    obj.id = obj._id.toString();
    delete obj.password;
  },
});

// Hash password before saving
guardianSchema.pre("save", async function (next) {
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

export default mongoose.model<IGuardian>("Guardian", guardianSchema);
