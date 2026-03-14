# HTML Example - Tropheo Widgets

This example demonstrates how to integrate Tropheo Widgets into a plain HTML page.

## Usage

1. Open `index.html` in your browser
2. Replace the configuration values:
   - `API_KEY`: Your Tropheo API key
   - `BASE_URL`: Your Tropheo instance URL
   - `EVENT_ID`: The event ID you want to display standings for

## Features

- No build tools required
- Simple script tag inclusion
- Works with any static hosting

## Configuration

```javascript
const embed = new window.TropheoEmbed({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-tropheo-instance.com',
});

embed.renderStandings({
  eventId: 'event-123',
  eventRole: 'DIVISION',
  title: 'Tournament Standings',
  showEmptyState: true,
  container: '#standings-container',
});
```

## CDN

The widget can be loaded from a CDN:

```html
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
```
