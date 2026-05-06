import { Router, type IRouter } from "express";
import { eq, sql, inArray } from "drizzle-orm";
import { db, learningRecommendationsTable, learningProgressTable, userSkillsTable } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

const DEFAULT_RECOMMENDATIONS = [
  { skill: "JavaScript", title: "JavaScript - The Complete Guide", type: "course", url: "https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/", provider: "Udemy", duration: "52h", priority: "high" },
  { skill: "React", title: "React - The Complete Guide", type: "course", url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", provider: "Udemy", duration: "48h", priority: "high" },
  { skill: "Python", title: "Python for Everybody", type: "course", url: "https://www.coursera.org/specializations/python", provider: "Coursera", duration: "32h", priority: "high" },
  { skill: "Data Structures", title: "Data Structures and Algorithms", type: "youtube", url: "https://www.youtube.com/watch?v=RBSGKlAvoiM", provider: "YouTube - freeCodeCamp", duration: "8h", priority: "high" },
  { skill: "System Design", title: "System Design Primer", type: "documentation", url: "https://github.com/donnemartin/system-design-primer", provider: "GitHub", duration: "Self-paced", priority: "medium" },
  { skill: "SQL", title: "Learn SQL", type: "platform", url: "https://www.codecademy.com/learn/learn-sql", provider: "Codecademy", duration: "9h", priority: "medium" },
  { skill: "TypeScript", title: "TypeScript Official Documentation", type: "documentation", url: "https://www.typescriptlang.org/docs/", provider: "TypeScript", duration: "Self-paced", priority: "medium" },
  { skill: "Node.js", title: "Node.js Backend Developer Roadmap", type: "roadmap", url: "https://roadmap.sh/nodejs", provider: "roadmap.sh", duration: "Self-paced", priority: "medium" },
  { skill: "Machine Learning", title: "Machine Learning Specialization", type: "course", url: "https://www.coursera.org/specializations/machine-learning-introduction", provider: "Coursera", duration: "88h", priority: "low" },
  { skill: "Docker", title: "Docker and Kubernetes", type: "youtube", url: "https://www.youtube.com/watch?v=bhBSlnQcq2k", provider: "YouTube - TechWorld", duration: "3h", priority: "low" },
];

// GET /learning/recommendations
router.get("/learning/recommendations", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  let recommendations = await db.select().from(learningRecommendationsTable)
    .where(eq(learningRecommendationsTable.userId, userId));

  if (recommendations.length === 0) {
    // Create default recommendations for user
    const inserted = await db.insert(learningRecommendationsTable).values(
      DEFAULT_RECOMMENDATIONS.map(r => ({ ...r, userId }))
    ).returning();
    recommendations = inserted;
  }

  res.json(recommendations);
});

// GET /learning/roadmap
router.get("/learning/roadmap", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const userSkills = await db.select().from(userSkillsTable).where(eq(userSkillsTable.userId, userId));
  const skillNames = userSkills.map(s => s.skill);

  const roadmap = {
    currentRole: "Student",
    targetRole: "Full Stack Developer",
    stages: [
      {
        stage: 1,
        title: "Foundation",
        skills: ["HTML", "CSS", "JavaScript"],
        completed: skillNames.some(s => ["html", "css", "javascript"].includes(s.toLowerCase())),
      },
      {
        stage: 2,
        title: "Frontend Development",
        skills: ["React", "TypeScript", "Tailwind CSS"],
        completed: skillNames.some(s => ["react", "typescript"].includes(s.toLowerCase())),
      },
      {
        stage: 3,
        title: "Backend Development",
        skills: ["Node.js", "Express", "REST APIs"],
        completed: skillNames.some(s => ["node.js", "express"].includes(s.toLowerCase())),
      },
      {
        stage: 4,
        title: "Database & DevOps",
        skills: ["PostgreSQL", "MongoDB", "Docker", "Git"],
        completed: false,
      },
      {
        stage: 5,
        title: "Advanced Topics",
        skills: ["System Design", "Cloud (AWS/GCP)", "CI/CD"],
        completed: false,
      },
    ],
  };

  res.json(roadmap);
});

// GET /learning/progress
router.get("/learning/progress", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  let [progress] = await db.select().from(learningProgressTable).where(eq(learningProgressTable.userId, userId));

  if (!progress) {
    [progress] = await db.insert(learningProgressTable).values({
      userId,
      streak: 0,
      completedItems: 0,
      weeklyGoal: 5,
      weeklyCompleted: 0,
    }).returning();
  }

  const completedRecs = await db.select().from(learningRecommendationsTable)
    .where(eq(learningRecommendationsTable.userId, userId))
    .where(eq(learningRecommendationsTable.completed, true));

  const allRecs = await db.select().from(learningRecommendationsTable)
    .where(eq(learningRecommendationsTable.userId, userId));

  res.json({
    ...progress,
    completedItems: completedRecs.length,
    totalItems: allRecs.length,
    completedIds: completedRecs.map(r => r.id),
  });
});

// POST /learning/progress
router.post("/learning/progress", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { recommendationId } = req.body;
  if (!recommendationId) {
    res.status(400).json({ error: "recommendationId required" });
    return;
  }

  await db.update(learningRecommendationsTable)
    .set({ completed: true })
    .where(eq(learningRecommendationsTable.id, recommendationId))
    .where(eq(learningRecommendationsTable.userId, userId));

  let [progress] = await db.select().from(learningProgressTable).where(eq(learningProgressTable.userId, userId));

  if (!progress) {
    [progress] = await db.insert(learningProgressTable).values({
      userId, streak: 1, completedItems: 1, weeklyGoal: 5, weeklyCompleted: 1,
    }).returning();
  } else {
    [progress] = await db.update(learningProgressTable).set({
      completedItems: sql`${learningProgressTable.completedItems} + 1`,
      weeklyCompleted: sql`${learningProgressTable.weeklyCompleted} + 1`,
      streak: sql`${learningProgressTable.streak} + 1`,
    }).where(eq(learningProgressTable.userId, userId)).returning();
  }

  const completedRecs = await db.select().from(learningRecommendationsTable)
    .where(eq(learningRecommendationsTable.userId, userId))
    .where(eq(learningRecommendationsTable.completed, true));

  const allRecs = await db.select().from(learningRecommendationsTable)
    .where(eq(learningRecommendationsTable.userId, userId));

  res.json({
    ...progress,
    completedItems: completedRecs.length,
    totalItems: allRecs.length,
    completedIds: completedRecs.map(r => r.id),
  });
});

export default router;
