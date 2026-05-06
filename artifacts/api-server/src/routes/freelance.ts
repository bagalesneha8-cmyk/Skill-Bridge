import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, freelanceProjectsTable, bidsTable, usersTable } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /freelance/projects
router.get("/freelance/projects", async (req, res): Promise<void> => {
  const { status, page = "1" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * 20;

  let projects;
  if (status) {
    projects = await db.select().from(freelanceProjectsTable)
      .where(eq(freelanceProjectsTable.status, status))
      .orderBy(sql`${freelanceProjectsTable.createdAt} desc`)
      .limit(20).offset(offset);
  } else {
    projects = await db.select().from(freelanceProjectsTable)
      .orderBy(sql`${freelanceProjectsTable.createdAt} desc`)
      .limit(20).offset(offset);
  }

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(freelanceProjectsTable);

  res.json({ projects, total: Number(count), page: parseInt(page) });
});

// POST /freelance/projects
router.post("/freelance/projects", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { title, description, budget, skills, deadline } = req.body;
  if (!title || !description || !budget) {
    res.status(400).json({ error: "title, description, budget required" });
    return;
  }

  const [project] = await db.insert(freelanceProjectsTable).values({
    title, description, budget,
    skills: skills ?? [],
    deadline,
    clientId: userId,
    status: "open",
  }).returning();

  res.status(201).json(project);
});

// GET /freelance/projects/:id
router.get("/freelance/projects/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [project] = await db.select().from(freelanceProjectsTable).where(eq(freelanceProjectsTable.id, id));
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  res.json(project);
});

// GET /freelance/projects/:id/bids
router.get("/freelance/projects/:id/bids", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

  const bids = await db.select({
    bid: bidsTable,
    freelancer: usersTable,
  })
    .from(bidsTable)
    .innerJoin(usersTable, eq(bidsTable.freelancerId, usersTable.id))
    .where(eq(bidsTable.projectId, id));

  res.json(bids.map(b => ({
    ...b.bid,
    freelancer: { ...b.freelancer, password: undefined },
  })));
});

// POST /freelance/projects/:id/bids
router.post("/freelance/projects/:id/bids", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { amount, proposal, deliveryTime } = req.body;

  if (!amount || !proposal) {
    res.status(400).json({ error: "amount and proposal required" });
    return;
  }

  const [bid] = await db.insert(bidsTable).values({
    projectId: id,
    freelancerId: userId,
    amount, proposal, deliveryTime,
    status: "pending",
  }).returning();

  await db.update(freelanceProjectsTable).set({
    bidCount: sql`${freelanceProjectsTable.bidCount} + 1`,
  }).where(eq(freelanceProjectsTable.id, id));

  res.status(201).json(bid);
});

export default router;
