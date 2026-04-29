# @tropheo/types

TypeScript type definitions for Tropheo Widgets.

## Installation

```bash
npm install @tropheo/types
```

## Usage

```typescript
import type {
  TropheoWidgetsConfig,
  StandingRow,
  EventRole,
  ApiResponse,
  LeaderboardEntry,
} from '@tropheo/types';

// Use types in your TypeScript code
const config: TropheoWidgetsConfig = {
  apiKey: 'your-api-key',
  baseUrl: 'https://your-instance.com',
};
```

## Included Types

- `TropheoWidgetsConfig` - Configuration for the widgets library
- `EventRole` - Event role types (DIVISION, POOL, BRACKET, etc.)
- `StandingRow` - Standing table row structure
- `ApiResponse<T>` - Standard API response wrapper
- `LeaderboardEntry` - Leaderboard entry structure
- And more...

## Documentation

For complete documentation, visit the [main repository](https://github.com/your-username/tropheo_widgets).

## License

MIT
