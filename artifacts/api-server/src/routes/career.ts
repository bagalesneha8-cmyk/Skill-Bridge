import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, usersTable, jobApplicationsTable, assessmentResultsTable, freelanceProjectsTable, badgesTable } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /career/stats
router.get("/career/stats", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const applications = await db.select().from(jobApplicationsTable).where(eq(jobApplicationsTable.userId, userId));
  const assessmentResults = await db.select().from(assessmentResultsTable).where(eq(assessmentResultsTable.userId, userId));
  const freelanceProjects = await db.select().from(freelanceProjectsTable).where(eq(freelanceProjectsTable.clientId, userId));

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

  const applications = await db.select({ a: jobApplicationsTable, j: { title: sql<string>`${eq(jobApplicationsTable.jobId, jobApplicationsTable.jobId)}` } })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.userId, userId))
    .orderBy(sql`${jobApplicationsTable.appliedAt} desc`)
    .limit(10);

  const results = await db.select()
    .from(assessmentResultsTable)
    .where(eq(assessmentResultsTable.userId, userId))
    .orderBy(sql`${assessmentResultsTable.completedAt} desc`)
    .limit(5);

  const events = [
    ...applications.map((r, i) => ({
      id: i + 1,
      type: "application",
      title: "Applied for a job",
      description: `Application status: ${r.a.status}`,
      date: r.a.appliedAt.toISOString(),
    })),
    ...results.map((r, i) => ({
      id: applications.length + i + 1,
      type: "assessment",
      title: r.passed ? "Passed Assessment" : "Completed Assessment",
      description: `Score: ${r.score}% ${r.passed ? "(Passed)" : "(Not Passed)"}`,
      date: r.completedAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(events);
});

// GET /career/badges
router.get("/career/badges", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const badges = await db.select().from(badgesTable).where(eq(badgesTable.userId, userId));

  // Rank among all users
  const allUsers = await db.select({ id: usersTable.id, xp: usersTable.xp })
    .from(usersTable)
    .orderBy(sql`${usersTable.xp} desc`);
  const rank = allUsers.findIndex(u => u.id === userId) + 1;

  res.json({ xp: user.xp, level: user.level, badges, rank });
});

// GET /leaderboard
router.get("/leaderboard", async (req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    avatar: usersTable.avatar,
    xp: usersTable.xp,
    level: usersTable.level,
  })
    .from(usersTable)
    .orderBy(sql`${usersTable.xp} desc`)
    .limit(20);

  const leaderboard = await Promise.all(users.map(async (user, i) => {
    const badges = await db.select().from(badgesTable).where(eq(badgesTable.userId, user.id));
    return {
      rank: i + 1,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      badges: badges.length,
    };
  }));

  res.json(leaderboard);
});

export default router;
