import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { uploadProfile, uploadPostMedia, getFileUrl } from "./upload";
import {
  insertPostSchema, insertCommentSchema, insertLikeSchema,
  insertMessageSchema, insertTipSchema, insertPaymentRequestSchema,
  insertPurchasedContentSchema, insertUserSubscriptionSchema, insertUserRequestSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up authentication routes
  setupAuth(app);

  // File upload routes
  
  // POST /api/upload/profile - Upload profile picture
  app.post("/api/upload/profile", uploadProfile.single("profileImage"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    try {
      // Get file path that can be accessed via URL
      const fileUrl = getFileUrl(req.file.filename, "profile");
      
      // Update user profile with avatar URL
      await storage.updateUser(req.user.id, {
        avatar_url: fileUrl
      });
      
      res.json({ 
        url: fileUrl,
        message: "Profile picture uploaded successfully" 
      });
    } catch (err) {
      res.status(500).json({ message: "Error uploading profile picture" });
    }
  });
  
  // POST /api/upload/post - Upload post media
  app.post("/api/upload/post", uploadPostMedia.single("postMedia"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    // Only admin can upload post media
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can upload post media" });
    }
    
    try {
      // Get file path that can be accessed via URL
      const fileUrl = getFileUrl(req.file.filename, "post");
      
      res.json({ 
        url: fileUrl,
        message: "Post media uploaded successfully" 
      });
    } catch (err) {
      res.status(500).json({ message: "Error uploading post media" });
    }
  });

  // GET /api/posts - get all posts
  app.get("/api/posts", async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  // GET /api/posts/:id - get post by id
  app.get("/api/posts/:id", async (req, res) => {
    const postId = parseInt(req.params.id);
    const post = await storage.getPostById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    res.json(post);
  });

  // POST /api/posts - create a new post
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        user_id: req.user.id
      });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Error creating post" });
    }
  });

  // DELETE /api/posts/:id - delete a post
  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const postId = parseInt(req.params.id);
    const post = await storage.getPostById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Only post owner or admin can delete
    if (post.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    await storage.deletePost(postId);
    res.status(200).json({ message: "Post deleted" });
  });

  // GET /api/posts/:id/comments - get comments for a post
  app.get("/api/posts/:id/comments", async (req, res) => {
    const postId = parseInt(req.params.id);
    const comments = await storage.getCommentsByPostId(postId);
    res.json(comments);
  });

  // POST /api/posts/:id/comments - add comment to a post
  app.post("/api/posts/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        post_id: postId,
        user_id: req.user.id,
        content: req.body.content
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Error creating comment" });
    }
  });

  // POST /api/posts/:id/like - like a post
  app.post("/api/posts/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user already liked the post
      const existingLike = await storage.getLikeByUserAndPost(req.user.id, postId);
      if (existingLike) {
        return res.status(400).json({ message: "Already liked" });
      }
      
      const likeData = insertLikeSchema.parse({
        post_id: postId,
        user_id: req.user.id
      });
      
      const like = await storage.createLike(likeData);
      res.status(201).json(like);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Error liking post" });
    }
  });

  // DELETE /api/posts/:id/like - unlike a post
  app.delete("/api/posts/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const postId = parseInt(req.params.id);
    const existingLike = await storage.getLikeByUserAndPost(req.user.id, postId);
    
    if (!existingLike) {
      return res.status(404).json({ message: "Like not found" });
    }
    
    await storage.deleteLike(existingLike.id);
    res.status(200).json({ message: "Post unliked" });
  });

  // GET /api/users/:id - get user profile
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // PUT /api/users/:id - update user profile
  app.put("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = parseInt(req.params.id);
    
    // Only the user or admin can update profile
    if (userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Don't allow role changes except by admin
    if (req.body.role && req.user.role !== "admin") {
      delete req.body.role;
    }
    
    // Don't allow wallet balance updates through this endpoint
    delete req.body.wallet_balance;
    
    try {
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // GET /api/users/:id/posts - get posts by user
  app.get("/api/users/:id/posts", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const posts = await storage.getPostsByUserId(userId);
    res.json(posts);
  });

  // GET /api/subscription-plans - get all subscription plans
  app.get("/api/subscription-plans", async (req, res) => {
    const plans = await storage.getSubscriptionPlans();
    res.json(plans);
  });

  // POST /api/subscribe - subscribe to a plan
  app.post("/api/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { plan_id } = req.body;
      const planId = parseInt(plan_id);
      
      // Validate the plan exists
      const plan = await storage.getSubscriptionPlanById(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Check user wallet balance
      if (req.user.wallet_balance < plan.price) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      // Calculate end date based on plan duration
      const endDate = new Date();
      if (plan.duration === "weekly") {
        endDate.setDate(endDate.getDate() + 7);
      } else if (plan.duration === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.duration === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      // Create subscription
      const subscriptionData = insertUserSubscriptionSchema.parse({
        user_id: req.user.id,
        plan_id: planId,
        end_date: endDate
      });
      
      const subscription = await storage.createUserSubscription(subscriptionData);
      
      // Deduct from user's wallet
      await storage.updateUser(req.user.id, {
        wallet_balance: req.user.wallet_balance - plan.price
      });
      
      res.status(201).json(subscription);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Error creating subscription" });
    }
  });

  // GET /api/subscriptions - get user's subscriptions
  app.get("/api/subscriptions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const subscriptions = await storage.getUserSubscriptionsByUserId(req.user.id);
    res.json(subscriptions);
  });

  // GET /api/active-subscription - check if user has active subscription
  app.get("/api/active-subscription", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const subscription = await storage.getActiveUserSubscription(req.user.id);
    
    if (!subscription) {
      return res.json({ subscribed: false });
    }
    
    const plan = await storage.getSubscriptionPlanById(subscription.plan_id);
    res.json({ 
      subscribed: true, 
      subscription, 
      plan 
    });
  });

  // POST /api/messages - send a message
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { receiver_id, content, is_ppv, ppv_price } = req.body;
      const receiverId = parseInt(receiver_id);
      
      // Verify receiver exists
      const receiver = await storage.getUser(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Check if user is admin or subscribed to send messages
      const isAdmin = req.user.role === "admin";
      const receiverIsAdmin = receiver.role === "admin";
      
      if (!isAdmin && receiverIsAdmin) {
        // Non-admin messaging admin - check subscription
        const subscription = await storage.getActiveUserSubscription(req.user.id);
        if (!subscription) {
          return res.status(403).json({ message: "You must be subscribed to message the creator" });
        }
      }
      
      // Only admin can send PPV messages
      if (is_ppv && req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admin can send PPV messages" });
      }
      
      const messageData = insertMessageSchema.parse({
        sender_id: req.user.id,
        receiver_id: receiverId,
        content,
        is_ppv: Boolean(is_ppv),
        ppv_price: is_ppv ? parseInt(ppv_price) : 0
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Error sending message" });
    }
  });

  // GET /api/messages/:userId - get messages with a user
  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const otherUserId = parseInt(req.params.userId);
    const messages = await storage.getMessagesBetweenUsers(req.user.id, otherUserId);
    res.json(messages);
  });

  // GET /api/conversations - get all conversations
  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const conversations = await storage.getConversations(req.user.id);
    
    // Enrich with user data
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await storage.getUser(conv.userId);
        const { password, ...userWithoutPassword } = user || { 
          id: conv.userId,
          username: "Unknown User",
          password: ""
        };
        return {
          ...conv,
          user: userWithoutPassword
        };
      })
    );
    
    res.json(enrichedConversations);
  });

  // POST /api/messages/:id/unlock - unlock a PPV message
  app.post("/api/messages/:id/unlock", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessagesBetweenUsers(req.user.id, req.user.id)
        .then(messages => messages.find(m => m.id === messageId));
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      if (!message.is_ppv) {
        return res.status(400).json({ message: "Message is not pay-per-view" });
      }
      
      if (message.is_unlocked) {
        return res.status(400).json({ message: "Message is already unlocked" });
      }
      
      // Check if already purchased
      const alreadyPurchased = await storage.hasPurchasedContent(req.user.id, undefined, messageId);
      if (alreadyPurchased) {
        await storage.unlockMessage(messageId);
        return res.json({ message: "Message unlocked" });
      }
      
      // Check wallet balance
      if (req.user.wallet_balance < message.ppv_price) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      // Create purchase record
      const purchaseData = insertPurchasedContentSchema.parse({
        user_id: req.user.id,
        message_id: messageId,
        amount: message.ppv_price
      });
      
      await storage.createPurchasedContent(purchaseData);
      
      // Deduct from user's wallet
      await storage.updateUser(req.user.id, {
        wallet_balance: req.user.wallet_balance - message.ppv_price
      });
      
      // Add to admin's wallet
      const admin = await storage.getUserByUsername("admin");
      if (admin) {
        await storage.updateUser(admin.id, {
          wallet_balance: admin.wallet_balance + message.ppv_price
        });
      }
      
      // Unlock the message
      await storage.unlockMessage(messageId);
      
      res.json({ message: "Message unlocked" });
    } catch (err) {
      res.status(500).json({ message: "Error unlocking message" });
    }
  });

  // POST /api/posts/:id/unlock - unlock premium content
  app.post("/api/posts/:id/unlock", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (!post.is_premium) {
        return res.status(400).json({ message: "Post is not premium content" });
      }
      
      // Check if already purchased
      const alreadyPurchased = await storage.hasPurchasedContent(req.user.id, postId);
      if (alreadyPurchased) {
        return res.json({ message: "Content already unlocked" });
      }
      
      // Check wallet balance
      if (req.user.wallet_balance < post.premium_price) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      // Create purchase record
      const purchaseData = insertPurchasedContentSchema.parse({
        user_id: req.user.id,
        post_id: postId,
        amount: post.premium_price
      });
      
      await storage.createPurchasedContent(purchaseData);
      
      // Deduct from user's wallet
      await storage.updateUser(req.user.id, {
        wallet_balance: req.user.wallet_balance - post.premium_price
      });
      
      // Add to admin's wallet
      const admin = await storage.getUserByUsername("admin");
      if (admin) {
        await storage.updateUser(admin.id, {
          wallet_balance: admin.wallet_balance + post.premium_price
        });
      }
      
      res.json({ message: "Content unlocked" });
    } catch (err) {
      res.status(500).json({ message: "Error unlocking content" });
    }
  });

  // POST /api/tips - send a tip
  app.post("/api/tips", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { receiver_id, amount, post_id, message_id } = req.body;
      const receiverId = parseInt(receiver_id);
      const tipAmount = parseInt(amount);
      
      // Verify receiver exists
      const receiver = await storage.getUser(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Check if user is verified (for tipping)
      if (!req.user.is_verified) {
        return res.status(403).json({ message: "Only verified users can send tips" });
      }
      
      // Check wallet balance
      if (req.user.wallet_balance < tipAmount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      // Create tip record
      const tipData = insertTipSchema.parse({
        sender_id: req.user.id,
        receiver_id: receiverId,
        amount: tipAmount,
        post_id: post_id ? parseInt(post_id) : undefined,
        message_id: message_id ? parseInt(message_id) : undefined
      });
      
      const tip = await storage.createTip(tipData);
      
      // Deduct from sender's wallet
      await storage.updateUser(req.user.id, {
        wallet_balance: req.user.wallet_balance - tipAmount
      });
      
      // Add to receiver's wallet
      await storage.updateUser(receiverId, {
        wallet_balance: receiver.wallet_balance + tipAmount
      });
      
      res.status(201).json(tip);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Error sending tip" });
    }
  });

  // POST /api/payment-requests - request wallet top-up
  app.post("/api/payment-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount, payment_method } = req.body;
      const paymentAmount = parseInt(amount);
      
      if (paymentAmount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
      }
      
      const requestData = insertPaymentRequestSchema.parse({
        user_id: req.user.id,
        amount: paymentAmount,
        payment_method
      });
      
      const request = await storage.createPaymentRequest(requestData);
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Error creating payment request" });
    }
  });

  // GET /api/payment-requests - get user's payment requests
  app.get("/api/payment-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const requests = await storage.getPaymentRequestsByUserId(req.user.id);
    res.json(requests);
  });

  // GET /api/admin/payment-requests - get all pending payment requests (admin only)
  app.get("/api/admin/payment-requests", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    
    const requests = await storage.getAllPendingPaymentRequests();
    
    // Enrich with user data
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const user = await storage.getUser(request.user_id);
        const { password, ...userWithoutPassword } = user || { 
          id: request.user_id,
          username: "Unknown User",
          password: ""
        };
        return {
          ...request,
          user: userWithoutPassword
        };
      })
    );
    
    res.json(enrichedRequests);
  });

  // PUT /api/admin/payment-requests/:id - approve/reject a payment request (admin only)
  app.put("/api/admin/payment-requests/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (status !== "approved" && status !== "rejected") {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedRequest = await storage.updatePaymentRequestStatus(requestId, status);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Payment request not found" });
      }
      
      // If approved, add funds to the user's wallet
      if (status === "approved") {
        const user = await storage.getUser(updatedRequest.user_id);
        if (user) {
          await storage.updateUser(user.id, {
            wallet_balance: user.wallet_balance + updatedRequest.amount
          });
        }
      }
      
      res.json(updatedRequest);
    } catch (err) {
      res.status(500).json({ message: "Error updating payment request" });
    }
  });

  // GET /api/wallet - get user's wallet balance
  app.get("/api/wallet", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ balance: user.wallet_balance });
  });

  // PUT /api/verify-user/:id - verify a user (admin only)
  app.put("/api/verify-user/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        is_verified: true
      });
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = updatedUser || {};
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: "Error verifying user" });
    }
  });

  // GET /api/admin/stats - get admin dashboard stats
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(403);
    }
    
    try {
      const totalUsers = await storage.getTotalUsers();
      const totalPosts = await storage.getTotalPosts();
      const totalSubscribers = await storage.getTotalSubscribers();
      const totalEarnings = await storage.getTotalEarnings();
      
      res.json({
        totalUsers,
        totalPosts,
        totalSubscribers,
        totalEarnings
      });
    } catch (err) {
      res.status(500).json({ message: "Error getting stats" });
    }
  });

  // Check if content is purchased
  app.get("/api/purchased-content", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { post_id, message_id } = req.query;
      
      let postId, messageId;
      if (post_id) postId = parseInt(post_id as string);
      if (message_id) messageId = parseInt(message_id as string);
      
      if (!postId && !messageId) {
        return res.status(400).json({ message: "Either post_id or message_id is required" });
      }
      
      const purchased = await storage.hasPurchasedContent(req.user.id, postId, messageId);
      res.json({ purchased });
    } catch (err) {
      res.status(500).json({ message: "Error checking purchased content" });
    }
  });

  // User Request Routes
  
  // POST /api/requests - create a new user request
  app.post("/api/requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const requestData = insertUserRequestSchema.parse({
        ...req.body,
        user_id: req.user.id
      });
      
      const userRequest = await storage.createUserRequest(requestData);
      res.status(201).json(userRequest);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      res.status(500).json({ message: "Error creating request" });
    }
  });
  
  // GET /api/requests - get user's requests or all requests for admin
  app.get("/api/requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role === "admin") {
      // Admin can see all requests
      const requests = await storage.getAllUserRequests();
      res.json(requests);
    } else {
      // Users can only see their own requests
      const requests = await storage.getUserRequestsByUserId(req.user.id);
      res.json(requests);
    }
  });
  
  // GET /api/requests/public - get all public requests
  app.get("/api/requests/public", async (req, res) => {
    const requests = await storage.getPublicUserRequests();
    res.json(requests);
  });
  
  // GET /api/requests/:id - get a specific request
  app.get("/api/requests/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const requestId = parseInt(req.params.id);
    const userRequest = await storage.getUserRequestById(requestId);
    
    if (!userRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    // Users can only view their own requests or public ones, admin can view all
    if (userRequest.user_id !== req.user.id && req.user.role !== "admin" && !userRequest.is_public) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json(userRequest);
  });
  
  // PUT /api/requests/:id - update a request (admin only or your own request)
  app.put("/api/requests/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const requestId = parseInt(req.params.id);
    const userRequest = await storage.getUserRequestById(requestId);
    
    if (!userRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    // Only admin can update status and response
    if (req.user.role !== "admin") {
      if (userRequest.user_id !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Regular users can only update title, description, and is_public
      const allowedFields = ["title", "description", "is_public"];
      Object.keys(req.body).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete req.body[key];
        }
      });
    }
    
    try {
      const updatedRequest = await storage.updateUserRequest(requestId, req.body);
      res.json(updatedRequest);
    } catch (err) {
      res.status(500).json({ message: "Error updating request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
