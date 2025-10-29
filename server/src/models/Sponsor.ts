import mongoose, { Document, Schema } from "mongoose";

interface ISponsor extends Document {
  name: string;
  description: string;
  logoUrl: string;
}

const sponsorSchema: Schema = new Schema<ISponsor>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  logoUrl: { type: String, required: true },
});

export default mongoose.model("Sponsor", sponsorSchema);
