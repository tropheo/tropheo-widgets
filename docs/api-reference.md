# Tropheo Widgets API Reference

## Packages

- [@tropheo/types](#tropheotypes) - TypeScript type definitions
- [@tropheo/core](#tropheocore) - Core API client
- [@tropheo/react](#tropheoreact) - React components
- [@tropheo/embed](#tropheoembed) - Vanilla JavaScript loader

---

## @tropheo/types

Type definitions shared across all packages.

### TropheoWidgetsConfig

Configuration object for initializing Tropheo Widgets.

```typescript
interface TropheoWidgetsConfig {
  apiKey: string;
  baseUrl: string;
}
```

**Properties:**

- `apiKey` (string, required): Your Tropheo API key
- `baseUrl` (string, required): Base URL of your Tropheo instance

### EventRole

Scope for standings queries.

```typescript
type EventRole = 'POOL' | 'DIVISION' | 'BRACKET';
```

### StandingRow

Individual team standing data.

```typescript
interface StandingRow {
  rank: number;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifferential: number;
  tieBreaker?: string;
  logoUrl?: string;
}
```

### ApiResponse

Generic API response wrapper.

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
```

---

## @tropheo/core

Core API client for making authenticated requests.

### TropheoWidgets

Main class for interacting with the Tropheo API.

```typescript
class TropheoWidgets {
  constructor(config: TropheoWidgetsConfig);
  getClient(): ApiClient;
}
```

#### Constructor

```typescript
const widgets = new TropheoWidgets({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-instance.com',
});
```

#### Methods

##### `getClient(): ApiClient`

Returns the underlying `ApiClient` instance for making direct API calls.

```typescript
const client = widgets.getClient();
```

### ApiClient

Low-level API client for making authenticated requests.

```typescript
class ApiClient {
  constructor(config: TropheoWidgetsConfig);
  getStandings(eventId: string, eventRole?: EventRole): Promise<ApiResponse<StandingsData>>;
  getSubEvents(parentEventId: string): Promise<ApiResponse<SubEvent[]>>;
  recomputeStandings(eventId: string, config?: RecomputeConfig): Promise<ApiResponse<any>>;
}
```

#### Methods

##### `getStandings(eventId, eventRole?)`

Fetch standings for an event.

```typescript
const response = await client.getStandings('event-123', 'DIVISION');

if (response.data) {
  console.log(response.data.standings);
}
```

**Parameters:**

- `eventId` (string, required): Event ID
- `eventRole` (EventRole, optional): Scope for standings (POOL, DIVISION, BRACKET)

**Returns:** `Promise<ApiResponse<StandingsData>>`

##### `getSubEvents(parentEventId)`

Fetch sub-events for a parent event.

```typescript
const response = await client.getSubEvents('parent-event-123');

if (response.data) {
  console.log(response.data); // Array of sub-events
}
```

**Parameters:**

- `parentEventId` (string, required): Parent event ID

**Returns:** `Promise<ApiResponse<SubEvent[]>>`

##### `recomputeStandings(eventId, config?)`

Recompute standings for an event (admin operation).

```typescript
const response = await client.recomputeStandings('event-123', {
  tieBreakerOrder: ['WIN_PCT', 'HEAD_TO_HEAD', 'POINT_DIFF'],
  pointsSystem: {
    win: 3,
    tie: 1,
    loss: 0,
  },
});
```

**Parameters:**

- `eventId` (string, required): Event ID
- `config` (RecomputeConfig, optional): Recompute configuration

**Returns:** `Promise<ApiResponse<any>>`

---

## @tropheo/react

React components for embedding Tropheo widgets.

### StandingsTable

React component for displaying tournament standings.

```typescript
interface StandingsTableProps {
  client: ApiClient;
  eventId: string;
  eventRole?: EventRole;
  title?: string;
  showEmptyState?: boolean;
  isAdmin?: boolean;
  refreshTrigger?: number;
  className?: string;
  eventUrl?: string;
  baseUrl?: string;
  lang?: 'en' | 'es';
  theme?: StandingsTheme;
}
```

#### Usage

```tsx
import { TropheoWidgets, StandingsTable } from '@tropheo/react';

const widgets = new TropheoWidgets({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-instance.com',
});

function App() {
  return (
    <StandingsTable
      client={widgets.getClient()}
      eventId="event-123"
      eventRole="DIVISION"
      title="Tournament Standings"
      showEmptyState={true}
      lang="en"
    />
  );
}
```

#### Props

- `client` (ApiClient, required): API client instance from `TropheoWidgets`
- `eventId` (string, required): Event ID to display standings for
- `eventRole` (EventRole, optional): Scope for standings (POOL, DIVISION, BRACKET)
- `title` (string, optional): Custom title for the standings table
- `showEmptyState` (boolean, optional): Show message when no standings data is available
- `isAdmin` (boolean, optional): Enable admin features (recompute button)
- `refreshTrigger` (number, optional): Change this value to force refresh
- `className` (string, optional): Additional CSS class names
- `eventUrl` (string, optional): Custom event URL for the "View on Tropheo" button
- `baseUrl` (string, optional): Base URL for constructing event links (default: 'https://www.tropheo.com')
- `lang` ('en' | 'es', optional): Language for UI text (default: 'en')
- `theme` (StandingsTheme, optional): Visual theme overrides — see [StandingsTheme](#standingstheme)

---

## @tropheo/embed

Vanilla JavaScript loader for non-React environments.

### TropheoEmbed

Class for embedding widgets without React.

```typescript
class TropheoEmbed {
  constructor(config: TropheoWidgetsConfig);
  renderStandings(config: StandingsWidgetConfig): Promise<void>;
}
```

#### Usage

```html
<div id="standings"></div>

<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
<script>
  const embed = new window.TropheoEmbed({
    apiKey: 'your-api-key',
    baseUrl: 'https://your-instance.com',
  });

  embed.renderStandings({
    eventId: 'event-123',
    eventRole: 'DIVISION',
    title: 'Tournament Standings',
    container: '#standings',
    lang: 'en', // 'en' or 'es'
  });
</script>
```

#### Constructor

```typescript
const embed = new TropheoEmbed({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-instance.com',
});
```

#### Methods

##### `renderStandings(config)`

Render a standings table into a DOM element.

```typescript
await embed.renderStandings({
  eventId: 'event-123',
  eventRole: 'DIVISION',
  title: 'Tournament Standings',
  showEmptyState: true,
  container: '#standings',
  lang: 'en', // Language: 'en' or 'es'
});
```

**Parameters:**

```typescript
interface StandingsWidgetConfig {
  eventId: string;
  eventRole?: EventRole;
  title?: string;
  showEmptyState?: boolean;
  container: string | HTMLElement;
  eventUrl?: string;
  baseUrl?: string;
  lang?: 'en' | 'es';
  theme?: StandingsTheme;
}
```

- `eventId` (string, required): Event ID
- `eventRole` (EventRole, optional): Scope for standings
- `title` (string, optional): Custom title
- `showEmptyState` (boolean, optional): Show message when no data
- `container` (string | HTMLElement, required): CSS selector or DOM element
- `eventUrl` (string, optional): Custom event URL for the "View on Tropheo" button
- `baseUrl` (string, optional): Base URL for constructing event links (default: 'https://www.tropheo.com')
- `lang` ('en' | 'es', optional): Language for UI text (default: 'en')
- `theme` (StandingsTheme, optional): Visual theme overrides — see [StandingsTheme](#standingstheme)

**Returns:** `Promise<void>`

### StandingsTheme

All color fields are optional. Omit any key to keep its default value.

```typescript
interface StandingsTheme {
  tableBackground?: string; // default: '#ffffff'
  columnHeaderColor?: string; // default: '#374151'
  rowTextColor?: string; // default: '#374151'
  rowBorderColor?: string; // default: '#f3f4f6'
  borderColor?: string; // default: '#e5e7eb'
  footerBackground?: string; // default: '#f9fafb'
  buttonBackground?: string; // default: '#3b82f6'
  buttonTextColor?: string; // default: '#ffffff'
  positiveColor?: string; // default: '#10b981'  (positive point differential)
  negativeColor?: string; // default: '#ef4444'  (negative point differential)
}
```

**React example:**

```tsx
<StandingsTable
  client={client}
  eventId="event-123"
  theme={{
    tableBackground: '#1e293b', // dark card
    columnHeaderColor: '#94a3b8',
    rowTextColor: '#e2e8f0',
    rowBorderColor: '#334155',
    borderColor: '#334155',
    footerBackground: '#0f172a',
    buttonBackground: '#f59e0b',
    buttonTextColor: '#1e293b',
  }}
/>
```

**HTML / embed example:**

```js
embed.renderStandings({
  eventId: 'your-event-id',
  container: '#standings-container',
  theme: {
    tableBackground: '#1e293b',
    columnHeaderColor: '#94a3b8',
    rowTextColor: '#e2e8f0',
    borderColor: '#334155',
    buttonBackground: '#f59e0b',
    buttonTextColor: '#1e293b',
  },
});
```

---

## Error Handling

All API methods return an `ApiResponse` object with the following structure:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
```

Check the `error` property to handle failures:

```typescript
const response = await client.getStandings('event-123');

if (response.error) {
  console.error('Failed to fetch standings:', response.error);
} else {
  console.log('Standings:', response.data);
}
```

Common HTTP status codes:

- `200`: Success
- `401`: Unauthorized (invalid API key)
- `404`: Event not found
- `500`: Server error

---

## Language Support

Tropheo Widgets support multiple languages for UI text. The following components and methods support the `lang` parameter:

### Supported Languages

- `'en'` - English (default)
- `'es'` - Spanish (Español)

### Examples

#### Vanilla JavaScript (Embed)

```javascript
const embed = new window.TropheoEmbed({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-instance.com',
});

// English (default)
embed.renderStandings({
  eventId: 'event-123',
  container: '#standings',
  lang: 'en',
});

// Spanish
embed.renderStandings({
  eventId: 'event-123',
  container: '#standings-es',
  lang: 'es',
});
```

#### React Components

```tsx
import { StandingsTable } from '@tropheo/react';

function App() {
  return (
    <>
      {/* English */}
      <StandingsTable client={client} eventId="event-123" lang="en" />

      {/* Spanish */}
      <StandingsTable client={client} eventId="event-123" lang="es" />
    </>
  );
}
```

### Translated UI Elements

The following UI elements are translated based on the `lang` parameter:

- Loading messages ("Loading standings..." / "Cargando posiciones...")
- Error messages
- Empty state messages ("No standings available yet." / "No hay posiciones disponibles aún.")
- Table headers (Team/Equipo, GP/PJ, W/G, L/P, T/E, GB/JD, PTS, WIN%/% VIC, PF, PA/PC, DIFF/DIF)
- Footer text ("Powered by" / "Desarrollado por")
- Call-to-action buttons ("View on Tropheo" / "Ver en Tropheo")

### LeaderboardTable Language Support

The `LeaderboardTable` component also supports the `lang` parameter:

```tsx
import { LeaderboardTable } from '@tropheo/react';

function LeaderboardPage() {
  return (
    <LeaderboardTable
      client={client}
      eventId="event-123"
      scopeType="TOURNAMENT"
      sport="basketball"
      facet="basketball"
      lang="es"
    />
  );
}
```

For the embed version:

```javascript
embed.renderLeaderboard({
  eventId: 'event-123',
  scopeType: 'TOURNAMENT',
  sport: 'basketball',
  facet: 'basketball',
  container: '#leaderboard',
  lang: 'es',
});
```

---

## UpcomingGamesWidget

Displays upcoming and live games for an event, filtered to a configurable time window.

### UpcomingGamesWidgetProps (React)

```typescript
interface UpcomingGamesWidgetProps {
  client: ApiClient; // Authenticated API client
  eventId: string; // Root event ID
  organizationId?: string; // Optional: show only games where this org participates
  limit?: number; // Max games to display (default: 8)
  windowDays?: number; // Days ahead to include as "upcoming" (default: 7)
  className?: string;
  baseUrl?: string; // default: 'https://www.tropheo.com'
  lang?: 'en' | 'es'; // default: 'en'
  theme?: UpcomingGamesTheme;
  onLoad?: (count: number) => void;
}
```

### UpcomingGamesTheme

```typescript
interface UpcomingGamesTheme {
  cardBackground?: string; // default: '#ffffff'
  headerBackground?: string; // default: '#ffffff'
  titleTextColor?: string; // default: '#111827'
  textColor?: string; // default: '#374151'
  mutedTextColor?: string; // default: '#6b7280'
  borderColor?: string; // default: '#fed7aa'
  liveColor?: string; // default: '#ef4444'
  upcomingColor?: string; // default: '#f97316'
  footerBackground?: string; // default: '#f9fafb'
  buttonBackground?: string; // default: '#3b82f6'
  buttonTextColor?: string; // default: '#ffffff'
  avatarBackground?: string; // default: '#e5e7eb'
  winnerColor?: string; // default: '#15803d'
}
```

### UpcomingGamesWidgetConfig (Embed)

```typescript
interface UpcomingGamesWidgetConfig {
  eventId: string;
  organizationId?: string;
  limit?: number; // default: 8
  windowDays?: number; // default: 7
  className?: string;
  container?: HTMLElement | string;
  baseUrl?: string; // default: 'https://www.tropheo.com'
  lang?: 'en' | 'es'; // default: 'en'
  theme?: UpcomingGamesTheme;
}
```

### React Usage

```tsx
import { UpcomingGamesWidget, TropheoWidgets } from '@tropheo/react';

const widgets = new TropheoWidgets({ apiKey: '...', baseUrl: '...' });

<UpcomingGamesWidget
  client={widgets.getClient()}
  eventId="your-event-id"
  organizationId="your-org-id" // optional
  limit={6}
  windowDays={7}
  lang="en"
/>;
```

### Embed Usage

```javascript
const embed = new TropheoEmbed({ apiKey: '...', baseUrl: '...' });

embed.renderUpcomingGames({
  eventId: 'your-event-id',
  // organizationId: 'your-org-id',  // optional
  limit: 6,
  windowDays: 7,
  container: '#upcoming-container',
  lang: 'en',
});
```

---

## ScheduleWidget

Full event schedule with **Calendar view** (mini monthly calendar + day games panel) and **List view** (games grouped by stage).

### ScheduleWidgetProps (React)

```typescript
interface ScheduleWidgetProps {
  client: ApiClient;
  eventId: string;
  organizationId?: string; // Server-side org filter (only matching games returned)
  defaultView?: 'calendar' | 'list'; // default: 'calendar'
  className?: string;
  baseUrl?: string; // default: 'https://www.tropheo.com'
  lang?: 'en' | 'es'; // default: 'en'
  theme?: ScheduleTheme;
  onLoad?: (gameCount: number) => void;
}
```

### ScheduleTheme

```typescript
interface ScheduleTheme {
  cardBackground?: string; // default: '#ffffff'
  borderColor?: string; // default: '#fed7aa'
  textColor?: string; // default: '#111827'
  mutedTextColor?: string; // default: '#6b7280'
  primaryColor?: string; // Calendar selected day / dots. default: '#3b82f6'
  liveColor?: string; // default: '#ef4444'
  toggleActiveBackground?: string; // View toggle active bg. default: '#111827'
  toggleActiveText?: string; // View toggle active text. default: '#ffffff'
  footerBackground?: string; // default: '#f9fafb'
  buttonBackground?: string; // default: '#3b82f6'
  buttonTextColor?: string; // default: '#ffffff'
  avatarBackground?: string; // default: '#e5e7eb'
  winnerColor?: string; // default: '#15803d'
}
```

### ScheduleWidgetConfig (Embed)

```typescript
interface ScheduleWidgetConfig {
  eventId: string;
  organizationId?: string;
  defaultView?: 'calendar' | 'list'; // default: 'calendar'
  className?: string;
  container?: HTMLElement | string;
  baseUrl?: string;
  lang?: 'en' | 'es';
  theme?: ScheduleTheme;
}
```

### React Usage

```tsx
import { ScheduleWidget, TropheoWidgets } from '@tropheo/react';

const widgets = new TropheoWidgets({ apiKey: '...', baseUrl: '...' });

<ScheduleWidget
  client={widgets.getClient()}
  eventId="your-event-id"
  defaultView="calendar"
  lang="es"
/>;
```

### Embed Usage

```javascript
const embed = new TropheoEmbed({ apiKey: '...', baseUrl: '...' });

embed.renderSchedule({
  eventId: 'your-event-id',
  // organizationId: 'your-org-id',  // optional server-side filter
  defaultView: 'list',
  container: '#schedule-container',
  lang: 'en',
});
```

---

## API Endpoint: GET /api/widgets/schedule/[eventId]

Returns the full schedule for an event.

**Authentication:** `x-widget-api-key` header or `apiKey` query param.

**Query params:**

- `organizationId` (optional) — when provided, only games where this org participates are returned.

**Response:**

```json
{
  "success": true,
  "event": {
    "id": "...",
    "name": "Tournament Name",
    "sport": "basketball",
    "eventRole": "TOURNAMENT_ROOT",
    "startDate": "2025-01-10T00:00:00.000Z",
    "endDate": "2025-01-20T00:00:00.000Z",
    "description": null
  },
  "stages": [
    {
      "id": "...",
      "name": "Pool A",
      "eventRole": "POOL",
      "startDate": "2025-01-10T00:00:00.000Z",
      "endDate": "2025-01-15T00:00:00.000Z"
    }
  ],
  "games": [
    {
      "id": "...",
      "name": null,
      "startDate": "2025-01-10T14:00:00.000Z",
      "endDate": "2025-01-10T16:00:00.000Z",
      "status": "upcoming",
      "parentStageId": "...",
      "venueName": "Sports Complex",
      "fieldName": "Court 1",
      "address": null,
      "gameInfo": {
        "homeName": "Team A",
        "awayName": "Team B",
        "homeImage": "https://...",
        "awayImage": null,
        "homeScore": null,
        "awayScore": null,
        "isCompleted": false,
        "homeOrgId": "...",
        "awayOrgId": "..."
      }
    }
  ]
}
```
