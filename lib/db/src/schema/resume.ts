import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  fileUrl: { type: String },
  summary: { type: String },
  experience: { type: [mongoose.Schema.Types.Mixed], required: true, default: [] },
  education: { type: [mongoose.Schema.Types.Mixed], required: true, default: [] },
  extractedSkills: { type: [String], required: true, default: [] },
  atsScore: { type: Number },
  isMain: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: true } });

export const Resume = mongoose.model("Resume", resumeSchema);
export const resumesTable = Resume;
