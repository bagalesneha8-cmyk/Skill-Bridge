import { Router, type IRouter } from "express";
import { eq, ilike, or, sql, inArray } from "drizzle-orm";
import { db, jobsTable, jobApplicationsTable, usersTable, userSkillsTable } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /jobs
router.get("/jobs", async (req, res): Promise<void> => {
  const { type, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = db.select().from(jobsTable).where(eq(jobsTable.status, "open")).$dynamic();

  if (type) {
    query = query.where(eq(jobsTable.type, type));
  }
  if (search) {
    query = query.where(
      or(
        ilike(jobsTable.title, `%${search}%`),
        ilike(jobsTable.company, `%${search}%`)
      )
    );
  }

  const jobs = await query.orderBy(sql`${jobsTable.createdAt} desc`).limit(parseInt(limit)).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(jobsTable).where(eq(jobsTable.status, "open"));

  res.json({ jobs, total: Number(count), page: parseInt(page), limit: parseInt(limit) });
});

// POST /jobs
router.post("/jobs", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { title, company, type, description, skills, location, salary, deadline } = req.body;
  if (!title || !company || !type || !description) {
    res.status(400).json({ error: "title, company, type, description required" });
    return;
  }

  const [job] = await db.insert(jobsTable).values({
    title, company, type, description,
    skills: skills ?? [],
    location, salary, deadline,
    postedById: userId,
    status: "open",
  }).returning();

  res.status(201).json(job);
});

// GET /jobs/matches
router.get("/jobs/matches", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const userSkills = await db.select().from(userSkillsTable).where(eq(userSkillsTable.userId, userId));
  const userSkillNames = userSkills.map(s => s.skill.toLowerCase());

  const jobs = await db.select().from(jobsTable).where(eq(jobsTable.status, "open")).limit(20);

  const matches = jobs.map(job => {
    const jobSkills = (job.skills ?? []).map((s: string) => s.toLowerCase());
    const matchedSkills = jobSkills.filter((s: string) => userSkillNames.includes(s));
    const missingSkills = jobSkills.filter((s: string) => !userSkillNames.includes(s));
    const matchScore = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 50;

    return { job, matchScore, matchedSkills, missingSkills };
  });

  matches.sort((a, b) => b.matchScore - a.matchScore);
  res.json(matches);
});

// GET /jobs/:id
router.get("/jobs/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(job);
});

// POST /jobs/:id/apply
router.post("/jobs/:id/apply", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const jobId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { coverLetter } = req.body;

  const existing = await db.select().from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.userId, userId))
    .where(eq(jobApplicationsTable.jobId, jobId));

  if (existing.length > 0) {
    res.status(409).json({ error: "Already applied" });
    return;
  }

  const [application] = await db.insert(jobApplicationsTable).values({
    jobId, userId, coverLetter, status: "pending",
  }).returning();

  // increment applicant count
  await db.update(jobsTable).set({ applicantCount: sql`${jobsTable.applicantCount} + 1` }).where(eq(jobsTable.id, jobId));

  res.status(201).json(application);
});

// GET /applications
router.get("/applications", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { jobId, status } = req.query as Record<string, string>;

  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!currentUser) { res.status(404).json({ error: "User not found" }); return; }

  let applications;

  if (currentUser.role === "recruiter" && jobId) {
    // Recruiter sees all applications for their jobs
    applications = await db.select({
      application: jobApplicationsTable,
      job: jobsTable,
      user: usersTable,
    })
      .from(jobApplicationsTable)
      .innerJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
      .innerJoin(usersTable, eq(jobApplicationsTable.userId, usersTable.id))
      .where(eq(jobApplicationsTable.jobId, parseInt(jobId, 10)));

    res.json(applications.map(r => ({
      ...r.application,
      job: r.job,
      user: { ...r.user, password: undefined },
    })));
    return;
  }

  // Student sees their own applications
  let q = db.select({
    application: jobApplicationsTable,
    job: jobsTable,
  })
    .from(jobApplicationsTable)
    .innerJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .where(eq(jobApplicationsTable.userId, userId)).$dynamic();

  applications = await q;
  res.json(applications.map(r => ({ ...r.application, job: r.job })));
});

// PATCH /applications/:id
router.patch("/applications/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { status } = req.body;

  const [application] = await db.update(jobApplicationsTable)
    .set({ status })
    .where(eq(jobApplicationsTable.id, id))
    .returning();

  if (!application) { res.status(404).json({ error: "Application not found" }); return; }
  res.json(application);
});

export default router;
