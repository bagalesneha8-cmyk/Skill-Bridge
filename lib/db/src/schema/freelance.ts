import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const freelanceProjectsTable = pgTable("freelance_projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: text("budget").notNull(),
  skills: text("skills").array().notNull().default([]),
  deadline: text("deadline"),
  status: text("status").notNull().default("open"), // open, in_progress, completed, cancelled
  clientId: integer("client_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  bidCount: integer("bid_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const bidsTable = pgTable("bids", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => freelanceProjectsTable.id, { onDelete: "cascade" }),
  freelancerId: integer("freelancer_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  amount: text("amount").notNull(),
  proposal: text("proposal").notNull(),
  deliveryTime: text("delivery_time"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFreelanceProjectSchema = createInsertSchema(freelanceProjectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFreelanceProject = z.infer<typeof insertFreelanceProjectSchema>;
export type FreelanceProject = typeof freelanceProjectsTable.$inferSelect;

export const insertBidSchema = createInsertSchema(bidsTable).omit({ id: true, createdAt: true });
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bidsTable.$inferSelect;
