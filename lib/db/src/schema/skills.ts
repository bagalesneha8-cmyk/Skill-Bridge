import mongoose from "mongoose";

const userSkillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skill: { type: String, required: true },
  level: { type: String, required: true, default: "beginner" },
  verified: { type: Boolean, required: true, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const UserSkill = mongoose.model("UserSkill", userSkillSchema);
export const userSkillsTable = UserSkill;
