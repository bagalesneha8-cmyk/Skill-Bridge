import mongoose from "mongoose";

const collegeFormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: String },
  fields: { type: [mongoose.Schema.Types.Mixed], required: true, default: [] },
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, required: true, default: "open" },
  submissionCount: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const formSubmissionSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "CollegeForm", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
  status: { type: String, required: true, default: "pending" },
  feedback: { type: String },
}, { timestamps: { createdAt: "submittedAt", updatedAt: true } });

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, required: true, default: "general" },
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const CollegeForm = mongoose.model("CollegeForm", collegeFormSchema);
export const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema);
export const Announcement = mongoose.model("Announcement", announcementSchema);

export const collegeFormsTable = CollegeForm;
export const formSubmissionsTable = FormSubmission;
export const announcementsTable = Announcement;
