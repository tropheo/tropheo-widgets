# Examples

This directory contains complete example implementations of Tropheo Widgets in different environments.

## Available Examples

### [HTML Example](./html)

Demonstrates vanilla JavaScript integration using a local bundle. Perfect for:

- Static websites
- Content management systems (WordPress, Drupal, etc.)
- Simple HTML pages
- No build tools or npm required on the consuming side

**Key Features:**

- Zero dependencies
- Local bundle file (no CDN required)
- Standings + stats leaderboard
- Works anywhere JavaScript is supported

[View HTML Example →](./html)

---

### [React Example](./react)

Shows integration with React using Vite for development. Ideal for:

- React single-page applications
- Component-based architectures
- TypeScript projects

**Key Features:**

- TypeScript support
- Hot module replacement (Vite)
- `StandingsTable` + `LeaderboardTable` components

[View React Example →](./react)

---

### [Next.js Example](./nextjs)

Demonstrates Next.js 14 with App Router integration. Best for:

- Server-side rendered applications
- Next.js projects
- SEO-optimized sites

**Key Features:**

- Next.js App Router
- Client components (`'use client'`)
- `StandingsTable` + `LeaderboardTable`
- Environment variable configuration

[View Next.js Example →](./nextjs)

---

## Quick Start

### 1. Build the embed bundle (HTML example)

```bash
# From the repo root
cd ..
npm install
npm run build:embed
# → dist/tropheo-embed.bundle.js is created
```

Copy the bundle next to `html/index.html`, then open `index.html` directly in your browser.

### 2. Run a React or Next.js example

```bash
cd react   # or nextjs
npm install
npm run dev
```

Then open `http://localhost:5173` (React) or `http://localhost:3000` (Next.js).

### 3. Configure API credentials

Update the API key, base URL, and event ID in the example code (or `.env` file).

## Configuration

All examples require:

| Parameter | Description | Where to find |
|---|---|---|
| `apiKey` | API key from your Tropheo organization | Organization Profile → Manage Organization → API Keys |
| `baseUrl` | Your Tropheo instance URL | e.g. `https://app.tropheo.mx` |
| `eventId` | Event to display | From the event URL |

**HTML:**
```javascript
const API_KEY = 'your-api-key';
const BASE_URL = 'https://your-instance.com';
const EVENT_ID = 'event-123';
```

**React/Next.js:**
```bash
# .env or .env.local
VITE_TROPHEO_API_KEY=your-api-key        # React (Vite)
NEXT_PUBLIC_TROPHEO_API_KEY=your-api-key # Next.js
VITE_TROPHEO_BASE_URL=https://your-instance.com
NEXT_PUBLIC_TROPHEO_BASE_URL=https://your-instance.com
```

## Common Use Cases

### Show Standings on a Static Website

Use the **HTML Example** — copy `tropheo-embed.bundle.js` to your project and reference it locally.

### Show Stats / Leaderboards

Both HTML and React examples demonstrate `renderStats` / `LeaderboardTable` usage.

### Build a Tournament Dashboard

Use the **React Example** as a starting point for a custom dashboard.

### Integrate into Existing Next.js App

Use the **Next.js Example** to see how to add widgets to your app.

## Support

For questions about the examples:

1. Check the individual example README
2. Review the [main documentation](../docs)
3. Contact your Tropheo administrator
