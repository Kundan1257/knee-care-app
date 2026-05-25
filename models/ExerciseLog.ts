import mongoose, { Schema, Document } from "mongoose";

export interface IExerciseLog extends Document {
  userId: string;
  exerciseId: number;
  completed: boolean;
  loggedAt: Date;
}

const ExerciseLogSchema: Schema = new Schema({
  userId: { type: String, required: true },
  exerciseId: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  loggedAt: { type: Date, default: Date.now }
});

export const ExerciseLog = mongoose.models.ExerciseLog || mongoose.model<IExerciseLog>("ExerciseLog", ExerciseLogSchema);
