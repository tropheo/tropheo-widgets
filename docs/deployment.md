# Deployment Guide

This guide explains how to deploy and configure the Tropheo Widgets system, including both the server (API) and client implementations.

## Server Deployment

### Prerequisites

- Next.js application running (athloom-web)
- Organization dashboard with API key management feature deployed
- Database configured for storing API keys

### Overview

With the new self-service API key management system, organizations can generate and manage their own widget API keys through the dashboard. **No manual environment variable configuration is needed** for individual API keys.

### Step 1: Verify Widget API Routes Are Deployed

The widget API routes should be deployed in the `athloom-web` project:

```
app/
├── api/
│   └── widgets/
│       ├── events/
│       │   └── route.ts
│       └── standings/
│           └── [eventId]/
│               ├── route.ts
│               └── recompute/
│                   └── route.ts
└── lib/
    └── middleware/
        └── widgetAuth.ts
```

Ensure these files are deployed to your production environment.

### Step 2: Verify Organization Dashboard

Confirm that the organization dashboard includes the API key management interface:

#### Dashboard Access

- **Navigation:** Organization profile → **Manage Organization** → **API Keys**
- **Requirement:** Must be logged in as organization admin
- Features:
  - Create new API keys
  - View active/inactive keys
  - Activate/deactivate toggle
  - View last used timestamp
  - Delete keys

### Step 3: Database Schema

Ensure your database has the appropriate schema for storing API keys:

- API key storage (hashed/encrypted)
- Organization association
- Key metadata (name, created date, last used)
- Active/inactive status

### Step 4: Test the System

Test the complete flow:

1. **Generate a test API key:**
   - Log in to an organization dashboard
   - Go to your organization profile
   - Click "Manage Organization" (admin only)
   - Navigate to "API Keys" section
   - Create a new key
   - Copy the generated key

2. **Test the API endpoints:**

```bash
# Replace with your actual values
API_KEY="generated-key-from-dashboard"
BASE_URL="https://your-tropheo-instance.com"
PARENT_EVENT_ID="your-parent-event-id"

# Test events endpoint
curl -H "Authorization: $API_KEY" \
  "$BASE_URL/api/widgets/events?parentEventId=$PARENT_EVENT_ID"

# Test standings endpoint
curl -H "Authorization: $API_KEY" \
  "$BASE_URL/api/widgets/standings/event-123?eventRole=DIVISION"
```

Expected response (200 OK):

```json
{
  "standings": [...],
  "eventName": "Tournament Name",
  "status": "success"
}
```

3. **Verify key deactivation:**
   - Deactivate the key in the dashboard
   - Retry the API request
   - Should receive `401 Unauthorized`

4. **Verify usage tracking:**
   - Make an API request with the key
   - Check the "Last Used" timestamp in the dashboard
   - Should update to the current time

### Step 5: Monitor and Log

Check your application logs for widget API requests:

```bash
# Vercel
vercel logs

# Google Cloud
gcloud app logs tail -s default

# Docker
docker logs <container-id>
```

Look for:

- Authentication successes/failures
- API request patterns
- Error messages

## Client Deployment

### Option 1: NPM Registry (Recommended)

Publish packages to NPM for easy distribution:

```bash
cd tropheo_widgets

# Update versions
npm version patch  # or minor, major

# Publish all packages
npm run publish
```

Users can then install:

```bash
npm install @tropheo/react @tropheo/core @tropheo/types
```

### Option 2: Private NPM Registry

For private use, publish to a private registry:

**GitHub Packages:**

```json
// package.json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

```bash
npm publish
```

**Artifactory / Nexus:**

```bash
npm publish --registry https://your-registry.com
```

### Option 3: Direct Installation from Repository

Users can install directly from Git:

```bash
npm install git+https://github.com/your-org/tropheo_widgets.git#main
```

### Option 4: CDN Distribution

For the embed package, distribute via CDN:

**unpkg (automatic):**

```html
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
```

**Custom CDN:**

1. Build the embed package: `cd packages/embed && npm run build`
2. Upload `dist/` to your CDN (S3, Cloudflare, etc.)
3. Users reference: `<script src="https://cdn.yourdomain.com/tropheo-embed.js"></script>`

## Client Configuration

### Distributing API Keys

With the new self-service system, organizations generate their own API keys:

1. **Self-Service (Recommended):** Organizations generate keys from their organization profile → Manage Organization → API Keys
2. **Admin Assistance:** If needed, help organizations navigate to the API key management page
3. **Documentation:** Provide links to guides on generating and using API keys

### Onboarding Organizations

When onboarding new organizations:

1. Grant them access to the organization dashboard
2. Show them how to navigate to their organization profile → Manage Organization → API Keys
3. Demonstrate creating their first API key
4. Explain key management features (activate/deactivate, monitoring)
5. Provide integration documentation

### Client Setup Guide

Provide this to your clients:

**For Next.js:**

```bash
# Install packages
npm install @tropheo/react @tropheo/core @tropheo/types

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_TROPHEO_API_KEY=<provided-key>
NEXT_PUBLIC_TROPHEO_BASE_URL=https://your-tropheo-instance.com
EOF
```

**For React:**

```bash
npm install @tropheo/react @tropheo/core @tropheo/types

# Create .env
cat > .env << EOF
VITE_TROPHEO_API_KEY=<provided-key>
VITE_TROPHEO_BASE_URL=https://your-tropheo-instance.com
EOF
```

**For HTML:**

```html
<!-- No installation required -->
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
<script>
  const embed = new window.TropheoEmbed({
    apiKey: '<provided-key>',
    baseUrl: 'https://your-tropheo-instance.com',
  });
</script>
```

## Security Checklist

Before deploying to production:

- [ ] Organization dashboard with API key management deployed
- [ ] Database schema for API keys configured
- [ ] API key validation middleware working correctly
- [ ] HTTPS enabled on all endpoints
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (if applicable)
- [ ] Logging configured for security events
- [ ] Usage tracking ("Last Used" timestamp) working
- [ ] Key activation/deactivation feature tested
- [ ] Client documentation updated and distributed
- [ ] Organizations trained on key management

## Updating Widgets

### Server Updates

1. Deploy new API route code
2. Test in staging environment
3. Deploy to production
4. No client updates needed (backward compatible)

### Client Package Updates

1. Update package version: `npm version patch`
2. Publish to registry: `npm publish`
3. Notify clients to update: `npm update @tropheo/react`
4. Provide migration guide if breaking changes

## Troubleshooting Deployment

### API Returns 401 Unauthorized

**Cause:** API key not found, invalid, or deactivated

**Resolution:**

1. Verify the API key exists in the organization's dashboard
2. Check that the key is set to **Active** (not Inactive)
3. Ensure the key belongs to the correct organization
4. Test with a newly generated key
5. Check application logs for authentication errors

### API Key Not Working After Creation

**Cause:** Database issues or middleware not deployed

**Resolution:**

1. Verify API key was saved to database
2. Check that widgetAuth middleware is deployed
3. Test with curl:
   ```bash
   curl -H "Authorization: test-key" \
     https://your-instance.com/api/widgets/events?parentEventId=xyz
   ```
4. Check server logs for errors

### "Last Used" Timestamp Not Updating

**Cause:** Usage tracking not implemented or failing

**Resolution:**

1. Verify middleware updates timestamp on successful requests
2. Check database write permissions
3. Review server logs for update errors

### CORS Errors in Browser

**Cause:** Missing or incorrect CORS headers

**Resolution:**

- Verify `addCorsHeaders()` is called in all route handlers
- Check browser console for specific origin
- Verify OPTIONS requests are handled

### Package Not Found (NPM)

**Cause:** Package not published or wrong scope

**Resolution:**

```bash
# Check package exists
npm view @tropheo/react

# Verify you're logged in
npm whoami

# Re-publish if needed
npm publish
```

### CDN Script Not Loading

**Cause:** Build not uploaded or wrong path

**Resolution:**

```bash
# Build package
cd packages/embed
npm run build

# Verify dist/ folder created
ls -la dist/

# Upload to CDN with correct path
```

## Rollback Plan

If issues occur after deployment:

### Server Rollback

1. Revert to previous deployment
2. Or disable widget routes temporarily
3. Notify affected clients

### Client Rollback

1. Clients can pin to previous version: `npm install @tropheo/react@1.0.0`
2. Or use older CDN version: `@tropheo/embed@1.0.0`

## Monitoring

Set up monitoring for:

- API request volume
- Authentication failure rate
- Error rates per endpoint
- Response times
- Popular events/tournaments

**Example (Application Insights):**

```typescript
// In widget routes
import { trackEvent } from '@/lib/telemetry';

trackEvent('widget_request', {
  endpoint: '/api/widgets/standings',
  eventId: eventId,
  authenticated: true,
});
```

## Support

For deployment issues:

1. Check logs for error messages
2. Verify environment variables
3. Test API endpoints with curl
4. Review CORS and authentication
5. Contact Tropheo support if unresolved
