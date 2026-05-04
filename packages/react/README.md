# @tropheo/react

React components for embedding Tropheo standings and leaderboards.

## Installation

```bash
npm install @tropheo/react @tropheo/core @tropheo/types
```

## Peer Dependencies

- React ^18.0.0
- React DOM ^18.0.0

## Components

- `StandingsTable` — Display tournament/division/pool standings
- `LeaderboardTable` — Display athlete or team statistics leaderboards
- `UpcomingGamesWidget` — Display the next N upcoming games for an event
- `ScheduleWidget` — Full schedule view with calendar and list modes, grouped by stage

## Usage

### Standings Table

```tsx
import { useState } from 'react';
import { TropheoWidgets, StandingsTable } from '@tropheo/react';

function App() {
  const [widgets] = useState(
    () =>
      new TropheoWidgets({
        apiKey: process.env.REACT_APP_TROPHEO_API_KEY!,
        baseUrl: process.env.REACT_APP_TROPHEO_BASE_URL!,
      })
  );

  return (
    <StandingsTable
      client={widgets.getClient()}
      eventId="your-event-id"
      title="Division Standings"
    />
  );
}
```

### Leaderboard Table

```tsx
import { TropheoWidgets, LeaderboardTable } from '@tropheo/react';

<LeaderboardTable
  client={widgets.getClient()}
  eventId="your-event-id"
  scopeType="TOURNAMENT"
  sport="basketball"
  facet="basketball"
  mode="athletes"
  title="Leading Scorers"
/>;
```

### Upcoming Games Widget

```tsx
import { TropheoWidgets, UpcomingGamesWidget } from '@tropheo/react';

<UpcomingGamesWidget
  client={widgets.getClient()}
  eventId="your-event-id"
  limit={5} // optional, default 5
  lang="es" // 'en' | 'es', default 'es'
  title="Próximos Partidos"
/>;
```

### Schedule Widget

```tsx
import { TropheoWidgets, ScheduleWidget } from '@tropheo/react';

<ScheduleWidget
  client={widgets.getClient()}
  eventId="your-event-id"
  organizationId="your-org-id" // optional, filters by org
  lang="es" // 'en' | 'es'
  title="Agenda"
/>;
```

## Features

- ✅ Automatic data fetching
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Customizable titles
- ✅ Multiple sports support (Basketball, Baseball, Soccer, etc.)
- ✅ Upcoming games view
- ✅ Full schedule with calendar + list views
- ✅ Stage/jornada grouping (JORNADA, POOL, BRACKET_STAGE, etc.)
- ✅ SAS-signed team images
- ✅ i18n support (English & Spanish)

## Documentation

For complete documentation, API reference, and examples, visit the [main repository](https://github.com/your-username/tropheo_widgets).

## License

MIT
