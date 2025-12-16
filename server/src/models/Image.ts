import mongoose, { Schema } from "mongoose";

import { IImage } from "../types";

// export interface IImage extends Document {
//   filename: string;
//   url: string;
//   uploadDate: Date;
// }

const imageSchema: Schema = new Schema({
  filename: { type: String, required: true },
  originalFilename: { type: String },
  url: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

export const Image = mongoose.model<IImage>("Image", imageSchema);
