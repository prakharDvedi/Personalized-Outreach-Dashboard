// db/schema.ts
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export type ProspectInput = {
  type:
    | "linkedin_screenshot"
    | "github_url"
    | "personal_website"
    | "company_website"
    | "url"
    | "free_text";
  rawValue: string;
  extractedText: string;
};

export type ConversationTurn = {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
};

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const offerings = pgTable("offerings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userPrompts = pgTable(
  "user_prompts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userPromptUserIdUnique: uniqueIndex("user_prompts_user_id_unique").on(
      table.userId,
    ),
  }),
);

export const prospects = pgTable("prospects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  extractedContext: text("extracted_context").notNull().default(""),
  inputs: jsonb("inputs").$type<ProspectInput[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  prospectId: uuid("prospect_id")
    .notNull()
    .references(() => prospects.id, { onDelete: "cascade" }),
  offeringId: uuid("offering_id")
    .notNull()
    .references(() => offerings.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  rating: integer("rating"),
  isFavourite: boolean("is_favourite").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    thread: jsonb("thread").$type<ConversationTurn[]>().notNull().default([]),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    conversationMessageIdUnique: uniqueIndex(
      "conversations_message_id_unique",
    ).on(table.messageId),
  }),
);

export const usersRelations = relations(users, ({ many, one }) => ({
  offerings: many(offerings),
  prompt: one(userPrompts),
  prospects: many(prospects),
  messages: many(messages),
}));

export const offeringsRelations = relations(offerings, ({ one, many }) => ({
  user: one(users, {
    fields: [offerings.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const userPromptsRelations = relations(userPrompts, ({ one }) => ({
  user: one(users, {
    fields: [userPrompts.userId],
    references: [users.id],
  }),
}));

export const prospectsRelations = relations(prospects, ({ one, many }) => ({
  user: one(users, {
    fields: [prospects.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  prospect: one(prospects, {
    fields: [messages.prospectId],
    references: [prospects.id],
  }),
  offering: one(offerings, {
    fields: [messages.offeringId],
    references: [offerings.id],
  }),
  conversation: one(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  message: one(messages, {
    fields: [conversations.messageId],
    references: [messages.id],
  }),
}));
