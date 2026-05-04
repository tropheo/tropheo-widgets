# @tropheo/core

Core API client and widget rendering engine for Tropheo Widgets.

## Installation

```bash
npm install @tropheo/core @tropheo/types
```

## Usage

```typescript
import { TropheoWidgets } from '@tropheo/core';

// Initialize the client
const widgets = new TropheoWidgets({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-tropheo-instance.com',
});

// Get standings
const response = await widgets.getClient().getStandings('event-id');
if (response.data) {
  console.log(response.data.standings);
}

// Get sub-events
const events = await widgets.getClient().getSubEvents('parent-event-id');

// Get leaderboard
const leaderboard = await widgets.getClient().getLeaderboard({
  eventId: 'event-id',
  scopeType: 'TOURNAMENT',
  sport: 'basketball',
  facet: 'basketball',
  mode: 'athletes',
});

// Get upcoming games (next N games for an event)
const upcoming = await widgets.getClient().getSchedule('event-id');
if (upcoming.data) {
  console.log(upcoming.data.games); // all games
  console.log(upcoming.data.stages); // named stages (JORNADA, POOL, etc.)
}

// Get full schedule (same endpoint, same data — components decide how to render)
const schedule = await widgets.getClient().getSchedule('event-id', 'org-id');
```

## API Methods

| Method                                  | Description                                |
| --------------------------------------- | ------------------------------------------ |
| `getStandings(eventId)`                 | Fetch standings for an event               |
| `getSubEvents(parentEventId)`           | Fetch child events of a parent event       |
| `getLeaderboard(options)`               | Fetch athlete or team stat leaderboard     |
| `getSchedule(eventId, organizationId?)` | Fetch full schedule: stages, games, scores |

## Features

- ✅ Type-safe API client
- ✅ Authentication handling
- ✅ Error handling
- ✅ Standings API
- ✅ Leaderboard API
- ✅ Events API
- ✅ Schedule & Upcoming Games API

## Documentation

For complete documentation and examples, visit the [main repository](https://github.com/your-username/tropheo_widgets).

## License

MIT
