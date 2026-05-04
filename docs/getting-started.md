# Getting Started with Tropheo Widgets

Tropheo Widgets is a library that allows you to embed tournament standings and other tournament data into your website or application.

## Installation

### For React/Next.js Projects

```bash
npm install @tropheo/react @tropheo/core @tropheo/types
```

### For Vanilla JavaScript Projects

```bash
npm install @tropheo/embed
```

Or use a CDN:

```html
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
```

## Quick Start

### React

```tsx
import { useState } from 'react';
import { TropheoWidgets, StandingsTable } from '@tropheo/react';

function App() {
  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: 'your-api-key-here',
      baseUrl: 'https://your-tropheo-instance.com',
    });
  });

  return (
    <StandingsTable client={widgets.getClient()} eventId="event-123" title="Tournament Standings" />
  );
}
```

### Next.js

```tsx
'use client';

import { useState } from 'react';
import { TropheoWidgets, StandingsTable } from '@tropheo/react';

export default function Page() {
  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: process.env.NEXT_PUBLIC_TROPHEO_API_KEY!,
      baseUrl: process.env.NEXT_PUBLIC_TROPHEO_BASE_URL!,
    });
  });

  return (
    <StandingsTable client={widgets.getClient()} eventId="event-123" title="Tournament Standings" />
  );
}
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Tournament</title>
  </head>
  <body>
    <div id="standings"></div>

    <script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
    <script>
      const embed = new window.TropheoEmbed({
        apiKey: 'your-api-key-here',
        baseUrl: 'https://your-tropheo-instance.com',
      });

      embed.renderStandings({
        eventId: 'event-123',
        title: 'Tournament Standings',
        container: '#standings',
        lang: 'en', // Language: 'en' or 'es'
      });
    </script>
  </body>
</html>
```

## Configuration

All packages require the following configuration:

- **apiKey** (required): Your Tropheo API key for authentication (generate from your organization's dashboard)
- **baseUrl** (required): The base URL of your Tropheo instance (e.g., `https://www.tropheo.comm`)
- **eventId** (required): The ID of the event to display (found in the event URL)

## How to Get Your Configuration Values

### API Key

Generate your own API key from your organization dashboard:

1. Log in to Tropheo
2. Go to your **organization profile**
3. Click **"Manage profile"** (admin only)
4. Navigate to **"API Keys"** section
5. Click **"Create New API Key"**
6. Give it a descriptive name
7. Copy and securely store the generated key

**Important:** The key is only shown once at creation time. If you're a developer without dashboard access, ask your organization administrator to generate a key and share it with you securely.

### Base URL

This is the main URL where your Tropheo platform is hosted, for example:

- `https://www.tropheo.comm`
- `https://your-organization.tropheo.com`

### Event ID

The event ID is found in the URL when viewing an event:

- URL: `https://www.tropheo.comm/events/65abc123def456789`
- Event ID: `65abc123def456789`

## Automatic Features

The widget automatically:

- Detects the event type (division, pool, bracket, tournament)
- Shows standings grouped appropriately (by pool, division, etc.)
- Displays team logos and stats
- Supports responsive design for mobile and desktop

## Next Steps

- [API Reference](./api-reference.md) - Detailed API documentation
- [Authentication](./authentication.md) - How to configure API keys
- [Examples](../examples) - Full example projects

## Quick Start: Upcoming & Live Games

Show upcoming and live games for any event with a single call:

**React:**

```tsx
import { UpcomingGamesWidget, TropheoWidgets } from '@tropheo/react';
const widgets = new TropheoWidgets({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://your-instance.com',
});

<UpcomingGamesWidget
  client={widgets.getClient()}
  eventId="your-event-id"
  limit={6}
  windowDays={7}
  lang="en"
/>;
```

**HTML (embed):**

```html
<div id="upcoming"></div>
<script src="tropheo-embed.bundle.js"></script>
<script>
  const embed = new TropheoEmbed({ apiKey: 'YOUR_API_KEY', baseUrl: 'https://your-instance.com' });
  embed.renderUpcomingGames({ eventId: 'your-event-id', container: '#upcoming' });
</script>
```

## Quick Start: Full Schedule

Show the complete event schedule with calendar and list views:

**React:**

```tsx
import { ScheduleWidget, TropheoWidgets } from '@tropheo/react';
const widgets = new TropheoWidgets({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://your-instance.com',
});

<ScheduleWidget
  client={widgets.getClient()}
  eventId="your-event-id"
  defaultView="calendar"
  lang="en"
/>;
```

**HTML (embed):**

```html
<div id="schedule"></div>
<script src="tropheo-embed.bundle.js"></script>
<script>
  const embed = new TropheoEmbed({ apiKey: 'YOUR_API_KEY', baseUrl: 'https://your-instance.com' });
  embed.renderSchedule({ eventId: 'your-event-id', container: '#schedule', defaultView: 'list' });
</script>
```

## Support

- **API Key Issues:** Check your organization profile → Manage profile → API Keys
- **Technical Questions:** Refer to the documentation in the `docs/` folder
- **Feature Requests:** Contact Tropheo support
