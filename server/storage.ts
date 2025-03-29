import {
  users, posts, comments, likes, subscriptionPlans, userSubscriptions,
  messages, tips, paymentRequests, purchasedContent, userRequests,
  type User, type InsertUser, type Post, type InsertPost,
  type Comment, type InsertComment, type Like, type InsertLike,
  type Message, type InsertMessage, type SubscriptionPlan, type InsertSubscriptionPlan,
  type UserSubscription, type InsertUserSubscription, type Tip, type InsertTip,
  type PaymentRequest, type InsertPaymentRequest, type PurchasedContent, type InsertPurchasedContent,
  type UserRequest, type InsertUserRequest
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Post operations
  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, data: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Comment operations
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Like operations
  getLikesByPostId(postId: number): Promise<Like[]>;
  getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(id: number): Promise<boolean>;
  
  // Subscription plan operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // User subscription operations
  getUserSubscriptionsByUserId(userId: number): Promise<UserSubscription[]>;
  getActiveUserSubscription(userId: number): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  cancelUserSubscription(id: number): Promise<boolean>;
  
  // Message operations
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  getConversations(userId: number): Promise<{userId: number, lastMessage: Message}[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  unlockMessage(id: number): Promise<Message | undefined>;
  
  // Tip operations
  createTip(tip: InsertTip): Promise<Tip>;
  getTipsByReceiverId(receiverId: number): Promise<Tip[]>;
  
  // Payment request operations
  createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest>;
  getPaymentRequestsByUserId(userId: number): Promise<PaymentRequest[]>;
  getAllPendingPaymentRequests(): Promise<PaymentRequest[]>;
  updatePaymentRequestStatus(id: number, status: string): Promise<PaymentRequest | undefined>;
  
  // Purchased content operations
  getPurchasedContentByUserId(userId: number): Promise<PurchasedContent[]>;
  hasPurchasedContent(userId: number, postId?: number, messageId?: number): Promise<boolean>;
  createPurchasedContent(purchase: InsertPurchasedContent): Promise<PurchasedContent>;
  
  // User request operations
  createUserRequest(request: InsertUserRequest): Promise<UserRequest>;
  getUserRequestsByUserId(userId: number): Promise<UserRequest[]>;
  getAllUserRequests(): Promise<UserRequest[]>;
  getUserRequestById(id: number): Promise<UserRequest | undefined>;
  updateUserRequest(id: number, data: Partial<UserRequest>): Promise<UserRequest | undefined>;
  getPublicUserRequests(): Promise<UserRequest[]>;
  
  // Stats for admin dashboard
  getTotalUsers(): Promise<number>;
  getTotalPosts(): Promise<number>;
  getTotalSubscribers(): Promise<number>;
  getTotalEarnings(): Promise<number>;
  
  // For authentication
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  private userSubscriptions: Map<number, UserSubscription>;
  private messages: Map<number, Message>;
  private tips: Map<number, Tip>;
  private paymentRequests: Map<number, PaymentRequest>;
  private purchasedContent: Map<number, PurchasedContent>;
  private userRequests: Map<number, UserRequest>;
  sessionStore: any;
  
  currentUserId: number;
  currentPostId: number;
  currentCommentId: number;
  currentLikeId: number;
  currentPlanId: number;
  currentSubscriptionId: number;
  currentMessageId: number;
  currentTipId: number;
  currentPaymentRequestId: number;
  currentPurchaseId: number;
  currentUserRequestId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.subscriptionPlans = new Map();
    this.userSubscriptions = new Map();
    this.messages = new Map();
    this.tips = new Map();
    this.paymentRequests = new Map();
    this.purchasedContent = new Map();
    this.userRequests = new Map();
    
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentCommentId = 1;
    this.currentLikeId = 1;
    this.currentPlanId = 1;
    this.currentSubscriptionId = 1;
    this.currentMessageId = 1;
    this.currentTipId = 1;
    this.currentPaymentRequestId = 1;
    this.currentPurchaseId = 1;
    this.currentUserRequestId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Seed subscription plans
    this.seedSubscriptionPlans();
  }
  
  private seedSubscriptionPlans() {
    this.createSubscriptionPlan({
      name: "Weekly Plan",
      duration: "weekly",
      price: 799, // $7.99
      features: ["Access to all premium content", "Direct messaging", "Weekly exclusive updates", "Cancel anytime"]
    });
    
    this.createSubscriptionPlan({
      name: "Monthly Plan",
      duration: "monthly",
      price: 2499, // $24.99
      features: ["Access to all premium content", "Direct messaging", "Monthly exclusive updates", "22% savings compared to weekly", "Cancel anytime"]
    });
    
    this.createSubscriptionPlan({
      name: "Yearly Plan",
      duration: "yearly",
      price: 19999, // $199.99
      features: ["Access to all premium content", "Direct messaging", "Yearly exclusive updates", "33% savings compared to monthly", "Cancel anytime"]
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      bio: "",
      role: insertUser.username === "admin" ? "admin" : "user",
      wallet_balance: 0,
      is_verified: false,
      avatar_url: "",
      created_at: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Post operations
  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const now = new Date();
    const newPost: Post = {
      ...post,
      id,
      created_at: now
    };
    this.posts.set(id, newPost);
    return newPost;
  }
  
  async updatePost(id: number, data: Partial<Post>): Promise<Post | undefined> {
    const post = await this.getPostById(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...data };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
  
  // Comment operations
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.post_id === postId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const now = new Date();
    const newComment: Comment = {
      ...comment,
      id,
      created_at: now
    };
    this.comments.set(id, newComment);
    return newComment;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }
  
  // Like operations
  async getLikesByPostId(postId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => like.post_id === postId);
  }
  
  async getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(
      like => like.user_id === userId && like.post_id === postId
    );
  }
  
  async createLike(like: InsertLike): Promise<Like> {
    const id = this.currentLikeId++;
    const now = new Date();
    const newLike: Like = {
      ...like,
      id,
      created_at: now
    };
    this.likes.set(id, newLike);
    return newLike;
  }
  
  async deleteLike(id: number): Promise<boolean> {
    return this.likes.delete(id);
  }
  
  // Subscription plan operations
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }
  
  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }
  
  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.currentPlanId++;
    const newPlan: SubscriptionPlan = {
      ...plan,
      id
    };
    this.subscriptionPlans.set(id, newPlan);
    return newPlan;
  }
  
  // User subscription operations
  async getUserSubscriptionsByUserId(userId: number): Promise<UserSubscription[]> {
    return Array.from(this.userSubscriptions.values())
      .filter(sub => sub.user_id === userId)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }
  
  async getActiveUserSubscription(userId: number): Promise<UserSubscription | undefined> {
    const now = new Date();
    return Array.from(this.userSubscriptions.values()).find(
      sub => sub.user_id === userId && 
             sub.is_active === true && 
             new Date(sub.end_date) > now
    );
  }
  
  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const id = this.currentSubscriptionId++;
    const now = new Date();
    const newSubscription: UserSubscription = {
      ...subscription,
      id,
      start_date: now,
      is_active: true
    };
    this.userSubscriptions.set(id, newSubscription);
    return newSubscription;
  }
  
  async cancelUserSubscription(id: number): Promise<boolean> {
    const subscription = this.userSubscriptions.get(id);
    if (!subscription) return false;
    
    subscription.is_active = false;
    this.userSubscriptions.set(id, subscription);
    return true;
  }
  
  // Message operations
  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.sender_id === userId1 && message.receiver_id === userId2) ||
        (message.sender_id === userId2 && message.receiver_id === userId1)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  
  async getConversations(userId: number): Promise<{userId: number, lastMessage: Message}[]> {
    const userMessages = Array.from(this.messages.values())
      .filter(message => message.sender_id === userId || message.receiver_id === userId);
    
    const conversations = new Map<number, Message>();
    
    userMessages.forEach(message => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const existingMessage = conversations.get(otherUserId);
      
      if (!existingMessage || new Date(message.created_at) > new Date(existingMessage.created_at)) {
        conversations.set(otherUserId, message);
      }
    });
    
    return Array.from(conversations.entries())
      .map(([userId, lastMessage]) => ({ userId, lastMessage }))
      .sort((a, b) => 
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const newMessage: Message = {
      ...message,
      id,
      is_unlocked: !message.is_ppv, // Free messages are unlocked by default
      created_at: now
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async unlockMessage(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    message.is_unlocked = true;
    this.messages.set(id, message);
    return message;
  }
  
  // Tip operations
  async createTip(tip: InsertTip): Promise<Tip> {
    const id = this.currentTipId++;
    const now = new Date();
    const newTip: Tip = {
      ...tip,
      id,
      created_at: now
    };
    this.tips.set(id, newTip);
    return newTip;
  }
  
  async getTipsByReceiverId(receiverId: number): Promise<Tip[]> {
    return Array.from(this.tips.values())
      .filter(tip => tip.receiver_id === receiverId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  // Payment request operations
  async createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest> {
    const id = this.currentPaymentRequestId++;
    const now = new Date();
    const newRequest: PaymentRequest = {
      ...request,
      id,
      status: "pending",
      created_at: now,
      updated_at: now
    };
    this.paymentRequests.set(id, newRequest);
    return newRequest;
  }
  
  async getPaymentRequestsByUserId(userId: number): Promise<PaymentRequest[]> {
    return Array.from(this.paymentRequests.values())
      .filter(request => request.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  async getAllPendingPaymentRequests(): Promise<PaymentRequest[]> {
    return Array.from(this.paymentRequests.values())
      .filter(request => request.status === "pending")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  
  async updatePaymentRequestStatus(id: number, status: string): Promise<PaymentRequest | undefined> {
    const request = this.paymentRequests.get(id);
    if (!request) return undefined;
    
    const now = new Date();
    const updatedRequest = { 
      ...request, 
      status, 
      updated_at: now
    };
    this.paymentRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Purchased content operations
  async getPurchasedContentByUserId(userId: number): Promise<PurchasedContent[]> {
    return Array.from(this.purchasedContent.values())
      .filter(purchase => purchase.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  async hasPurchasedContent(userId: number, postId?: number, messageId?: number): Promise<boolean> {
    return Array.from(this.purchasedContent.values()).some(
      purchase => 
        purchase.user_id === userId && 
        ((postId && purchase.post_id === postId) || 
         (messageId && purchase.message_id === messageId))
    );
  }
  
  async createPurchasedContent(purchase: InsertPurchasedContent): Promise<PurchasedContent> {
    const id = this.currentPurchaseId++;
    const now = new Date();
    const newPurchase: PurchasedContent = {
      ...purchase,
      id,
      created_at: now
    };
    this.purchasedContent.set(id, newPurchase);
    return newPurchase;
  }
  
  // User request operations
  async createUserRequest(request: InsertUserRequest): Promise<UserRequest> {
    const id = this.currentUserRequestId++;
    const now = new Date();
    const newRequest: UserRequest = {
      ...request,
      id,
      status: "pending",
      admin_response: null,
      is_public: request.is_public ?? false,
      created_at: now,
      updated_at: now
    };
    this.userRequests.set(id, newRequest);
    return newRequest;
  }
  
  async getUserRequestsByUserId(userId: number): Promise<UserRequest[]> {
    return Array.from(this.userRequests.values())
      .filter(request => request.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  async getAllUserRequests(): Promise<UserRequest[]> {
    return Array.from(this.userRequests.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  async getUserRequestById(id: number): Promise<UserRequest | undefined> {
    return this.userRequests.get(id);
  }
  
  async updateUserRequest(id: number, data: Partial<UserRequest>): Promise<UserRequest | undefined> {
    const request = this.userRequests.get(id);
    if (!request) return undefined;
    
    const now = new Date();
    const updatedRequest = { 
      ...request, 
      ...data,
      updated_at: now
    };
    this.userRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async getPublicUserRequests(): Promise<UserRequest[]> {
    return Array.from(this.userRequests.values())
      .filter(request => request.is_public)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  // Stats for admin dashboard
  async getTotalUsers(): Promise<number> {
    return this.users.size;
  }
  
  async getTotalPosts(): Promise<number> {
    return this.posts.size;
  }
  
  async getTotalSubscribers(): Promise<number> {
    const now = new Date();
    return Array.from(this.userSubscriptions.values()).filter(
      sub => sub.is_active && new Date(sub.end_date) > now
    ).length;
  }
  
  async getTotalEarnings(): Promise<number> {
    let total = 0;
    
    // Add subscription earnings
    total += Array.from(this.userSubscriptions.values()).reduce(
      (sum, sub) => {
        const plan = this.subscriptionPlans.get(sub.plan_id);
        return sum + (plan ? plan.price : 0);
      },
      0
    );
    
    // Add tip earnings
    total += Array.from(this.tips.values()).reduce(
      (sum, tip) => sum + tip.amount,
      0
    );
    
    // Add purchased content earnings
    total += Array.from(this.purchasedContent.values()).reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );
    
    return total;
  }
  

}

export const storage = new MemStorage();
