# Examples

This directory contains complete example implementations of Tropheo Widgets in different environments.

## Available Examples

### [HTML Example](./html)

Demonstrates vanilla JavaScript integration using CDN script tag. Perfect for:

- Static websites
- Content management systems (WordPress, Drupal, etc.)
- Simple HTML pages
- No build tools required

**Key Features:**

- Zero dependencies
- Simple script tag inclusion
- Works anywhere JavaScript is supported

[View HTML Example →](./html)

---

### [React Example](./react)

Shows integration with React using Vite for development. Ideal for:

- React single-page applications
- Component-based architectures
- TypeScript projects
- Modern JavaScript development

**Key Features:**

- TypeScript support
- Hot module replacement
- Component reusability
- Vite build system

[View React Example →](./react)

---

### [Next.js Example](./nextjs)

Demonstrates Next.js 14 with App Router integration. Best for:

- Server-side rendered applications
- Next.js projects
- Full-stack React applications
- SEO-optimized sites

**Key Features:**

- Next.js App Router
- Client-side components
- Environment variable configuration
- Production-ready setup

[View Next.js Example →](./nextjs)

---

## Quick Start

Each example includes:

- Complete source code
- Configuration instructions
- README with setup steps
- Dependencies list

### Run an Example

1. **Choose your example:**

   ```bash
   cd html    # or react, or nextjs
   ```

2. **Follow the README:**
   Each example has its own README with specific instructions

3. **Configure API credentials:**
   Update the API key and base URL in the example code

## Configuration

All examples require:

- **API Key**: Obtained from your Tropheo administrator
- **Base URL**: Your Tropheo instance URL (e.g., `https://your-instance.com`)
- **Event ID**: The event you want to display

### Example Configuration

**HTML:**

```javascript
const API_KEY = 'your-api-key';
const BASE_URL = 'https://your-instance.com';
const EVENT_ID = 'event-123';
```

**React/Next.js:**

```bash
# .env or .env.local
NEXT_PUBLIC_TROPHEO_API_KEY=your-api-key
NEXT_PUBLIC_TROPHEO_BASE_URL=https://your-instance.com
NEXT_PUBLIC_EVENT_ID=event-123
```

## Common Use Cases

### Embed Standings on a Website

Use the **HTML Example** to quickly add standings to any webpage.

### Build a Tournament Dashboard

Use the **React Example** as a starting point for a custom dashboard.

### Integrate into Existing Next.js App

Use the **Next.js Example** to see how to add widgets to your app.

## Support

For questions about the examples:

1. Check the individual example README
2. Review the [main documentation](../docs)
3. Contact your Tropheo administrator

## Contributing

To add a new example:

1. Create a new directory under `examples/`
2. Include complete working code
3. Add a detailed README
4. Update this file with a link to your example
