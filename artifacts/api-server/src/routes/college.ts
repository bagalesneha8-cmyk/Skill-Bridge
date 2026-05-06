import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, collegeFormsTable, formSubmissionsTable, announcementsTable, usersTable } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /college/forms
router.get("/college/forms", async (req, res): Promise<void> => {
  const { type, status } = req.query as Record<string, string>;

  let forms = db.select().from(collegeFormsTable).$dynamic();
  if (type) forms = forms.where(eq(collegeFormsTable.type, type));
  if (status) forms = forms.where(eq(collegeFormsTable.status, status));

  res.json(await forms.orderBy(sql`${collegeFormsTable.createdAt} desc`));
});

// POST /college/forms
router.post("/college/forms", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { title, type, description, deadline, fields } = req.body;
  if (!title || !type || !description) {
    res.status(400).json({ error: "title, type, description required" });
    return;
  }

  const [form] = await db.insert(collegeFormsTable).values({
    title, type, description, deadline,
    fields: fields ?? [],
    createdById: userId,
    status: "open",
  }).returning();

  res.status(201).json(form);
});

// GET /college/forms/:id
router.get("/college/forms/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [form] = await db.select().from(collegeFormsTable).where(eq(collegeFormsTable.id, id));
  if (!form) { res.status(404).json({ error: "Form not found" }); return; }
  res.json(form);
});

// GET /college/submissions
router.get("/college/submissions", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { formId, status } = req.query as Record<string, string>;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  let q;
  if (user.role === "faculty" || user.role === "admin") {
    q = db.select({
      submission: formSubmissionsTable,
      form: collegeFormsTable,
      submitter: usersTable,
    })
      .from(formSubmissionsTable)
      .innerJoin(collegeFormsTable, eq(formSubmissionsTable.formId, collegeFormsTable.id))
      .innerJoin(usersTable, eq(formSubmissionsTable.userId, usersTable.id)).$dynamic();

    if (formId) q = q.where(eq(formSubmissionsTable.formId, parseInt(formId, 10)));
    if (status) q = q.where(eq(formSubmissionsTable.status, status));

    const results = await q;
    res.json(results.map(r => ({
      ...r.submission,
      form: r.form,
      user: { ...r.submitter, password: undefined },
    })));
    return;
  }

  // Student: own submissions
  const results = await db.select({
    submission: formSubmissionsTable,
    form: collegeFormsTable,
  })
    .from(formSubmissionsTable)
    .innerJoin(collegeFormsTable, eq(formSubmissionsTable.formId, collegeFormsTable.id))
    .where(eq(formSubmissionsTable.userId, userId));

  res.json(results.map(r => ({ ...r.submission, form: r.form })));
});

// POST /college/submissions
router.post("/college/submissions", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { formId, data } = req.body;
  if (!formId) {
    res.status(400).json({ error: "formId required" });
    return;
  }

  const [submission] = await db.insert(formSubmissionsTable).values({
    formId, userId, data: data ?? {}, status: "pending",
  }).returning();

  await db.update(collegeFormsTable).set({
    submissionCount: sql`${collegeFormsTable.submissionCount} + 1`,
  }).where(eq(collegeFormsTable.id, formId));

  res.status(201).json(submission);
});

// PATCH /college/submissions/:id
router.patch("/college/submissions/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { status, feedback } = req.body;

  const [submission] = await db.update(formSubmissionsTable)
    .set({ status, feedback })
    .where(eq(formSubmissionsTable.id, id))
    .returning();

  if (!submission) { res.status(404).json({ error: "Submission not found" }); return; }
  res.json(submission);
});

// GET /college/announcements
router.get("/college/announcements", async (req, res): Promise<void> => {
  const announcements = await db.select()
    .from(announcementsTable)
    .orderBy(sql`${announcementsTable.createdAt} desc`)
    .limit(20);
  res.json(announcements);
});

// POST /college/announcements
router.post("/college/announcements", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { title, content, type } = req.body;
  if (!title || !content || !type) {
    res.status(400).json({ error: "title, content, type required" });
    return;
  }

  const [announcement] = await db.insert(announcementsTable).values({
    title, content, type, createdById: userId,
  }).returning();

  res.status(201).json(announcement);
});

export default router;
