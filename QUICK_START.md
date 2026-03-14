# Quick Start Guide

This guide will help you get started with Tropheo Widgets in 5 minutes.

## For Server Administrators

### Step 1: Set Up API Keys

Generate a secure API key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:

```
a5f8b3c7d9e2f1a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2
```

### Step 2: Configure Environment Variable

Add to your environment configuration:

```bash
# For local development (.env.local)
WIDGET_API_KEYS=a5f8b3c7d9e2f1a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2

# For production (depends on your hosting)
# See docs/deployment.md for platform-specific instructions
```

### Step 3: Deploy Widget API

The widget API files are already created in `athloom-web`:

- `app/lib/middleware/widgetAuth.ts`
- `app/api/widgets/events/route.ts`
- `app/api/widgets/standings/[eventId]/route.ts`
- `app/api/widgets/standings/[eventId]/recompute/route.ts`

Deploy these to your production environment and restart the application.

### Step 4: Test the API

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

### Step 5: Share with Clients

Provide clients with:

1. API key (keep it secure!)
2. Base URL of your Tropheo instance
3. Link to integration documentation

---

## For External Developers (Widget Users)

You have three options depending on your stack:

### Option 1: HTML + Vanilla JavaScript (Easiest)

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
      });
    </script>
  </body>
</html>
```

**How to get your values:**

- **apiKey**: Contact your Tropheo administrator
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
import { TropheoWidgets, StandingsTable } from '@tropheo/react';

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
        eventId="your-event-id" // Replace with your event ID
        title="Tournament Standings" // Optional custom title
      />
    </div>
  );
}

export default App;
```

**Note:** The widget automatically detects the event type (division, pool, bracket) and displays standings with appropriate grouping.

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
import { TropheoWidgets, StandingsTable } from '@tropheo/react';

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
        eventId="your-event-id" // Replace with your event ID
        title="Tournament Standings" // Optional custom title
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

Both the client library and API require these values:

| Parameter | Description                     | Example                     |
| --------- | ------------------------------- | --------------------------- |
| `apiKey`  | Your API key from Tropheo admin | `a5f8b3c7d9e2f1a4...`       |
| `baseUrl` | Your Tropheo instance URL       | `https://your-instance.com` |
| `eventId` | The event to display            | `event-123`                 |

### Optional Configuration

| Parameter        | Description                                                | Options                       | Default       |
| ---------------- | ---------------------------------------------------------- | ----------------------------- | ------------- |
| `eventRole`      | Override event scope (optional - auto-detected from event) | `POOL`, `DIVISION`, `BRACKET` | Auto-detected |
| `title`          | Custom title                                               | Any string                    | Event name    |
| `showEmptyState` | Show message when no data                                  | `true`, `false`               | `false`       |

**Note:** The `eventRole` parameter is now optional. The widget automatically detects the event type and displays the appropriate standings. You only need to specify `eventRole` if you want to override the default behavior.

---

## Event Roles Explained

The widget automatically uses the correct scope based on your event type. However, you can optionally specify `eventRole` to override this behavior:

### POOL

Shows standings grouped by pool (round-robin groups).

```javascript
eventRole: 'POOL';
```

Example output:

```
Pool A
  1. Team Alpha - 5-1-0
  2. Team Beta  - 4-2-0

Pool B
  1. Team Gamma - 6-0-0
  2. Team Delta - 3-3-0
```

### DIVISION

Shows standings grouped by division (competitive tiers).

```javascript
eventRole: 'DIVISION';
```

Example output:

```
Division 1
  1. Team Alpha - 8-0-0
  2. Team Beta  - 6-2-0

Division 2
  1. Team Gamma - 7-1-0
  2. Team Delta - 5-3-0
```

### BRACKET

Shows standings grouped by bracket (elimination rounds).

```javascript
eventRole: 'BRACKET';
```

Example output:

```
Championship Bracket
  1. Team Alpha - Winner
  2. Team Beta  - Finalist

Consolation Bracket
  1. Team Gamma - 3rd Place
  2. Team Delta - 4th Place
```

### No Role (All Standings)

Omit `eventRole` to see all standings:

```javascript
// No eventRole specified
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
2. Check that the API key is set in environment variables
3. Ensure no extra spaces in the key

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
