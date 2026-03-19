# Tropheo Widgets

A library for embedding Tropheo tournament widgets into your website or application.

## 🚀 New to Tropheo Widgets?

**Start here:**

- 🇪🇸 [Guía Simple en Español](./SIMPLE_GUIDE.md) - Paso a paso para principiantes
- 🇺🇸 [Simple Guide in English](./SIMPLE_GUIDE_EN.md) - Step-by-step for beginners

**For developers:**

- [Quick Start Guide](./QUICK_START.md) - Get started in 5 minutes
- [Full Documentation](./docs/getting-started.md) - Complete integration guide

## Features

- 📊 Display tournament standings and stats
- 🏆 Show player and team leaderboards
- ⚛️ React components for React/Next.js apps
- 🌐 Vanilla JavaScript support for any website
- 🔒 Secure API key authentication
- 📱 Responsive design
- 🎨 Customizable styling
- 🚀 Zero dependencies (embed package)

## Quick Start

### React

```tsx
import { TropheoWidgets, StandingsTable, LeaderboardTable } from '@tropheo/react';

const widgets = new TropheoWidgets({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-tropheo-instance.com',
});

function App() {
  return (
    <>
      <StandingsTable
        client={widgets.getClient()}
        eventId="event-123"
        title="Tournament Standings"
      />

      <LeaderboardTable
        client={widgets.getClient()}
        eventId="event-123"
        scopeType="TOURNAMENT"
        sport="basketball"
        facet="basketball"
        mode="athletes"
        title="Top Scorers"
      />
    </>
  );
}
```

### Vanilla JavaScript

```html
<div id="standings"></div>
<div id="leaderboard"></div>

<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
<script>
  const embed = new window.TropheoEmbed({
    apiKey: 'your-api-key',
    baseUrl: 'https://your-tropheo-instance.com',
  });

  // Render standings
  embed.renderStandings({
    eventId: 'event-123',
    container: '#standings',
  });

  // Render leaderboard
  embed.renderLeaderboard({
    eventId: 'event-123',
    scopeType: 'TOURNAMENT',
    sport: 'basketball',
    facet: 'basketball',
    mode: 'athletes',
    title: 'Top Scorers',
    container: '#leaderboard',
  });
</script>
```

## Installation

### For React/Next.js Projects

```bash
npm install @tropheo/react @tropheo/core @tropheo/types
```

### For Vanilla JavaScript Projects

```bash
npm install @tropheo/embed
```

Or use a CDN (no installation needed):

```html
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
```

### No Framework (just plain HTML)

No installation needed! Just add the CDN script to your HTML:

```html
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
```

## Documentation

- [Getting Started](./docs/getting-started.md) - Installation and basic usage
- [API Reference](./docs/api-reference.md) - Complete API documentation
- [Authentication](./docs/authentication.md) - API key setup and security
- [Deployment Guide](./docs/deployment.md) - Server and client deployment instructions

## Examples

Check out the [examples](./examples) directory for complete implementations:

- [HTML Example](./examples/html) - Vanilla JavaScript with CDN
- [React Example](./examples/react) - React with Vite
- [Next.js Example](./examples/nextjs) - Next.js 14 with App Router

## Development

### Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Development mode (watch)
npm run dev
```

### Project Structureleaderboards, events, and recomputation

### @tropheo/react

- `<StandingsTable>` component with loading/error states
- `<LeaderboardTable>` component for player/team stat
  │ ├── types/ # TypeScript type definitions
  │ ├── core/ # Core API client
  │ ├── react/ # React components
  │ └── embed/ # Vanilla JS loader
  ├── examples/
  │ ├── html/ # HTML example
  │ ├── react/ # React example
  │ └── nextjs/ # Next.js example
  └── docs/ # Documentation

````

## Packages

- **@tropheo/types** - Shared TypeScript type definitions
- **@tropheo/core** - Core API client with authentication
- **@tropheo/react** - React components (StandingsTable)
- **@tropheo/embed** - Vanilla JavaScript loader for non-React environments

## Features by Package

### @tropheo/core

- API key authentication via Authorization header
- Type-safe API client
- Methods for standings, events, and recomputation

### @tropheo/react

- `<StandingsTable>` component with loading/error states
- Collapsible stage sections
- Responsive design
- Admin features (recompute button)

### @tropheo/embed

- Zero dependencies
- Vanilla JavaScript API
- Auto-initialization on script load
- DOM manipulation with inline styles

## Authentication

Set up API keys on your Tropheo server:

```bash
# Environment variable
WIDGET_API_KEYS=key1,key2,key3
````

Use API keys in your client:

```typescript
const widgets = new TropheoWidgets({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-instance.com',
});
```

See [Authentication Guide](./docs/authentication.md) for more details.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and build
5. Submit a pull request

## License

MIT

## Support

For questions or issues, contact your Tropheo administrator.
