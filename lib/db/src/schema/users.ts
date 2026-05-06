import mongoose from "mongoose";
import { z } from "zod/v4";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "student" },
  avatar: { type: String },
  bio: { type: String },
  institution: { type: String },
  location: { type: String },
  xp: { type: Number, required: true, default: 0 },
  level: { type: Number, required: true, default: 1 },
  streak: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);

// Export types for compatibility
export type UserType = mongoose.InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const usersTable = User; // Alias for backward compatibility if needed, though we should update routes
