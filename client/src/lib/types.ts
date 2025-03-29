// Interfaces and types shared across the frontend
import { User, Post, Message, Comment, Like, SubscriptionPlan, UserSubscription, Tip, PaymentRequest, PurchasedContent } from "@shared/schema";

// Enriched conversation with user data
export interface Conversation {
  userId: number;
  lastMessage: Message;
  user: Omit<User, "password">;
}

// Login credentials
export interface LoginCredentials {
  username: string;
  password: string;
}

// Register credentials
export interface RegisterCredentials {
  username: string;
  password: string;
  name: string;
}

// Tip options
export interface TipOption {
  amount: number;
  label: string;
}

// Payment methods
export type PaymentMethod = "PayPal" | "Card" | "Apple Pay" | "Bank Transfer" | "Crypto";

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalSubscribers: number;
  totalEarnings: number; // in cents
}

// Top-up amount options
export interface TopUpOption {
  amount: number;
  label: string;
}

// Admin post creation form data
export interface PostFormData {
  content: string;
  media_url: string;
  is_premium: boolean;
  premium_price: number;
}
