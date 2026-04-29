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
```

## Features

- ✅ Type-safe API client
- ✅ Authentication handling
- ✅ Error handling
- ✅ Standings API
- ✅ Leaderboard API
- ✅ Events API

## Documentation

For complete documentation and examples, visit the [main repository](https://github.com/your-username/tropheo_widgets).

## License

MIT
