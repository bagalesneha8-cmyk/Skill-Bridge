import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, assessmentsTable, assessmentResultsTable, usersTable } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /assessments
router.get("/assessments", async (req, res): Promise<void> => {
  const { category } = req.query as Record<string, string>;

  let assessments;
  if (category) {
    assessments = await db.select().from(assessmentsTable).where(eq(assessmentsTable.category, category));
  } else {
    assessments = await db.select().from(assessmentsTable);
  }

  // Strip correct answers from questions
  res.json(assessments.map(a => ({
    ...a,
    questionCount: Array.isArray(a.questions) ? (a.questions as unknown[]).length : 0,
    questions: undefined,
  })));
});

// POST /assessments
router.post("/assessments", async (req, res): Promise<void> => {
  const { title, category, type, difficulty, duration, questions } = req.body;
  if (!title || !category || !type || !difficulty || !duration || !questions) {
    res.status(400).json({ error: "All fields required" });
    return;
  }

  const [assessment] = await db.insert(assessmentsTable).values({
    title, category, type, difficulty, duration, questions,
  }).returning();

  res.status(201).json({ ...assessment, questionCount: questions.length });
});

// GET /assessments/:id
router.get("/assessments/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [assessment] = await db.select().from(assessmentsTable).where(eq(assessmentsTable.id, id));
  if (!assessment) { res.status(404).json({ error: "Assessment not found" }); return; }

  const questions = (assessment.questions as Array<Record<string, unknown>>).map(q => ({
    id: q.id,
    text: q.text,
    options: q.options,
    type: q.type,
    // do not expose correctAnswer
  }));

  res.json({ ...assessment, questions });
});

// POST /assessments/:id/submit
router.post("/assessments/:id/submit", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [assessment] = await db.select().from(assessmentsTable).where(eq(assessmentsTable.id, id));
  if (!assessment) { res.status(404).json({ error: "Assessment not found" }); return; }

  const { answers } = req.body;
  const questions = assessment.questions as Array<Record<string, unknown>>;

  // Score calculation
  let correct = 0;
  for (const answer of (answers ?? [])) {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.correctAnswer === answer.answer) {
      correct++;
    }
  }

  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const passed = score >= 60;

  const [result] = await db.insert(assessmentResultsTable).values({
    assessmentId: id,
    userId,
    score,
    passed,
    certificate: passed ? `CERT-${userId}-${id}-${Date.now()}` : null,
  }).returning();

  // Award XP
  if (passed) {
    await db.update(usersTable).set({
      xp: sql`${usersTable.xp} + 50`,
    }).where(eq(usersTable.id, userId));
  }

  res.json({ ...result, assessment });
});

// GET /assessment-results
router.get("/assessment-results", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const results = await db.select({
    result: assessmentResultsTable,
    assessment: assessmentsTable,
  })
    .from(assessmentResultsTable)
    .innerJoin(assessmentsTable, eq(assessmentResultsTable.assessmentId, assessmentsTable.id))
    .where(eq(assessmentResultsTable.userId, userId))
    .orderBy(sql`${assessmentResultsTable.completedAt} desc`);

  res.json(results.map(r => ({ ...r.result, assessment: { ...r.assessment, questionCount: Array.isArray(r.assessment.questions) ? r.assessment.questions.length : 0, questions: undefined } })));
});

export default router;
