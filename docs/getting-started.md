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
    <StandingsTable
      client={widgets.getClient()}
      eventId="event-123"
      eventRole="DIVISION"
      title="Tournament Standings"
    />
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
    <StandingsTable
      client={widgets.getClient()}
      eventId="event-123"
      eventRole="DIVISION"
      title="Tournament Standings"
    />
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
        eventRole: 'DIVISION',
        title: 'Tournament Standings',
        container: '#standings',
      });
    </script>
  </body>
</html>
```

## Configuration

All packages require the following configuration:

- **apiKey** (required): Your Tropheo API key for authentication
- **baseUrl** (required): The base URL of your Tropheo instance (e.g., `https://your-instance.com`)

## Event Roles

When displaying standings, you can specify the scope using the `eventRole` parameter:

- `POOL`: Show standings grouped by pool
- `DIVISION`: Show standings grouped by division
- `BRACKET`: Show standings grouped by bracket

## Next Steps

- [API Reference](./api-reference.md) - Detailed API documentation
- [Authentication](./authentication.md) - How to configure API keys
- [Examples](../examples) - Full example projects

## Support

For questions or issues, please contact your Tropheo administrator.
