import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const learningRecommendationsTable = pgTable("learning_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  skill: text("skill").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // course, youtube, documentation, platform, roadmap
  url: text("url").notNull(),
  provider: text("provider").notNull(),
  duration: text("duration"),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const learningProgressTable = pgTable("learning_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  streak: integer("streak").notNull().default(0),
  completedItems: integer("completed_items").notNull().default(0),
  weeklyGoal: integer("weekly_goal").notNull().default(5),
  weeklyCompleted: integer("weekly_completed").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLearningRecommendationSchema = createInsertSchema(learningRecommendationsTable).omit({ id: true, createdAt: true });
export type InsertLearningRecommendation = z.infer<typeof insertLearningRecommendationSchema>;
export type LearningRecommendation = typeof learningRecommendationsTable.$inferSelect;
