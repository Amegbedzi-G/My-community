# CreatorConnect - Premium Content Platform

A modern, responsive personal content platform leveraging cutting-edge UI/UX design principles to create an engaging social media experience. This platform enables content creators to monetize their content through subscriptions, premium content, and tip functionality.

## Getting Started

### Development

To start the development server:

```bash
npm run dev
```

### Deployment

Before deploying your application, run the following command to prepare your application for deployment:

```bash
node build.js
```

This will copy the necessary loader page to the deployment directory and build the application.

### Deployment Fixes

If you encounter 404 errors when deploying the application:

1. Make sure the `index.html` file exists in the root directory
2. Run `node copy-index.js` to copy the loader to the server/public directory
3. Deploy your application again

## Features

- User authentication with registration and login
- Content creation and sharing
- Premium content with paywall
- Subscription plans
- Direct messaging with pay-per-view functionality
- User requests system
- Admin dashboard
- Wallet and payment processing
- Mobile and desktop responsive design

## Technical Stack

- React frontend with TypeScript
- Express backend
- In-memory database (can be upgraded to PostgreSQL)
- Tailwind CSS for styling
- Shadcn UI components
- React Query for data fetching
- Zod for validation
- WebSockets for real-time features

## Admin Access

To access admin features, log in with the username "admin" (this user is automatically granted admin privileges).

## GitHub Repository

This project is available on GitHub at: https://github.com/Amegbedzi-G/My-community.git

## License

This project is licensed under the MIT License - see the LICENSE file for details.