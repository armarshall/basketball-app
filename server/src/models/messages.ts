import mongoose from "../database";
import { IMessage } from "../types";

const messageSchema = new mongoose.Schema<IMessage>({
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team',
    required: true,
    index: true
  },
  senderId: { 
    type: String, 
    required: true 
  },
  senderType: { 
    type: String, 
    enum: ['Teenager', 'Guardian'],
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  senderName: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    required: true
  }
});

// Index for efficient querying by team
messageSchema.index({ teamId: 1, timestamp: -1 });

messageSchema.set("toJSON", {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
  },
});

export default mongoose.model("Message", messageSchema);

