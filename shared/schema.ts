import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio").default(""),
  role: text("role").default("user").notNull(),
  wallet_balance: integer("wallet_balance").default(0).notNull(),
  is_verified: boolean("is_verified").default(false).notNull(),
  avatar_url: text("avatar_url").default(""),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Post schema
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  content: text("content").notNull(),
  media_url: text("media_url").notNull(),
  is_premium: boolean("is_premium").default(false).notNull(),
  premium_price: integer("premium_price").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Comments schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  post_id: integer("post_id").notNull(),
  user_id: integer("user_id").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Likes schema
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  post_id: integer("post_id").notNull(),
  user_id: integer("user_id").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Subscription plans schema
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  duration: text("duration").notNull(), // weekly, monthly, yearly
  price: integer("price").notNull(), // in cents
  features: jsonb("features").default([]),
});

// User subscriptions schema
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  plan_id: integer("plan_id").notNull(),
  start_date: timestamp("start_date").defaultNow().notNull(),
  end_date: timestamp("end_date").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sender_id: integer("sender_id").notNull(),
  receiver_id: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  is_ppv: boolean("is_ppv").default(false).notNull(),
  ppv_price: integer("ppv_price").default(0),
  is_unlocked: boolean("is_unlocked").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Tips schema
export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  sender_id: integer("sender_id").notNull(),
  receiver_id: integer("receiver_id").notNull(),
  amount: integer("amount").notNull(),
  post_id: integer("post_id"),
  message_id: integer("message_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Payment requests schema
export const paymentRequests = pgTable("payment_requests", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  payment_method: text("payment_method").notNull(),
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Purchased content schema
export const purchasedContent = pgTable("purchased_content", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  post_id: integer("post_id"),
  message_id: integer("message_id"),
  amount: integer("amount").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  user_id: true,
  content: true,
  media_url: true,
  is_premium: true,
  premium_price: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  post_id: true,
  user_id: true,
  content: true,
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  post_id: true,
  user_id: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sender_id: true,
  receiver_id: true,
  content: true,
  is_ppv: true,
  ppv_price: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  duration: true,
  price: true,
  features: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).pick({
  user_id: true,
  plan_id: true,
  end_date: true,
});

export const insertTipSchema = createInsertSchema(tips).pick({
  sender_id: true,
  receiver_id: true,
  amount: true,
  post_id: true,
  message_id: true,
});

export const insertPaymentRequestSchema = createInsertSchema(paymentRequests).pick({
  user_id: true,
  amount: true,
  payment_method: true,
});

export const insertPurchasedContentSchema = createInsertSchema(purchasedContent).pick({
  user_id: true,
  post_id: true,
  message_id: true,
  amount: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

export type InsertTip = z.infer<typeof insertTipSchema>;
export type Tip = typeof tips.$inferSelect;

export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;
export type PaymentRequest = typeof paymentRequests.$inferSelect;

export type InsertPurchasedContent = z.infer<typeof insertPurchasedContentSchema>;
export type PurchasedContent = typeof purchasedContent.$inferSelect;
