# Simple Guide: How to Display Standings on Your Website

This guide explains step-by-step how to display Tropheo standings tables on any website.

## 🎯 What You Need

Before starting, you need to get 3 things from your Tropheo administrator:

1. **API Key** - An access key (example: `abc123def456...`)
2. **Base URL** - Your Tropheo site address (example: `https://app.tropheo.mx`)
3. **Event ID** - The ID of the event you want to display (example: `65abc123def456789`)

### How to Find the Event ID?

When viewing an event in Tropheo, look at your browser's address bar:

```
https://app.tropheo.mx/events/65abc123def456789
                                  ↑
                        This is your Event ID
```

## 📝 Option 1: For Simple Websites (HTML)

This is the easiest way. No installation required.

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
  });
</script>
```

### Step 2: Add the Container Where You Want to Show Standings

```html
<div id="standings"></div>
```

## ⚡ Automatic Features

The widget does all of this automatically:

✅ Detects if the event is a tournament, division, pool, or bracket  
✅ Groups teams correctly (by division, pool, etc.)  
✅ Shows team logos  
✅ Shows all statistics (wins, losses, points, etc.)  
✅ Responsive design for mobile and tablets  
✅ Includes a button to view more details on Tropheo

## 🎨 Basic Customization

### Change the Title

```javascript
embed.renderStandings({
  eventId: 'YOUR-EVENT-ID-HERE',
  title: 'Season 2026 Standings', // ← Change this
  container: '#standings',
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

- Your API Key is incorrect. Contact your Tropheo administrator.

### Shows "Error: Event not found"

- The Event ID is incorrect. Check the ID in the event URL.

### Standings are Empty

- This is normal if the event doesn't have games or results recorded yet.

## 📞 Need Help?

Contact your Tropheo administrator to:

- Get or renew your API Key
- Resolve access issues
- Report bugs

## 🚀 Next Steps

For more advanced implementations:

- [QUICK_START.md](./QUICK_START.md) - Complete technical guide
- [README.md](./README.md) - Detailed documentation
- [docs/getting-started.md](./docs/getting-started.md) - React/Next.js integration
