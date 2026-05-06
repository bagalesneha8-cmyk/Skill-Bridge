import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  type: { type: String, required: true, default: "job" },
  description: { type: String, required: true },
  skills: { type: [String], required: true, default: [] },
  location: { type: String },
  salary: { type: String },
  deadline: { type: String },
  postedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  applicantCount: { type: Number, required: true, default: 0 },
  status: { type: String, required: true, default: "open" },
}, { timestamps: true });

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, required: true, default: "pending" },
  coverLetter: { type: String },
}, { timestamps: { createdAt: "appliedAt", updatedAt: true } });

export const Job = mongoose.model("Job", jobSchema);
export const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export const jobsTable = Job;
export const jobApplicationsTable = JobApplication;
