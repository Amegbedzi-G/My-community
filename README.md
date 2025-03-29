# Personal Content Platform

A modern, responsive personal content platform with Instagram-style feed, subscription plans, and monetization features.

## Features

- **User Authentication**: Secure login and registration system
- **Content Management**: Create, edit, and delete posts with media attachments
- **Premium Content**: Offer exclusive content through subscription plans
- **Monetization**: Multiple revenue streams including subscriptions, tips, and pay-per-view content
- **User Requests**: Allow users to submit special requests to the admin
- **Admin Dashboard**: Track statistics and manage content
- **Responsive Design**: Optimized for all devices from mobile to desktop

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI components
- **Backend**: Express.js
- **Database**: In-memory storage (expandable to PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Authentication**: Express-session with Passport.js
- **Routing**: Wouter for client-side routing

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/Amegbedzi-G/Personal-Community.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

- `client/`: Frontend React application
  - `src/components/`: Reusable UI components
  - `src/pages/`: Page components
  - `src/hooks/`: Custom React hooks
  - `src/lib/`: Utility functions and configurations
- `server/`: Backend Express application
  - `routes.ts`: API endpoints
  - `storage.ts`: Data storage implementation
  - `auth.ts`: Authentication logic
- `shared/`: Code shared between client and server
  - `schema.ts`: Database schema definitions

## Admin Access

The user with username "admin" automatically gets admin privileges in the system.

## License

[MIT](LICENSE)