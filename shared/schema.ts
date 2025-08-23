import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
});

export const studies = pgTable("studies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull(),
  status: text("status").notNull().default("draft"), // draft, active, completed, paused
  consentForm: text("consent_form"),
  debriefMessage: text("debrief_message"),
  experimentBlocks: jsonb("experiment_blocks").notNull().default('[]'),
  conditions: jsonb("conditions").default('[]'),
  randomizeConditions: boolean("randomize_conditions").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const participants = pgTable("participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studyId: varchar("study_id").notNull(),
  sessionId: text("session_id").notNull(),
  status: text("status").notNull().default("started"), // started, consent_given, in_progress, completed, withdrawn
  currentBlock: integer("current_block").default(0),
  demographics: jsonb("demographics"),
  consentGiven: boolean("consent_given").default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  startedAt: timestamp("started_at").default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").notNull(),
  studyId: varchar("study_id").notNull(),
  blockId: text("block_id").notNull(),
  blockType: text("block_type").notNull(), // consent, demographics, stroop, image_recall, survey, debrief
  questionId: text("question_id"),
  response: jsonb("response").notNull(),
  responseTime: integer("response_time"), // milliseconds
  accuracy: boolean("accuracy"),
  stimulus: jsonb("stimulus"),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const insertStudySchema = createInsertSchema(studies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStudy = z.infer<typeof insertStudySchema>;
export type Study = typeof studies.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
