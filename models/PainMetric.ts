import mongoose, { Schema, Document } from "mongoose";

export interface IPainMetric extends Document {
  userId: string;
  score: number;
  notes: string;
  loggedAt: Date;
}

const PainMetricSchema: Schema = new Schema({
  userId: { type: String, required: true },
  score: { type: Number, required: true, min: 1, max: 10 },
  notes: { type: String, default: "" },
  loggedAt: { type: Date, default: Date.now }
});

export const PainMetric = mongoose.models.PainMetric || mongoose.model<IPainMetric>("PainMetric", PainMetricSchema);
