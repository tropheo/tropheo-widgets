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

## Quick Start

```html
<div id="schedule"></div>
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
<script>
  const embed = new window.TropheoEmbed({
    apiKey: 'your-api-key',
    baseUrl: 'https://your-tropheo-instance.com',
  });

  embed.renderSchedule({
    eventId: 'your-event-id',
    container: '#schedule',
    lang: 'es',
  });
</script>
```

````

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
- ✅ Upcoming games widget
- ✅ Full schedule widget (calendar + list views)

## Widgets

### Standings

```html
<div id="standings"></div>
<script>
  embed.renderStandings({
    eventId: 'your-event-id',
    container: '#standings',
    lang: 'es',
  });
</script>
````

### Leaderboard

```html
<div id="leaderboard"></div>
<script>
  embed.renderLeaderboard({
    eventId: 'your-event-id',
    scopeType: 'TOURNAMENT',
    sport: 'baseball',
    facet: 'batting',
    mode: 'teams',
    container: '#leaderboard',
    lang: 'es',
  });
</script>
```

### Upcoming Games

```html
<div id="upcoming"></div>
<script>
  embed.renderUpcomingGames({
    eventId: 'your-event-id',
    container: '#upcoming',
    limit: 5, // optional, default 5
    lang: 'es',
  });
</script>
```

### Schedule (full agenda)

```html
<div id="schedule"></div>
<script>
  embed.renderSchedule({
    eventId: 'your-event-id',
    organizationId: 'your-org-id', // optional
    container: '#schedule',
    lang: 'es',
  });
</script>
```

## Configuration Options

### Common

| Option      | Type             | Description                       |
| ----------- | ---------------- | --------------------------------- |
| `eventId`   | string           | Root event ID                     |
| `container` | string           | CSS selector for mount element    |
| `lang`      | `'en'` \| `'es'` | Display language (default `'es'`) |
| `title`     | string           | Custom widget title (optional)    |

### Leaderboard extras

| Option      | Type   | Description                                                         |
| ----------- | ------ | ------------------------------------------------------------------- |
| `scopeType` | string | `'TOURNAMENT'`, `'DIVISION'`, `'STAGE'`, `'GAMEDAY'`                |
| `sport`     | string | `'basketball'`, `'baseball'`, `'softball'`, `'soccer'`              |
| `facet`     | string | `'batting'`, `'pitching'`, `'fielding'`, `'basketball'`, `'soccer'` |
| `mode`      | string | `'athletes'` or `'teams'`                                           |
| `limit`     | number | Max rows (optional)                                                 |

### Upcoming Games extras

| Option  | Type   | Description                                  |
| ------- | ------ | -------------------------------------------- |
| `limit` | number | Number of upcoming games to show (default 5) |

### Schedule extras

| Option           | Type   | Description                             |
| ---------------- | ------ | --------------------------------------- |
| `organizationId` | string | Filter games by organization (optional) |

## Documentation

For complete documentation, examples, and API reference, visit the [main repository](https://github.com/your-username/tropheo_widgets).

## License

MIT
