# @tropheo/react

React components for embedding Tropheo standings and leaderboards.

## Installation

```bash
npm install @tropheo/react @tropheo/core @tropheo/types
```

## Peer Dependencies

- React ^18.0.0
- React DOM ^18.0.0

## Usage

### Standings Table

```tsx
import { useState } from 'react';
import { TropheoWidgets, StandingsTable } from '@tropheo/react';

function App() {
  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: process.env.REACT_APP_TROPHEO_API_KEY!,
      baseUrl: process.env.REACT_APP_TROPHEO_BASE_URL!,
    });
  });

  return (
    <div>
      <h1>Tournament Standings</h1>
      <StandingsTable
        client={widgets.getClient()}
        eventId="your-event-id"
        title="Division Standings"
      />
    </div>
  );
}
```

### Leaderboard Table

```tsx
import { useState } from 'react';
import { TropheoWidgets, LeaderboardTable } from '@tropheo/react';

function App() {
  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: process.env.REACT_APP_TROPHEO_API_KEY!,
      baseUrl: process.env.REACT_APP_TROPHEO_BASE_URL!,
    });
  });

  return (
    <div>
      <h1>Top Scorers</h1>
      <LeaderboardTable
        client={widgets.getClient()}
        eventId="your-event-id"
        scopeType="TOURNAMENT"
        sport="basketball"
        facet="basketball"
        mode="athletes"
        title="Leading Scorers"
      />
    </div>
  );
}
```

## Components

- `StandingsTable` - Display tournament/division/pool standings
- `LeaderboardTable` - Display athlete or team statistics leaderboards

## Features

- ✅ Automatic data fetching
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Customizable titles
- ✅ Multiple sports support (Basketball, Baseball, Soccer, etc.)

## Documentation

For complete documentation, API reference, and examples, visit the [main repository](https://github.com/your-username/tropheo_widgets).

## License

MIT
