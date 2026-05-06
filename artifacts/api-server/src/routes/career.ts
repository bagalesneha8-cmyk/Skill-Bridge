import { Router, type IRouter } from "express";
import { User, JobApplication, AssessmentResult, FreelanceProject, Badge, Job } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /career/stats
router.get("/career/stats", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await User.findById(userId);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const applications = await JobApplication.find({ userId });
  const assessmentResults = await AssessmentResult.find({ userId });
  const freelanceProjects = await FreelanceProject.find({ clientId: userId });

  const appsByStatus = applications.reduce((acc: Record<string, number>, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const skillScore = assessmentResults.length > 0
    ? Math.round(assessmentResults.reduce((sum, r) => sum + r.score, 0) / assessmentResults.length)
    : 0;

  res.json({
    appliedJobs: applications.length,
    interviews: appsByStatus["shortlisted"] || 0,
    freelanceProjects: freelanceProjects.length,
    skillScore,
    certificatesEarned: assessmentResults.filter(r => r.passed && r.certificate).length,
    learningStreak: user.streak,
    xp: user.xp,
    level: user.level,
    applicationsByStatus: {
      pending: appsByStatus["pending"] || 0,
      shortlisted: appsByStatus["shortlisted"] || 0,
      rejected: appsByStatus["rejected"] || 0,
      hired: appsByStatus["hired"] || 0,
    },
  });
});

// GET /career/timeline
router.get("/career/timeline", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const applications = await JobApplication.find({ userId })
    .sort({ appliedAt: -1 })
    .limit(10);

  const results = await AssessmentResult.find({ userId })
    .sort({ completedAt: -1 })
    .limit(5);

  const events = [
    ...applications.map((r, i) => ({
      id: `app-${i}`,
      type: "application",
      title: "Applied for a job",
      description: `Application status: ${r.status}`,
      date: (r as any).appliedAt.toISOString(),
    })),
    ...results.map((r, i) => ({
      id: `assess-${i}`,
      type: "assessment",
      title: r.passed ? "Passed Assessment" : "Completed Assessment",
      description: `Score: ${r.score}% ${r.passed ? "(Passed)" : "(Not Passed)"}`,
      date: (r as any).completedAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(events);
});

// GET /career/badges
router.get("/career/badges", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await User.findById(userId);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const badges = await Badge.find({ userId });

  // Rank among all users
  const allUsers = await User.find({}, { _id: 1, xp: 1 })
    .sort({ xp: -1 });
  const rank = allUsers.findIndex(u => u._id.toString() === userId) + 1;

  res.json({ xp: user.xp, level: user.level, badges, rank });
});

export default router;
