import { Router, type IRouter } from "express";
import { User } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { createHash, randomBytes } from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  const salt = "skillsync_salt_2024";
  return createHash("sha256").update(password + salt).digest("hex");
}

function generateToken(userId: string): string {
  return `${userId}_${randomBytes(32).toString("hex")}`;
}

// POST /auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password, role, institution } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const user = await User.create({
    name,
    email,
    password: hashPassword(password),
    role,
    institution: institution ?? null,
  });

  const token = generateToken(user._id.toString());
  res.status(201).json({ user: sanitizeUser(user.toObject()), token });
});

// POST /auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user || user.password !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken(user._id.toString());
  res.json({ user: sanitizeUser(user.toObject()), token });
});

// POST /auth/logout
router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ message: "Logged out successfully" });
});

// GET /auth/me
router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(sanitizeUser(user.toObject()));
});

export function getUserIdFromToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const parts = token.split("_");
  const id = parts[0];
  return id || null;
}

function sanitizeUser(user: any) {
  const { password: _password, __v: _v, ...rest } = user;
  return { ...rest, id: user._id.toString() };
}

export default router;
