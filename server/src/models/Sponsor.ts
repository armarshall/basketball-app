import mongoose,{ Document, Schema } from 'mongoose';

export interface ISponsor extends Document {
    name: string;
    description: string;
    logoUrl: string;
}

const sponsorSchema: Schema = new Schema({
name: {type: String, required: true},
description: {type: String, required: true},
logoUrl: {type: String, required: true},
});

export const Sponsor = mongoose.model<ISponsor>('Sponsor', sponsorSchema);
