# Next.js Example - Tropheo Widgets

This example demonstrates how to integrate Tropheo Widgets into a Next.js 14+ application with the App Router.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

3. Update environment variables in `.env.local`:
   - `NEXT_PUBLIC_TROPHEO_API_KEY`: Your Tropheo API key
   - `NEXT_PUBLIC_TROPHEO_BASE_URL`: Your Tropheo instance URL
   - `NEXT_PUBLIC_EVENT_ID`: The event ID you want to display standings for

4. Run development server:

```bash
npm run dev
```

## Features

- Next.js 14 App Router
- Client-side rendering with 'use client'
- Environment variable configuration
- TypeScript support
- React Server Components compatible

## Integration

```tsx
'use client';

import { useState } from 'react';
import { TropheoWidgets, StandingsTable } from '@tropheo/react';

export default function Page() {
  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: process.env.NEXT_PUBLIC_TROPHEO_API_KEY,
      baseUrl: process.env.NEXT_PUBLIC_TROPHEO_BASE_URL,
    });
  });

  return (
    <StandingsTable
      client={widgets.getClient()}
      eventId={process.env.NEXT_PUBLIC_EVENT_ID}
      eventRole="DIVISION"
      title="Tournament Standings"
      showEmptyState={true}
    />
  );
}
```

## Build

```bash
npm run build
npm start
```

## Notes

- The widget requires client-side rendering, so components must use `'use client'` directive
- Environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
- The `transpilePackages` option in `next.config.js` is required for monorepo packages
