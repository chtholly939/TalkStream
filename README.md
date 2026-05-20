# TalkStream

TalkStream is a full-stack real-time chat and video calling app built with React, Express, MongoDB, Stream, Tailwind CSS, DaisyUI, TanStack Query, and Zustand.

It includes authentication, onboarding, friend management, direct chats, call history, video calls, theme switching, and a public landing page.

## Features

- Public landing page with theme switching
- Email/password authentication with JWT cookies
- Email OTP verification flow
- Protected app routes
- User onboarding and profile setup
- Friend discovery and friend requests
- Remove friends from the Friends page
- Real-time Stream Chat messaging
- Stream video calls
- Call history
- Responsive sidebar and mobile navigation
- 32 DaisyUI themes with persisted theme preference
- Toast notifications and loading states

## Tech Stack

**Frontend**

- React 19
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- DaisyUI
- Stream Chat React
- Stream Video React SDK
- Lucide React

**Backend**

- Node.js
- Express
- MongoDB with Mongoose
- JWT
- Cookie Parser
- Stream Chat server SDK
- Cloudinary config
- Nodemailer / Resend dependencies

## Project Structure

```text
TalkStream/
  backend/
    src/
      controllers/
      lib/
      middleware/
      models/
      routes/
      server.js
    .env.example
    package.json
  frontend/
    public/
    src/
      components/
      hooks/
      lib/
      pages/
      store/
    .env.example
    package.json
  README.md
  package.json
```

## Prerequisites

- Node.js
- npm
- MongoDB database URI
- Stream app API key and secret

## Environment Variables

Create `.env` files from the examples in both `backend` and `frontend`.

### Backend

Path: `backend/.env`

```env
PORT=5001
MONGO_URI=your_mongo_uri

STEAM_API_KEY=your_stream_api_key
STEAM_API_SECRET=your_stream_api_secret

JWT_SECRET_KEY=your_jwt_secret
NODE_ENV=development
```

Note: the current backend code reads Stream credentials from `STEAM_API_KEY` and `STEAM_API_SECRET`. Keep those exact names unless you also rename them in `backend/src/lib/stream.js`.

### Frontend

Path: `frontend/.env`

```env
VITE_STREAM_API_KEY=your_stream_api_key
```

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Development

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

The backend runs on the port configured in `backend/.env`, usually:

```text
http://localhost:5001
```

## Production Build

From the project root:

```bash
npm run build
npm start
```

The root build script installs backend and frontend dependencies, then builds the Vite frontend into `frontend/dist`. In production mode, the Express server serves the frontend build.

## Useful Scripts

Root:

```bash
npm run build
npm start
```

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## API Overview

Backend routes are mounted under `/api`.

- `/api/auth` - signup, login, logout, OTP, onboarding, current user
- `/api/users` - users, friends, friend requests, profile updates
- `/api/chat` - Stream chat token
- `/api/calls` - call logs

## Notes

- `.env` files are ignored by git. Do not commit real secrets.
- `frontend/public/TSlogo.png` is used as the TalkStream logo.
- CORS is configured for local Vite development and the deployed frontend URL in `backend/src/server.js`.
- The frontend build may warn about large chunks because Stream SDKs are substantial.
