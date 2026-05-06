import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db, usersTable, jobsTable, jobApplicationsTable,
  assessmentResultsTable, freelanceProjectsTable, collegeFormsTable,
  notificationsTable, announcementsTable,
} from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /dashboard/summary
router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [{ jobCount }] = await db.select({ jobCount: sql<number>`count(*)` }).from(jobsTable).where(eq(jobsTable.status, "open"));
  const applications = await db.select().from(jobApplicationsTable).where(eq(jobApplicationsTable.userId, userId));
  const assessmentResults = await db.select().from(assessmentResultsTable).where(eq(assessmentResultsTable.userId, userId));
  const freelanceProjects = await db.select().from(freelanceProjectsTable).limit(5);
  const forms = await db.select().from(collegeFormsTable).where(eq(collegeFormsTable.status, "open"));
  const [{ notifCount }] = await db.select({ notifCount: sql<number>`count(*)` })
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .where(eq(notificationsTable.read, false));

  const recentJobs = await db.select().from(jobsTable)
    .where(eq(jobsTable.status, "open"))
    .orderBy(sql`${jobsTable.createdAt} desc`)
    .limit(5);

  const announcements = await db.select().from(announcementsTable)
    .orderBy(sql`${announcementsTable.createdAt} desc`)
    .limit(3);

  res.json({
    role: user.role,
    stats: {
      jobs: Number(jobCount),
      applications: applications.length,
      assessmentsPassed: assessmentResults.filter(r => r.passed).length,
      learningItems: 0,
      freelanceProjects: freelanceProjects.length,
      forms: forms.length,
      unreadNotifications: Number(notifCount),
    },
    recentJobs,
    topMatches: [],
    recentAnnouncements: announcements,
  });
});

// GET /dashboard/activity
router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const applications = await db.select()
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.userId, userId))
    .orderBy(sql`${jobApplicationsTable.appliedAt} desc`)
    .limit(5);

  const results = await db.select()
    .from(assessmentResultsTable)
    .where(eq(assessmentResultsTable.userId, userId))
    .orderBy(sql`${assessmentResultsTable.completedAt} desc`)
    .limit(5);

  const activity = [
    ...applications.map((a, i) => ({
      id: i + 1,
      type: "job_application",
      description: `Applied for job #${a.jobId} — status: ${a.status}`,
      timestamp: a.appliedAt.toISOString(),
      userId,
      userName: "",
    })),
    ...results.map((r, i) => ({
      id: applications.length + i + 1,
      type: "assessment_completed",
      description: `Completed assessment — score: ${r.score}%`,
      timestamp: r.completedAt.toISOString(),
      userId,
      userName: "",
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(activity);
});

// GET /dashboard/stats
router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [{ userCount }] = await db.select({ userCount: sql<number>`count(*)` }).from(usersTable);
  const [{ jobCount }] = await db.select({ jobCount: sql<number>`count(*)` }).from(jobsTable);
  const [{ appCount }] = await db.select({ appCount: sql<number>`count(*)` }).from(jobApplicationsTable);
  const [{ assessCount }] = await db.select({ assessCount: sql<number>`count(*)` }).from(assessmentResultsTable);
  const [{ fpCount }] = await db.select({ fpCount: sql<number>`count(*)` }).from(freelanceProjectsTable);

  const roleCounts = await db.select({
    role: usersTable.role,
    count: sql<number>`count(*)`,
  }).from(usersTable).groupBy(usersTable.role);

  const usersByRole = {
    student: 0, recruiter: 0, faculty: 0, freelancer_client: 0, admin: 0,
  } as Record<string, number>;

  for (const r of roleCounts) {
    usersByRole[r.role] = Number(r.count);
  }

  res.json({
    totalUsers: Number(userCount),
    totalJobs: Number(jobCount),
    totalApplications: Number(appCount),
    totalAssessments: Number(assessCount),
    totalFreelanceProjects: Number(fpCount),
    usersByRole,
  });
});

export default router;
