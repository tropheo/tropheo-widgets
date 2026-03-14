# React Example - Tropheo Widgets

This example demonstrates how to integrate Tropheo Widgets into a React application using Vite.

## Setup

```bash
npm install
npm run dev
```

## Usage

1. Update the configuration in `src/App.tsx`:
   - `API_KEY`: Your Tropheo API key
   - `BASE_URL`: Your Tropheo instance URL
   - `EVENT_ID`: The event ID you want to display standings for

## Features

- TypeScript support
- Hot module replacement
- Component-based architecture
- Easy to integrate into existing React apps

## Integration

```tsx
import { TropheoWidgets, StandingsTable } from '@tropheo/react';

const widgets = new TropheoWidgets({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-tropheo-instance.com',
});

function MyComponent() {
  return (
    <StandingsTable
      client={widgets.getClient()}
      eventId="event-123"
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
```

The build output will be in the `dist/` directory.
