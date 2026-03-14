# Deployment Guide

This guide explains how to deploy and configure the Tropheo Widgets system, including both the server (API) and client implementations.

## Server Deployment

### Prerequisites

- Next.js application running (athloom-web)
- Access to environment variables configuration
- Ability to deploy code changes

### Step 1: Deploy Widget API Routes

The widget API routes are located in the `athloom-web` project:

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

Deploy these files to your production environment.

### Step 2: Configure API Keys

Set up the `WIDGET_API_KEYS` environment variable with comma-separated API keys:

**Development (.env.local):**

```bash
WIDGET_API_KEYS=dev-key-1,dev-key-2
```

**Production:**

The method depends on your hosting platform:

**Vercel:**

```bash
vercel env add WIDGET_API_KEYS
# Enter: prod-key-1,prod-key-2,prod-key-3
```

**Google Cloud App Engine (app.yaml):**

```yaml
env_variables:
  WIDGET_API_KEYS: 'prod-key-1,prod-key-2,prod-key-3'
```

**Docker / Kubernetes:**

```yaml
env:
  - name: WIDGET_API_KEYS
    value: 'prod-key-1,prod-key-2,prod-key-3'
```

**AWS Elastic Beanstalk:**

```bash
aws elasticbeanstalk create-configuration-template \
  --environment-id e-xyz \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,\
    OptionName=WIDGET_API_KEYS,Value=prod-key-1,prod-key-2,prod-key-3
```

### Step 3: Generate Secure API Keys

Generate strong, random API keys for production:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Example output:

```
a5f8b3c7d9e2f1a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2
```

### Step 4: Test API Endpoints

After deployment, test that the endpoints are working:

```bash
# Replace with your actual values
API_KEY="your-api-key"
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

Provide API keys to clients securely:

1. **Direct Communication:** Email or secure messaging
2. **Customer Portal:** Dashboard where users can generate/view keys
3. **Provisioning Script:** Automated key generation on signup

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

- [ ] Strong API keys generated (32+ characters)
- [ ] API keys stored in environment variables (not in code)
- [ ] Different keys for dev/staging/production
- [ ] HTTPS enabled on all endpoints
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (if applicable)
- [ ] Logging configured for security events
- [ ] API key rotation plan established
- [ ] Keys shared securely with clients
- [ ] Client documentation distributed

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

**Cause:** API key not configured or invalid

**Resolution:**

```bash
# Check environment variable is set
echo $WIDGET_API_KEYS

# Restart application after setting environment variable
```

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
