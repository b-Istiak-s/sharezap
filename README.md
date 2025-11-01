# ShareZap

This is a fullstack project with **Next.js** for the frontend and **Nest.js** for the backend. It uses [`concurrently`](https://www.npmjs.com/package/concurrently) to run both servers together.

![ShareZap Demo](media/sharezap.gif)

## Getting Started

### Install Dependencies

Install root dependencies (frontend + tooling):

```bash
npm install
# or
yarn
# or
pnpm install
```

Install backend dependencies (if backend has separate package.json):

```bash
cd backend
npm install
```

## Run Development Servers

Start both frontend and backend concurrently:

```bash
npm run dev
```

Next.js frontend will run on http://localhost:3000
Nest.js backend will run on http://localhost:3001

You can also run each individually:

```bash
npm run dev:next   # Frontend only
npm run dev:nest   # Backend only
```

## Build

build both projects:

```bash
npm run build
```

This will create:

- .next/ for Next.js
- backend/dist/ for Nest.js

## Start Production Servers

```bash
npm run start
```

Starts both frontend and backend using the compiled output.

## Linting & Formatting

Lint TypeScript files:

```bash
npm run lint
```

Format code using Prettier:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```
