# @tropheo/embed

Vanilla JavaScript library for embedding Tropheo widgets without a framework.

## Installation

### Via npm

```bash
npm install @tropheo/embed
```

### Via CDN

```html
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
```

## Usage

### Standings Widget

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Tournament Standings</title>
  </head>
  <body>
    <div id="standings"></div>

    <script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
    <script>
      const embed = new window.TropheoEmbed({
        apiKey: 'your-api-key',
        baseUrl: 'https://your-tropheo-instance.com',
      });

      embed.renderStandings({
        eventId: 'your-event-id',
        title: 'Tournament Standings',
        container: '#standings',
        lang: 'en', // 'en' or 'es'
      });
    </script>
  </body>
</html>
```

### Leaderboard Widget

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Leaderboard</title>
  </head>
  <body>
    <div id="leaderboard"></div>

    <script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
    <script>
      const embed = new window.TropheoEmbed({
        apiKey: 'your-api-key',
        baseUrl: 'https://your-tropheo-instance.com',
      });

      embed.renderLeaderboard({
        eventId: 'your-event-id',
        scopeType: 'TOURNAMENT',
        sport: 'basketball',
        facet: 'basketball',
        mode: 'athletes',
        title: 'Top Scorers',
        container: '#leaderboard',
        lang: 'en', // 'en' or 'es'
      });
    </script>
  </body>
</html>
```

## Features

- ✅ No framework required
- ✅ Works with any website
- ✅ CDN support
- ✅ Responsive design
- ✅ i18n support (English & Spanish)
- ✅ Automatic styling
- ✅ Multiple widgets per page
- ✅ Standings tables
- ✅ Leaderboard tables

## Configuration Options

### Standings

- `eventId` - Event ID to display
- `title` - Custom title (optional)
- `container` - CSS selector for container element
- `lang` - Language: 'en' or 'es' (optional, default: 'en')
- `showEmptyState` - Show message when no data (optional)

### Leaderboard

- `eventId` - Event ID
- `scopeType` - Scope: 'TOURNAMENT', 'DIVISION', 'STAGE', or 'GAMEDAY'
- `sport` - Sport: 'basketball', 'baseball', 'softball', 'soccer'
- `facet` - Stat type: 'basketball', 'batting', 'pitching', 'soccer', etc.
- `mode` - 'athletes' or 'teams'
- `title` - Custom title (optional)
- `container` - CSS selector
- `lang` - Language (optional)
- `limit` - Max entries (optional)

## Documentation

For complete documentation, examples, and API reference, visit the [main repository](https://github.com/your-username/tropheo_widgets).

## License

MIT
