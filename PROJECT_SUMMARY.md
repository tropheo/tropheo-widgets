# Tropheo Widgets - Complete Project Summary

This document provides a comprehensive overview of the Tropheo Widgets project, including all created files, architecture, and implementation details.

## Project Overview

Tropheo Widgets is a complete library system for embedding tournament standings and statistics into external websites. It consists of:

1. **Widget Library** (tropheo_widgets) - Client-side packages
2. **Widget API** (athloom-web) - Server-side protected endpoints
3. **Authentication System** - API key-based security
4. **Examples** - Implementation guides for different platforms
5. **Documentation** - Complete guides and references

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                External Websites                     │
│  (HTML, React, Next.js, WordPress, etc.)            │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ Uses widgets via:
                    │ - @tropheo/react (React/Next.js)
                    │ - @tropheo/embed (Vanilla JS)
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│           Tropheo Widgets Library                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ @tropheo/types  - Type definitions           │  │
│  │ @tropheo/core   - API client + auth          │  │
│  │ @tropheo/react  - React components           │  │
│  │ @tropheo/embed  - Vanilla JS loader          │  │
│  └──────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ API Requests with
                    │ Authorization: api-key
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│         Widget API (athloom-web)                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ /api/widgets/events          - Get events    │  │
│  │ /api/widgets/standings/[id]  - Get standings │  │
│  │ /api/widgets/standings/.../recompute         │  │
│  │                                               │  │
│  │ Middleware: widgetAuth.ts                    │  │
│  │ - Validates API keys                         │  │
│  │ - Adds CORS headers                          │  │
│  │ - Handles preflight                          │  │
│  └──────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              MongoDB Database                        │
│  EventGame, Event, Team, Standing models            │
└─────────────────────────────────────────────────────┘
```

---

## API Key Management System

Organizations have full control over their widget API keys through a self-service dashboard:

### Dashboard Location

Go to your **organization profile** → **Manage profile** → **API Keys**

(Note: You must be an administrator of the organization to access this section)

### Key Features

#### 1. Create API Keys

- Click **"Create New API Key"** button
- Assign a descriptive name (e.g., "Website Widget", "Mobile App")
- Key is generated and displayed once (must be saved immediately)
- Automatic timestamp tracking

#### 2. Manage Keys

- **View All Keys**: See complete list of active and inactive keys
- **Activate/Deactivate**: Toggle keys on/off without deleting
- **Monitor Usage**: View "Last Used" timestamp for each key
- **Delete Keys**: Permanently remove keys no longer needed

#### 3. Security Features

- Keys are stored securely in database
- Keys are hashed/encrypted for security
- Only shown once at creation time
- Cannot be recovered if lost (must create new key)
- Each organization can only access their own keys

### Key Information Displayed

| Field     | Description                              |
| --------- | ---------------------------------------- |
| Name      | Custom name assigned by user             |
| Created   | Date and time key was created            |
| Last Used | Most recent API request using this key   |
| Status    | Active (green toggle) or Inactive (gray) |
| Actions   | Delete button                            |

### Workflow

```
1. Organization Admin logs into dashboard
2. Goes to organization profile
3. Clicks "Manage profile" (admin only)
4. Navigates to "API Keys" section
5. Clicks "Create New API Key"
6. Enters descriptive name
7. Copies generated key (shown only once!)
8. Shares key securely with developers
9. Developers use key in widget implementation
10. Admin monitors usage via dashboard
11. Can deactivate/delete key if compromised
```

---

## File Structure

### Tropheo Widgets Library (/Users/victormanuel/workspace/tropheo_widgets/)

```
tropheo_widgets/
├── package.json              # Root package with workspaces
├── turbo.json               # Turbo build configuration
├── tsconfig.json            # Shared TypeScript config
├── .gitignore              # Git ignore rules
├── .prettierrc             # Code formatting rules
├── README.md               # Main documentation
│
├── packages/
│   ├── types/                           # @tropheo/types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts                 # Type definitions
│   │           - TropheoWidgetsConfig
│   │           - EventRole
│   │           - StandingRow
│   │           - ApiResponse
│   │
│   ├── core/                            # @tropheo/core
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts                 # Core classes
│   │           - TropheoWidgets (main class)
│   │           - ApiClient (HTTP client)
│   │           - Methods: getStandings(), getSubEvents(), recomputeStandings()
│   │
│   ├── react/                           # @tropheo/react
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                 # Package exports
│   │       └── StandingsTable.tsx       # React component (300+ lines)
│   │           - Auto-fetching data
│   │           - Loading/error states
│   │           - Collapsible sections
│   │           - Admin features
│   │
│   └── embed/                           # @tropheo/embed
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts                 # Vanilla JS loader (200+ lines)
│               - TropheoEmbed class
│               - renderStandings() method
│               - DOM manipulation
│               - Inline styles
│
├── examples/
│   ├── README.md                        # Examples overview
│   │
│   ├── html/                            # HTML/Vanilla JS example
│   │   ├── README.md
│   │   └── index.html                   # Complete working example
│   │
│   ├── react/                           # React + Vite example
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   ├── index.html
│   │   ├── README.md
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx                  # Widget implementation
│   │       ├── App.css
│   │       └── index.css
│   │
│   └── nextjs/                          # Next.js 14 example
│       ├── package.json
│       ├── next.config.js
│       ├── tsconfig.json
│       ├── .env.example
│       ├── README.md
│       └── app/
│           ├── layout.tsx
│           ├── page.tsx                 # Widget implementation
│           ├── page.css
│           └── globals.css
│
└── docs/
    ├── getting-started.md               # Quick start guide
    ├── api-reference.md                 # Complete API docs
    ├── authentication.md                # API key setup
    └── deployment.md                    # Deployment guide
```

### Widget API (athloom-web)

```
athloom-web/
├── WIDGET_API_IMPLEMENTATION.md         # API documentation
│
└── app/
    ├── lib/
    │   └── middleware/
    │       └── widgetAuth.ts            # Authentication middleware
    │           - validateWidgetAuth()
    │           - addCorsHeaders()
    │           - handleOptions()
    │
    └── api/
        └── widgets/
            ├── events/
            │   └── route.ts             # GET /api/widgets/events
            │                            # - Lists sub-events
            │                            # - Query: parentEventId
            │
            └── standings/
                └── [eventId]/
                    ├── route.ts         # GET /api/widgets/standings/[eventId]
                    │                    # - Returns standings data
                    │                    # - Query: eventRole (POOL/DIVISION/BRACKET)
                    │                    # - Grouped by stage
                    │                    # - Sorted by rank
                    │
                    └── recompute/
                        └── route.ts     # POST /api/widgets/standings/[eventId]/recompute
                                         # - Recomputes standings
                                         # - Body: tieBreakerOrder, pointsSystem
```

---

## Key Features

### 1. Monorepo Structure

- **Turbo** for fast, cached builds
- **npm workspaces** for package management
- Shared TypeScript configuration
- Centralized dependency management

### 2. Type Safety

- Full TypeScript support across all packages
- Shared type definitions in @tropheo/types
- Proper type inference
- No `any` types

### 3. Authentication

- **Organization-managed API keys** - Each organization generates and manages their own API keys
- API key authentication via `Authorization` header
- Self-service key management through organization dashboard
- Key activation/deactivation without deletion
- Usage tracking (last used timestamp)
- Secure key validation on server

**Organization Dashboard Features:**

- Create new API keys with custom names
- View all active and inactive keys
- Toggle keys on/off (activate/deactivate)
- Monitor when each key was last used
- Delete keys permanently
- Copy keys securely after creation

### 4. CORS Support

- Preflight handling (OPTIONS)
- Wildcard origin support (`*`)
- Configurable for production restrictions
- Proper headers for cross-origin requests

### 5. Multiple Integration Methods

**React/Next.js:**

```tsx
import { TropheoWidgets, StandingsTable } from '@tropheo/react';

const widgets = new TropheoWidgets({
  apiKey: process.env.NEXT_PUBLIC_TROPHEO_API_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_TROPHEO_BASE_URL!,
});

<StandingsTable client={widgets.getClient()} eventId="event-123" eventRole="DIVISION" />;
```

**Vanilla JavaScript:**

```html
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
<script>
  const embed = new window.TropheoEmbed({
    apiKey: 'your-api-key',
    baseUrl: 'https://your-instance.com',
  });

  embed.renderStandings({
    eventId: 'event-123',
    container: '#standings',
  });
</script>
```

---

## Data Flow

### Fetching Standings Example

```
1. Client Code:
   const widgets = new TropheoWidgets({ apiKey, baseUrl });
   const response = await widgets.getClient().getStandings('event-123', 'DIVISION');

2. API Client (core):
   - Adds Authorization header: apiKey
   - Makes GET request to: baseUrl/api/widgets/standings/event-123?eventRole=DIVISION

3. Widget Auth Middleware:
   - Validates Authorization header against WIDGET_API_KEYS
   - If invalid: returns 401 Unauthorized
   - If valid: continues to route handler

4. Route Handler:
   - Parses eventId and eventRole
   - Queries MongoDB with scope filter
   - Groups standings by stage
   - Generates SAS tokens for logos
   - Returns JSON response

5. API Client:
   - Receives response
   - Returns { data, error, status }

6. React Component (if using React):
   - Receives data
   - Renders standings table
   - Shows loading/error states
```

---

## Environment Variables

### Server (athloom-web)

```bash
# API keys are now managed through organization dashboards
# Organizations create and manage their own keys via the UI
# No manual environment variable configuration needed for individual keys

# Existing variables (already configured)
MONGODB_URI=...
GOOGLE_CLOUD_STORAGE_BUCKET=...
# etc.
```

**Note:** API keys are no longer manually configured via environment variables. Organizations generate and manage their own keys through their organization profile → Manage profile → API Keys (admin only).

### Client (Next.js)

```bash
NEXT_PUBLIC_TROPHEO_API_KEY=your-api-key-here
NEXT_PUBLIC_TROPHEO_BASE_URL=https://your-tropheo-instance.com
NEXT_PUBLIC_EVENT_ID=event-123
```

### Client (React/Vite)

```bash
VITE_TROPHEO_API_KEY=your-api-key-here
VITE_TROPHEO_BASE_URL=https://your-tropheo-instance.com
```

---

## API Endpoints

### 1. GET /api/widgets/events

**Purpose:** Get sub-events for a parent event

**Request:**

```bash
curl -H "Authorization: your-api-key" \
  "https://instance.com/api/widgets/events?parentEventId=event-123"
```

**Response:**

```json
[
  { "id": "event-456", "name": "Division A", "eventRole": "DIVISION" },
  { "id": "event-789", "name": "Division B", "eventRole": "DIVISION" }
]
```

### 2. GET /api/widgets/standings/[eventId]

**Purpose:** Get standings for an event

**Request:**

```bash
curl -H "Authorization: your-api-key" \
  "https://instance.com/api/widgets/standings/event-123?eventRole=DIVISION"
```

**Response:**

```json
{
  "standings": {
    "Division A": [
      {
        "rank": 1,
        "teamName": "Team Alpha",
        "wins": 5,
        "losses": 1,
        "ties": 0,
        "points": 15,
        "pointsFor": 125,
        "pointsAgainst": 80,
        "pointsDifferential": 45
      }
    ]
  },
  "eventName": "Tournament 2024",
  "status": "success"
}
```

### 3. POST /api/widgets/standings/[eventId]/recompute

**Purpose:** Recompute standings with custom rules

**Request:**

```bash
curl -X POST \
  -H "Authorization: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"tieBreakerOrder":["WIN_PCT","HEAD_TO_HEAD"]}' \
  "https://instance.com/api/widgets/standings/event-123/recompute"
```

**Response:**

```json
{
  "success": true,
  "message": "Standings recomputed successfully"
}
```

---

## Build and Deploy

### Development

```bash
# In tropheo_widgets/
npm install
npm run dev        # Watch mode for all packages
```

### Build

```bash
npm run build      # Build all packages
npm run lint       # Run linting
```

### Publishing

```bash
# Update version
npm version patch  # or minor, major

# Publish to NPM
npm publish --workspaces
```

### Server Deployment

1. Deploy widget API routes to production
2. Set `WIDGET_API_KEYS` environment variable
3. Restart application
4. Test endpoints

---

## Testing

### Manual Testing

**Test Authentication:**

```bash
# Should fail (401)
curl https://instance.com/api/widgets/events?parentEventId=xyz

# Should succeed (200)
curl -H "Authorization: valid-key" \
  https://instance.com/api/widgets/events?parentEventId=xyz
```

**Test CORS:**

```bash
curl -H "Origin: https://example.com" \
  -H "Authorization: valid-key" \
  -X OPTIONS \
  https://instance.com/api/widgets/standings/event-123
```

### Automated Testing

Add unit tests for:

- API client methods
- Authentication middleware
- React component rendering
- Error handling

---

## Security

### Best Practices Implemented

✅ API key authentication  
✅ Environment variable storage  
✅ CORS headers for external access  
✅ Request validation  
✅ Error handling without exposing internals  
✅ Secure token generation (SAS for images)

### Recommendations

- Use HTTPS in production
- Rotate API keys periodically
- Restrict CORS origins in production
- Monitor authentication failures
- Rate limit API requests
- Log all widget API access

---

## Usage Statistics

### Created Files

**tropheo_widgets:** 36 files

- 4 packages
- 3 example implementations
- 4 documentation files
- Configuration files

**athloom-web:** 5 files

- 1 middleware file
- 3 route handlers
- 1 documentation file

**Total:** 41 files created

### Lines of Code (Approximate)

- TypeScript: ~1,500 lines
- Documentation: ~2,000 lines
- Examples: ~500 lines
- Configuration: ~200 lines

---

## Next Steps

### For Server Administrators

1. ✅ Review widget API implementation
2. ✅ Deploy organization dashboard with API key management
3. ✅ Set up widget API routes in production
4. ⚠️ Train organizations on self-service API key generation
5. ⚠️ Monitor widget API usage and performance
6. ⚠️ Set up rate limiting and security measures

### For Organizations (API Key Holders)

1. ⚠️ Log in to organization dashboard
2. ⚠️ Go to your organization profile
3. ⚠️ Click "Manage profile" (admin only)
4. ⚠️ Navigate to "API Keys" section
5. ⚠️ Generate new API key with descriptive name
6. ⚠️ Copy and securely store the API key
7. ⚠️ Share key with website developers
8. ⚠️ Monitor key usage and deactivate if compromised

### For Widget Library Maintainers

1. ✅ Complete package implementation
2. ⚠️ Publish packages to NPM registry
3. ⚠️ Set up CDN for @tropheo/embed
4. ⚠️ Create additional examples (WordPress, etc.)
5. ⚠️ Add unit tests

### For External Developers (Clients)

1. ⚠️ Request access to organization dashboard or obtain API key from organization admin
2. ⚠️ Generate API key from organization profile → Manage profile → API Keys (if you have dashboard access and are admin)
3. ⚠️ Choose integration method (React or Vanilla JS)
4. ⚠️ Install packages or include CDN script
5. ⚠️ Configure with API key and base URL
6. ⚠️ Implement widgets on website

---

## Support and Maintenance

### Documentation Locations

- **Getting Started:** `docs/getting-started.md`
- **API Reference:** `docs/api-reference.md`
- **Authentication:** `docs/authentication.md`
- **Deployment:** `docs/deployment.md`
- **Widget API:** `WIDGET_API_IMPLEMENTATION.md` (athloom-web)

### Common Issues

| Issue                | Solution                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| 401 Unauthorized     | Check API key is correct and active in organization dashboard              |
| CORS errors          | Verify CORS headers in response                                            |
| Empty standings      | Verify event ID and database content                                       |
| Widget not rendering | Check browser console for errors                                           |
| Type errors          | Ensure latest @tropheo/types installed                                     |
| Key not working      | Verify key is activated (organization profile → Manage profile → API Keys) |
| Lost API key         | Generate new key from dashboard (old keys cannot be recovered)             |

### Contact

For issues or questions:

1. Check documentation
2. Review examples
3. Contact Tropheo administrator
4. Review server logs

---

## License

MIT License - See LICENSE file for details

---

## Changelog

### Version 1.0.0 (Initial Release)

**Packages:**

- @tropheo/types v1.0.0
- @tropheo/core v1.0.0
- @tropheo/react v1.0.0
- @tropheo/embed v1.0.0

**Features:**

- API key authentication
- Standings widget
- Event listing
- React component
- Vanilla JS loader
- Complete documentation
- Three example implementations

**API Endpoints:**

- GET /api/widgets/events
- GET /api/widgets/standings/[eventId]
- POST /api/widgets/standings/[eventId]/recompute

---

## Credits

Created for Tropheo tournament management system.

**Technologies Used:**

- TypeScript
- React 18
- Next.js 14
- Turbo
- Vite
- MongoDB
