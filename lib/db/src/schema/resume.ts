import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  filename: { type: String, required: true },
  summary: { type: String },
  experience: { type: [mongoose.Schema.Types.Mixed], required: true, default: [] },
  education: { type: [mongoose.Schema.Types.Mixed], required: true, default: [] },
  extractedSkills: { type: [String], required: true, default: [] },
  atsScore: { type: Number },
}, { timestamps: { createdAt: false, updatedAt: true } });

export const Resume = mongoose.model("Resume", resumeSchema);
export const resumesTable = Resume;
