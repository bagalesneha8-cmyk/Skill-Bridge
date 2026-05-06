import { Router, type IRouter } from "express";
import {
  User, Job, JobApplication,
  AssessmentResult, FreelanceProject, CollegeForm,
  Notification, Announcement,
} from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /dashboard/summary
router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await User.findById(userId);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const jobCount = await Job.countDocuments({ status: "open" });
  const applications = await JobApplication.find({ userId });
  const assessmentResults = await AssessmentResult.find({ userId });
  const freelanceProjects = await FreelanceProject.find().limit(5);
  const forms = await CollegeForm.find({ status: "open" });
  const notifCount = await Notification.countDocuments({ userId, read: false });

  const recentJobs = await Job.find({ status: "open" })
    .sort({ createdAt: -1 })
    .limit(5);

  const announcements = await Announcement.find()
    .sort({ createdAt: -1 })
    .limit(3);

  res.json({
    role: user.role,
    stats: {
      jobs: jobCount,
      applications: applications.length,
      assessmentsPassed: assessmentResults.filter(r => r.passed).length,
      learningItems: 0,
      freelanceProjects: freelanceProjects.length,
      forms: forms.length,
      unreadNotifications: notifCount,
    },
    recentJobs: recentJobs.map(j => {
      const obj = j.toObject();
      return { ...obj, id: obj._id.toString() };
    }),
    topMatches: [],
    recentAnnouncements: announcements.map(a => {
      const obj = a.toObject();
      return { ...obj, id: obj._id.toString() };
    }),
  });
});

// GET /dashboard/activity
router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const applications = await JobApplication.find({ userId })
    .sort({ appliedAt: -1 })
    .limit(5);

  const results = await AssessmentResult.find({ userId })
    .sort({ completedAt: -1 })
    .limit(5);

  const activity = [
    ...applications.map((a, i) => ({
      id: `app-${i}`,
      type: "job_application",
      description: `Applied for job #${a.jobId} — status: ${a.status}`,
      timestamp: (a as any).appliedAt.toISOString(),
      userId,
      userName: "",
    })),
    ...results.map((r, i) => ({
      id: `assess-${i}`,
      type: "assessment_completed",
      description: `Completed assessment — score: ${r.score}%`,
      timestamp: (r as any).completedAt.toISOString(),
      userId,
      userName: "",
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(activity);
});

// GET /dashboard/stats
router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const userCount = await User.countDocuments();
  const jobCount = await Job.countDocuments();
  const appCount = await JobApplication.countDocuments();
  const assessCount = await AssessmentResult.countDocuments();

  res.json({
    users: userCount,
    jobs: jobCount,
    applications: appCount,
    assessments: assessCount,
  });
});

export default router;
