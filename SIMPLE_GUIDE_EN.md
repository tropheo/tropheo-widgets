# Simple Guide: How to Display Standings on Your Website

This guide explains step-by-step how to display Tropheo standings tables on any website.

## 🎯 What You Need

Before starting, you need to get 3 things:

1. **API Key** - An access key that you can generate from your organization dashboard
2. **Base URL** - Your Tropheo site address (example: `https://app.tropheo.mx`)
3. **Event ID** - The ID of the event you want to display (example: `65abc123def456789`)

### How to Get Your API Key?

1. Log in to your Tropheo dashboard
2. Go to your **organization profile**
3. If you are an administrator of the organization, you will see the **"Manage Organization"** option
4. Inside **"Manage Organization"**, you will find different sections, including **"API Keys"**
5. Click the **"Create New API Key"** button
6. Give your key a descriptive name (example: "Website Widget")
7. Copy the generated API key and save it securely

**Important!** Save your API key immediately after creating it - you won't be able to see it again!

From the API Keys dashboard you can:

- View all your active and inactive keys
- Activate/Deactivate keys without deleting them
- See when each key was last used
- Delete keys you no longer need

### How to Find the Event ID?

When viewing an event in Tropheo, look at your browser's address bar:

```
https://app.tropheo.mx/events/65abc123def456789
                                  ↑
                        This is your Event ID
```

## 📝 Option 1: For Simple Websites (HTML)

This is the easiest way. You have two sub-options:

### 1a. Local repo install (no CDN, no npm — recommended for testing)

Build the bundle once from the repository and use it as a local file. This is how the included `test-library` demo page works.

```bash
# 1. Clone or download the repository
git clone <repo-url> tropheo_widgets
cd tropheo_widgets

# 2. Install dependencies
npm install

# 3. Build the embed bundle
npm run build:embed
# → Creates dist/tropheo-embed.bundle.js
# → Also auto-copies to ../test-library/tropheo-embed.bundle.js
```

Copy `dist/tropheo-embed.bundle.js` next to your HTML file and load it with a `<script>` tag:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tournament Standings</title>
  </head>
  <body>
    <h1>🏆 Tournament Standings</h1>
    <div id="standings"></div>

    <!-- Local bundle (same folder as this HTML file) -->
    <script src="tropheo-embed.bundle.js"></script>
    <script>
      const embed = new window.TropheoEmbed({
        apiKey: 'YOUR-API-KEY-HERE',
        baseUrl: 'https://app.tropheo.mx',
      });

      embed.renderStandings({
        eventId: 'YOUR-EVENT-ID-HERE',
        title: 'Tournament Standings',
        container: '#standings',
        showEmptyState: true,
        lang: 'en',
      });
    </script>
  </body>
</html>
```

Open the HTML file directly in your browser — no server needed. Rebuild the bundle any time by running `npm run build:embed` inside the `tropheo_widgets/` folder.

### 1b. CDN (no installation)

### Step 1: Create an HTML File

Create a new file called `standings.html` and copy this code:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tournament Standings</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      h1 {
        color: #333;
      }
    </style>
  </head>
  <body>
    <h1>🏆 Tournament Standings</h1>

    <!-- Standings will be displayed here -->
    <div id="standings"></div>

    <!-- Load Tropheo library -->
    <script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>

    <script>
      // ⚙️ CONFIGURE YOUR VALUES HERE
      const embed = new window.TropheoEmbed({
        apiKey: 'YOUR-API-KEY-HERE', // Replace with your API key
        baseUrl: 'https://app.tropheo.mx', // Replace with your URL
      });

      // Display standings
      embed.renderStandings({
        eventId: 'YOUR-EVENT-ID-HERE', // Replace with your Event ID
        title: 'Tournament Standings', // Custom title (optional)
        container: '#standings', // Where to show the table
        showEmptyState: true, // Show message if no data
        lang: 'en', // Language: 'en' (English) or 'es' (Spanish)
      });
    </script>
  </body>
</html>
```

### Step 2: Replace the Values

In the code above, replace:

- `YOUR-API-KEY-HERE` with your API Key
- `https://app.tropheo.mx` with your Tropheo URL (if different)
- `YOUR-EVENT-ID-HERE` with your Event ID

### Step 3: Open the File

1. Save the file as `standings.html`
2. Double-click the file to open it in your browser
3. Done! You should now see the standings

### Step 4: Upload to Your Website

If you have web hosting:

1. Upload the `standings.html` file to your web server (using FTP, cPanel, etc.)
2. Access it from your browser: `https://yourwebsite.com/standings.html`

## 🔄 Option 2: Integrate into an Existing Page

If you already have a webpage and want to add standings:

### Step 1: Add the Script Before `</body>`

```html
<!-- Right before closing </body> -->
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
<script>
  const embed = new window.TropheoEmbed({
    apiKey: 'YOUR-API-KEY-HERE',
    baseUrl: 'https://app.tropheo.mx',
  });

  embed.renderStandings({
    eventId: 'YOUR-EVENT-ID-HERE',
    title: 'Standings',
    container: '#standings', // ID of the div where you want the table
    lang: 'en', // Language: 'en' or 'es'
  });
</script>
```

### Step 2: Add the Container Where You Want to Show Standings

```html
<div id="standings"></div>
```

## ⚡ Automatic Features

The widget does all of this automatically:

✅ Detects if the event is a tournament, division, pool, bracket, season, or league  
✅ Loads divisions and pools in parallel (hierarchical)  
✅ Groups teams correctly (by division, pool, etc.)  
✅ Shows team logos  
✅ Shows all statistics (wins, losses, points, etc.)  
✅ Responsive design for mobile and tablets  
✅ Includes a button to view more details on Tropheo

## 🎨 Basic Customization

### Change the Language

The widget supports English and Spanish:

```javascript
embed.renderStandings({
  eventId: 'YOUR-EVENT-ID-HERE',
  container: '#standings',
  lang: 'en', // 'en' for English, 'es' for Spanish
});
```

### Change the Title

```javascript
embed.renderStandings({
  eventId: 'YOUR-EVENT-ID-HERE',
  title: 'Season 2026 Standings', // ← Change this
  container: '#standings',
  lang: 'en',
});
```

### Show in Different Locations

You can have multiple widgets on the same page:

```html
<h2>Division A</h2>
<div id="division-a"></div>

<h2>Division B</h2>
<div id="division-b"></div>

<script>
  const embed = new window.TropheoEmbed({
    apiKey: 'YOUR-API-KEY',
    baseUrl: 'https://app.tropheo.mx',
  });

  // Division A
  embed.renderStandings({
    eventId: 'EVENT-ID-DIVISION-A',
    container: '#division-a',
  });

  // Division B
  embed.renderStandings({
    eventId: 'EVENT-ID-DIVISION-B',
    container: '#division-b',
  });
</script>
```

## 🛠️ Troubleshooting

### Nothing Shows Up

1. Verify your API Key is correct
2. Verify your Event ID is correct
3. Open browser console (F12) and look for error messages

### Shows "Error: Authentication failed"

- Your API Key is incorrect or deactivated. Go to your organization profile → **Manage Organization** → **API Keys** to verify that your key is active.

### Shows "Error: Event not found"

- The Event ID is incorrect. Check the ID in the event URL.

### Standings are Empty

- This is normal if the event doesn't have games or results recorded yet.

## 🏀 Option 3: Stats Leaderboards

Stats leaderboards show player or team statistics for an event. Column headers are **clickable** to sort by any stat.

### Basic Example — Basketball

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tournament Stats</title>
  </head>
  <body>
    <h1>🏀 Top Scorers</h1>
    <div id="leaderboard"></div>

    <script src="tropheo-embed.bundle.js"></script>
    <!-- or CDN -->
    <script>
      const embed = new window.TropheoEmbed({
        apiKey: 'YOUR-API-KEY-HERE',
        baseUrl: 'https://app.tropheo.mx',
      });

      // renderStats is an alias for renderLeaderboard — use either
      embed.renderStats({
        eventId: 'YOUR-EVENT-ID-HERE',
        scopeType: 'TOURNAMENT', // or 'DIVISION', 'STAGE', 'GAMEDAY'
        sport: 'basketball',
        facet: 'basketball',
        mode: 'athletes', // 'athletes' or 'teams'
        title: 'Top Scorers',
        container: '#leaderboard',
        lang: 'en',
      });
    </script>
  </body>
</html>
```

### Baseball Batting

```javascript
embed.renderStats({
  eventId: 'YOUR-EVENT-ID-HERE',
  scopeType: 'TOURNAMENT',
  sport: 'baseball',
  facet: 'batting',
  mode: 'athletes',
  title: 'Best Batters',
  container: '#leaderboard',
  lang: 'en',
});
```

### Baseball Pitching

```javascript
embed.renderStats({
  eventId: 'YOUR-EVENT-ID-HERE',
  scopeType: 'TOURNAMENT',
  sport: 'baseball',
  facet: 'pitching',
  mode: 'athletes',
  title: 'Best Pitchers',
  container: '#leaderboard',
  lang: 'en',
});
```

### Soccer

```javascript
embed.renderStats({
  eventId: 'YOUR-EVENT-ID-HERE',
  scopeType: 'TOURNAMENT',
  sport: 'soccer',
  facet: 'soccer',
  mode: 'athletes',
  title: 'Top Scorers',
  container: '#leaderboard',
  lang: 'en',
});
```

### Stats columns by sport/facet

| Sport / Facet | Columns shown                   |
| ------------- | ------------------------------- |
| `basketball`  | PTS, REB, AST, STL, BLK, 3P, TO |
| `batting`     | AVG, H, HR, RBI, BB, SO, OPS    |
| `pitching`    | ERA, IP, SO, BB, WHIP, W, L     |
| `fielding`    | TC, PO, A, E, FPCT, DP          |
| `soccer`      | G, A, SH, SOT, SH%, YC, RC      |
| `goalkeeping` | SV, GA, SV%, MIN                |

### Filtering by Team (Organization)

Pass `filterByOrganizationId` to show only athletes from a specific organization. The Teams tab is hidden automatically when this is set:

```javascript
embed.renderStats({
  eventId: 'YOUR-EVENT-ID-HERE',
  title: 'My Team Stats',
  container: '#leaderboard',
  lang: 'en',
  filterByOrganizationId: 'YOUR-ORG-ID-HERE', // show only this team's athletes
});
```

The filtering happens client-side — the full leaderboard is fetched and then filtered in the browser, so it works reliably even across multi-gameday events and tournaments that include multiple events.

### Custom Colors (Theming)

You can override any part of the widget's color scheme by passing a `theme` object. All keys are optional — anything you omit keeps its default value.

```javascript
embed.renderStats({
  eventId: 'YOUR-EVENT-ID-HERE',
  container: '#leaderboard',
  lang: 'en',
  theme: {
    headerBackground: '#1e293b', // solid dark header instead of gradient
    headerTextColor: '#ffffff',
    activeTabColor: '#f59e0b', // amber tabs
    tableBackground: '#ffffff',
    columnHeaderColor: '#374151',
    rowTextColor: '#374151',
    borderColor: '#e5e7eb',
    footerBackground: '#f9fafb',
    buttonBackground: '#f59e0b', // amber button
    buttonTextColor: '#1e293b',
  },
});
```

| Property            | Default         | Controls                                               |
| ------------------- | --------------- | ------------------------------------------------------ |
| `headerBackground`  | purple gradient | Header background (accepts any CSS `background` value) |
| `headerTextColor`   | `#ffffff`       | Header title & subtitle color                          |
| `activeTabColor`    | `#3b82f6`       | Active tab text & bottom border                        |
| `inactiveTabColor`  | `#6b7280`       | Inactive tab text                                      |
| `tableBackground`   | `#ffffff`       | Card / table background                                |
| `columnHeaderColor` | `#374151`       | Column header text                                     |
| `rowTextColor`      | `#374151`       | Row cell text                                          |
| `rowBorderColor`    | `#f3f4f6`       | Row divider line color                                 |
| `borderColor`       | `#e5e7eb`       | Outer card border                                      |
| `footerBackground`  | `#f9fafb`       | Footer strip background                                |
| `buttonBackground`  | `#3b82f6`       | "View on Tropheo" button background                    |
| `buttonTextColor`   | `#ffffff`       | Button text color                                      |
| `avatarBackground`  | `#e5e7eb`       | Avatar placeholder circle background                   |

> **Note:** If stats are not enabled for an event, the widget will automatically show a localized informational message.

## 📞 Need Help?

If you have problems:

1. **API Keys:** Go to your organization profile → **Manage Organization** → **API Keys** to:
   - Generate new API keys
   - See which keys are active
   - Activate or deactivate keys
   - Check when a key was last used

2. **Technical errors:** Open browser console (F12) to see detailed error messages

3. **Report issues:** Contact Tropheo support to report bugs or request new features

## 🚀 Next Steps

For more advanced implementations:

- [QUICK_START.md](./QUICK_START.md) - Complete technical guide
- [README.md](./README.md) - Detailed documentation
- [docs/getting-started.md](./docs/getting-started.md) - React/Next.js integration
