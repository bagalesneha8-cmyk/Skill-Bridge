import { Router, type IRouter } from "express";
import { eq, ilike, sql } from "drizzle-orm";
import { db, usersTable, userSkillsTable } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /users
router.get("/users", async (req, res): Promise<void> => {
  const { role, page = "1", limit = "20" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = db.select().from(usersTable).$dynamic();
  if (role) {
    query = query.where(eq(usersTable.role, role));
  }

  const users = await query.limit(parseInt(limit)).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);

  res.json({
    users: users.map(sanitizeUser),
    total: Number(count),
    page: parseInt(page),
    limit: parseInt(limit),
  });
});

// GET /users/:id
router.get("/users/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(sanitizeUser(user));
});

// PATCH /users/:id
router.patch("/users/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { name, bio, institution, location, avatar } = req.body;

  const [user] = await db.update(usersTable)
    .set({ name, bio, institution, location, avatar })
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(sanitizeUser(user));
});

// GET /users/:id/skills
router.get("/users/:id/skills", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const skills = await db.select().from(userSkillsTable).where(eq(userSkillsTable.userId, id));
  res.json(skills);
});

// POST /users/:id/skills
router.post("/users/:id/skills", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { skill, level } = req.body;

  if (!skill || !level) {
    res.status(400).json({ error: "skill and level are required" });
    return;
  }

  const [newSkill] = await db.insert(userSkillsTable).values({
    userId: id,
    skill,
    level,
    verified: false,
  }).returning();

  res.status(201).json(newSkill);
});

function sanitizeUser(user: typeof usersTable.$inferSelect) {
  const { password: _password, ...rest } = user;
  return rest;
}

export default router;
