# Quick Start Guide

This guide will help you get started with Tropheo Widgets in 5 minutes.

## For Organization Administrators

### Step 1: Generate Your API Key

1. Log in to your Tropheo organization dashboard
2. Go to your **organization profile**
3. If you are an administrator of the organization, you will see the **"Manage Organization"** option
4. Inside **"Manage Organization"**, you will find different sections, including **"API Keys"**
5. Click the **"Create New API Key"** button
6. Give your key a descriptive name (e.g., "Website Widget", "External Portal")
7. Copy the generated API key and store it securely

**Important:** Save your API key immediately after creation - you won't be able to see it again!

### Step 2: Manage Your Keys

From the API Keys dashboard, you can:

- **View active and inactive keys** - See all your API keys in one place
- **Activate/Deactivate** - Toggle keys on/off without deleting them
- **Monitor usage** - Check when each key was last used
- **Delete keys** - Remove keys you no longer need

**Security Best Practices:**

- Create separate keys for different integrations
- Deactivate unused keys instead of leaving them active
- Regularly review the "Last Used" column to identify inactive keys
- Delete compromised keys immediately and create new ones

### Step 3: Test Your API Key

```bash
# Replace with your actual values
export API_KEY="your-api-key"
export BASE_URL="https://your-tropheo-instance.com"
export PARENT_EVENT_ID="your-parent-event-id"

# Test events endpoint
curl -H "Authorization: $API_KEY" \
  "$BASE_URL/api/widgets/events?parentEventId=$PARENT_EVENT_ID"

# Should return JSON with sub-events or an empty array
```

### Step 4: Share with Your Website Developers

Provide your developers with:

1. API key (keep it secure - don't share via email or chat!)
2. Base URL of your Tropheo instance (e.g., `https://app.tropheo.mx`)
3. Link to integration documentation (this repository)

**Important:** Treat API keys like passwords. Anyone with your key can access your organization's public event data.

---

## For External Developers (Widget Users)

You have three options depending on your stack:

### Option 1: HTML + Vanilla JavaScript (Easiest)

#### 1a. Local repo (no CDN, no npm — recommended for testing)

Build the bundle once from the repository, then reference it directly. This is how the included `test-library` page works.

```bash
# 1. Clone the repo
git clone <repo-url> tropheo_widgets
cd tropheo_widgets

# 2. Install dependencies
npm install

# 3. Build the embed bundle
npm run build:embed
# → Creates dist/tropheo-embed.bundle.js
# → Auto-copies to ../test-library/tropheo-embed.bundle.js
```

Copy `dist/tropheo-embed.bundle.js` next to your HTML file, then:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Tournament</title>
  </head>
  <body>
    <h1>Tournament Standings</h1>
    <div id="standings"></div>

    <!-- Load from local bundle (same folder as this HTML file) -->
    <script src="tropheo-embed.bundle.js"></script>

    <script>
      const embed = new window.TropheoEmbed({
        apiKey: 'your-api-key-here',
        baseUrl: 'https://your-tropheo-instance.com',
      });

      embed.renderStandings({
        eventId: 'your-event-id',
        title: 'Tournament Standings',
        container: '#standings',
        lang: 'en',
      });
    </script>
  </body>
</html>
```

Open the HTML file directly in your browser — no server needed. Rebuild any time with `npm run build:embed`.

#### 1b. CDN (no installation)

**No installation required!** Just add this to your HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Tournament</title>
  </head>
  <body>
    <h1>Tournament Standings</h1>
    <div id="standings"></div>

    <!-- Load the widget library from CDN -->
    <script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>

    <script>
      // Initialize with your credentials
      const embed = new window.TropheoEmbed({
        apiKey: 'your-api-key-here', // Get this from your Tropheo admin
        baseUrl: 'https://your-tropheo-instance.com', // Your Tropheo URL
      });

      // Render standings
      embed.renderStandings({
        eventId: 'your-event-id', // Get this from the event URL
        title: 'Tournament Standings', // Custom title (optional)
        container: '#standings', // Where to show the widget
        showEmptyState: true, // Show message if no data (optional)
        lang: 'en', // Language: 'en' or 'es' (optional, default: 'en')
      });
    </script>
  </body>
</html>
```

**How to get your values:**

- **apiKey**: Generate one from your organization profile → **Manage Organization** → **API Keys**
- **baseUrl**: The main URL where your Tropheo site is hosted (e.g., `https://app.tropheo.mx`)
- **eventId**: Found in the event URL: `https://your-site.com/events/EVENT_ID_HERE`

**That's it!** Open the HTML file in your browser.

### Option 2: React Application

**Step 1: Install packages**

```bash
npm install @tropheo/react @tropheo/core @tropheo/types
```

**Step 2: Create .env file**

```bash
# .env (for Vite/CRA)
VITE_TROPHEO_API_KEY=your-api-key-here
VITE_TROPHEO_BASE_URL=https://your-tropheo-instance.com
```

**Step 3: Use in your component**

```tsx
import { useState } from 'react';
import { TropheoWidgets, StandingsTable, LeaderboardTable } from '@tropheo/react';

function App() {
  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: import.meta.env.VITE_TROPHEO_API_KEY,
      baseUrl: import.meta.env.VITE_TROPHEO_BASE_URL,
    });
  });

  return (
    <div>
      <h1>Tournament Standings</h1>
      <StandingsTable
        client={widgets.getClient()}
        eventId="your-event-id"
        title="Tournament Standings"
        lang="en"
      />

      <h1>Top Scorers</h1>
      <LeaderboardTable
        client={widgets.getClient()}
        eventId="your-event-id"
        scopeType="TOURNAMENT"
        sport="basketball"
        facet="basketball"
        mode="athletes"
        title="Top Scorers"
        lang="en"
      />
    </div>
  );
}

export default App;
```

**Note:** `StandingsTable` automatically detects the event type (division, pool, bracket, season, league) and displays standings with appropriate grouping.

### Option 3: Next.js Application

**Step 1: Install packages**

```bash
npm install @tropheo/react @tropheo/core @tropheo/types
```

**Step 2: Create .env.local file**

```bash
# .env.local
NEXT_PUBLIC_TROPHEO_API_KEY=your-api-key-here
NEXT_PUBLIC_TROPHEO_BASE_URL=https://your-tropheo-instance.com
```

**Step 3: Use in your page**

```tsx
'use client';

import { useState } from 'react';
import { TropheoWidgets, StandingsTable, LeaderboardTable } from '@tropheo/react';

export default function Page() {
  const [widgets] = useState(() => {
    return new TropheoWidgets({
      apiKey: process.env.NEXT_PUBLIC_TROPHEO_API_KEY!,
      baseUrl: process.env.NEXT_PUBLIC_TROPHEO_BASE_URL!,
    });
  });

  return (
    <div>
      <h1>Tournament Standings</h1>
      <StandingsTable
        client={widgets.getClient()}
        eventId={process.env.NEXT_PUBLIC_EVENT_ID || 'your-event-id'}
        title="Tournament Standings"
        lang="en"
      />

      <h1>Top Scorers</h1>
      <LeaderboardTable
        client={widgets.getClient()}
        eventId={process.env.NEXT_PUBLIC_EVENT_ID || 'your-event-id'}
        scopeType="TOURNAMENT"
        sport="basketball"
        facet="basketball"
        mode="athletes"
        title="Top Scorers"
        lang="en"
      />
    </div>
  );
}
```

**Step 4: Run development server**

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Configuration Options

### Required Configuration

| Parameter | Description                     | Example                     |
| --------- | ------------------------------- | --------------------------- |
| `apiKey`  | Your API key from Tropheo admin | `a5f8b3c7d9e2f1a4...`       |
| `baseUrl` | Your Tropheo instance URL       | `https://your-instance.com` |
| `eventId` | The event to display            | `event-123`                 |

### Standings Options

| Parameter        | Description                                                | Options                                                                    | Default       |
| ---------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- | ------------- |
| `eventRole`      | Override event scope (optional — auto-detected from event) | `POOL`, `BRACKET_STAGE`, `DIVISION`, `TOURNAMENT_ROOT`, `SEASON`, `LEAGUE` | Auto-detected |
| `title`          | Custom title                                               | Any string                                                                 | Event name    |
| `showEmptyState` | Show message when no data                                  | `true`, `false`                                                            | `false`       |
| `lang`           | Display language                                           | `'en'`, `'es'`                                                             | `'en'`        |

### Leaderboard / Stats Options

| Parameter                | Description                                                       | Options                                                                  | Default      |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------ |
| `scopeType`              | Scope of the leaderboard                                          | `TOURNAMENT`, `DIVISION`, `STAGE`, `GAMEDAY`                             | —            |
| `sport`                  | Sport type                                                        | `basketball`, `baseball`, `softball`, `soccer`                           | —            |
| `facet`                  | Which stats to show                                               | `basketball`, `batting`, `pitching`, `fielding`, `soccer`, `goalkeeping` | —            |
| `mode`                   | Athlete or team leaderboard                                       | `'athletes'`, `'teams'`                                                  | `'athletes'` |
| `sort`                   | Default sort column                                               | Column key (e.g. `'pts'`, `'era'`)                                       | First col    |
| `limit`                  | Max number of rows                                                | Number                                                                   | `25`         |
| `lang`                   | Display language                                                  | `'en'`, `'es'`                                                           | `'en'`       |
| `filterByOrganizationId` | Filter to one team's athletes (client-side). Hides the Teams tab. | Organization ID string                                                   | —            |
| `theme`                  | Custom visual theme (colors). See [Theming](#theming).            | `LeaderboardTheme` object                                                | —            |

### Theming

All theme keys are optional — omit to keep the default style.

| Key                 | Default                                             | Description                                    |
| ------------------- | --------------------------------------------------- | ---------------------------------------------- |
| `headerBackground`  | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | Header background (any CSS `background` value) |
| `headerTextColor`   | `#ffffff`                                           | Header text color                              |
| `activeTabColor`    | `#3b82f6`                                           | Active tab text & bottom border                |
| `inactiveTabColor`  | `#6b7280`                                           | Inactive tab text                              |
| `tableBackground`   | `#ffffff`                                           | Card / table background                        |
| `columnHeaderColor` | `#374151`                                           | Column header text                             |
| `rowTextColor`      | `#374151`                                           | Row cell text                                  |
| `rowBorderColor`    | `#f3f4f6`                                           | Row divider color                              |
| `borderColor`       | `#e5e7eb`                                           | Outer card border                              |
| `footerBackground`  | `#f9fafb`                                           | Footer background                              |
| `buttonBackground`  | `#3b82f6`                                           | Button background                              |
| `buttonTextColor`   | `#ffffff`                                           | Button text                                    |
| `avatarBackground`  | `#e5e7eb`                                           | Avatar placeholder background                  |

### Stats facet columns

| Sport / Facet | Columns shown                   |
| ------------- | ------------------------------- |
| `basketball`  | PTS, REB, AST, STL, BLK, 3P, TO |
| `batting`     | AVG, H, HR, RBI, BB, SO, OPS    |
| `pitching`    | ERA, IP, SO, BB, WHIP, W, L     |
| `fielding`    | TC, PO, A, E, FPCT, DP          |
| `soccer`      | G, A, SH, SOT, SH%, YC, RC      |
| `goalkeeping` | SV, GA, SV%, MIN                |

## Event Roles Explained

The widget automatically uses the correct scope based on your event type. You can optionally pass `eventRole` to override.

### POOL

Shows standings for a single round-robin pool.

### BRACKET_STAGE

Shows bracket-stage standings.

### DIVISION

Shows standings per division. Sub-events are loaded in parallel and rendered under each division header.

### TOURNAMENT_ROOT / SEASON / LEAGUE

Shows full hierarchical standings: loads all child divisions/stages and their pools in parallel.

### Auto-detection (recommended)

Omit `eventRole` — the widget reads the role from the API response:

```javascript
embed.renderStandings({
  eventId: 'event-123',
  container: '#standings',
});
```

---

## Finding Your Event ID

### Method 1: From URL

When viewing an event in Tropheo, the URL contains the event ID:

```
https://your-instance.com/events/EVENT_ID_HERE/details
                                 ^^^^^^^^^^^^^^
```

### Method 2: Using the API

List events for a tournament:

```bash
curl -H "Authorization: your-api-key" \
  "https://your-instance.com/api/widgets/events?parentEventId=tournament-id"
```

Response:

```json
[
  { "id": "event-abc", "name": "Division A" },
  { "id": "event-xyz", "name": "Division B" }
]
```

Use the `id` field as your `eventId`.

---

## Troubleshooting

### "401 Unauthorized" Error

**Problem:** Authorization header is missing or invalid.

**Solution:**

1. Verify you're using the correct API key
2. Check that the API key is still active in your organization's dashboard
3. Make sure the API key is set correctly in your environment variables
4. Ensure no extra spaces in the key

```javascript
// ❌ Wrong
apiKey: ' your-api-key-here ';

// ✅ Correct
apiKey: 'your-api-key-here';
```

### "CORS Error" in Browser

**Problem:** Browser is blocking cross-origin requests.

**Solution:**

1. Verify CORS headers are configured on the server
2. Check browser console for specific error
3. Contact your Tropheo administrator

### Widget Not Rendering

**Problem:** Container not found or JavaScript error.

**Solution:**

1. Check browser console for errors
2. Verify container selector is correct:

```javascript
// ❌ Wrong - missing #
container: 'standings';

// ✅ Correct - with #
container: '#standings';
```

3. Ensure script loads after HTML:

```html
<!-- ❌ Wrong - script before container -->
<script>
  embed.renderStandings({ container: '#standings' });
</script>
<div id="standings"></div>

<!-- ✅ Correct - container before script -->
<div id="standings"></div>
<script>
  embed.renderStandings({ container: '#standings' });
</script>
```

### No Standings Data

**Problem:** API returns empty or no data.

**Solution:**

1. Verify event ID is correct
2. Check that event has standings data
3. Try without `eventRole` filter
4. Contact your Tropheo administrator

---

## Next Steps

- **Full Documentation:** See `docs/getting-started.md`
- **API Reference:** See `docs/api-reference.md`
- **Examples:** Check `examples/` directory
- **Deployment:** See `docs/deployment.md`

## Support

For help:

1. Check documentation in `docs/` folder
2. Review examples in `examples/` folder
3. Contact your Tropheo administrator
4. Check browser console for errors

---

## Summary

**For Admins:**

1. Generate API key → Set `WIDGET_API_KEYS` → Deploy → Share with clients

**For Developers:**

1. Get API key + Base URL → Choose integration method → Add code → Done!

That's it! You're ready to embed Tropheo widgets on any website.
