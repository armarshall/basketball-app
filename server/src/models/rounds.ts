import mongoose from "../database";

// Define a local interface that extends IRound to handle the schema mismatch
interface IRoundDocument extends mongoose.Document {
  matches?: string[]; // Store match IDs as strings
  tournament_id: string;
}

const roundSchema = new mongoose.Schema<IRoundDocument>({
  matches: { type: [String], required: false }, // Store match IDs as strings
  tournament_id: { type: String, required: true },
});

roundSchema.set("toJSON", {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Round = mongoose.model<IRoundDocument>("Round", roundSchema);

export default Round;