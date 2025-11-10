import mongoose from "../database";
import { IGuardian } from "../types";
import { hashPassword } from "../services/hashing";

const guardianSchema = new mongoose.Schema<IGuardian>({
  id: { type: String },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  childId: { type: String, required: false },
  isManager: { type: Boolean, default: false },
  managedTeamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team',
    default: null 
  }
});

// Transform output when converting to JSON
guardianSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete (returnedObject as any).password;
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

export default mongoose.model("Guardian", guardianSchema);