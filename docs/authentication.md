# Authentication

Tropheo Widgets uses API key authentication to secure access to your tournament data.

## Getting an API Key

Contact your Tropheo administrator to obtain an API key for your application.

## Using API Keys

### Client-Side (React/Embed)

Pass the API key when initializing the widgets:

```typescript
const widgets = new TropheoWidgets({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-tropheo-instance.com',
});
```

### Environment Variables (Recommended)

For security, store API keys in environment variables:

**Next.js:**

```bash
# .env.local
NEXT_PUBLIC_TROPHEO_API_KEY=your-api-key-here
NEXT_PUBLIC_TROPHEO_BASE_URL=https://your-tropheo-instance.com
```

```tsx
const widgets = new TropheoWidgets({
  apiKey: process.env.NEXT_PUBLIC_TROPHEO_API_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_TROPHEO_BASE_URL!,
});
```

**React (Vite):**

```bash
# .env
VITE_TROPHEO_API_KEY=your-api-key-here
VITE_TROPHEO_BASE_URL=https://your-tropheo-instance.com
```

```tsx
const widgets = new TropheoWidgets({
  apiKey: import.meta.env.VITE_TROPHEO_API_KEY,
  baseUrl: import.meta.env.VITE_TROPHEO_BASE_URL,
});
```

## Server Configuration

### Setting Up API Keys

On the Tropheo server, configure the `WIDGET_API_KEYS` environment variable with a comma-separated list of valid API keys:

```bash
WIDGET_API_KEYS=key1,key2,key3
```

Or in your deployment configuration:

```yaml
# env-vars.yaml
env_variables:
  WIDGET_API_KEYS: 'key1,key2,key3'
```

### Creating Secure API Keys

Generate strong, random API keys:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

Example output: `a5f8b3c7d9e2f1a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2`

## How Authentication Works

1. Client includes API key in `Authorization` header:

   ```
   Authorization: your-api-key-here
   ```

2. Server validates the key against `WIDGET_API_KEYS` environment variable

3. If valid, request is processed. If invalid, returns `401 Unauthorized`

## Security Best Practices

### DO:

✅ Store API keys in environment variables  
✅ Use different keys for different environments (dev, staging, production)  
✅ Generate long, random API keys (32+ characters)  
✅ Rotate keys periodically  
✅ Use HTTPS for all API requests

### DON'T:

❌ Commit API keys to version control  
❌ Share keys publicly or in client-side code without environment variables  
❌ Use simple or guessable keys  
❌ Reuse the same key across multiple applications

## API Key Rotation

To rotate an API key:

1. Generate a new key
2. Add new key to `WIDGET_API_KEYS` (keep old key temporarily)
3. Update clients to use new key
4. After all clients are updated, remove old key from `WIDGET_API_KEYS`

Example during rotation:

```bash
# Old key: abc123
# New key: xyz789
WIDGET_API_KEYS=abc123,xyz789
```

After migration:

```bash
WIDGET_API_KEYS=xyz789
```

## CORS Configuration

The widget API includes CORS headers to allow embedding from external domains:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

For production, consider restricting origins to specific domains:

```typescript
// In widgetAuth.ts middleware
const allowedOrigins = ['https://your-website.com', 'https://partner-site.com'];

const origin = request.headers.get('origin');
if (origin && allowedOrigins.includes(origin)) {
  headers.set('Access-Control-Allow-Origin', origin);
}
```

## Troubleshooting

### 401 Unauthorized

**Cause:** Invalid or missing API key

**Solutions:**

- Verify API key is correct
- Check environment variables are loaded
- Ensure `WIDGET_API_KEYS` is set on the server
- Verify no extra whitespace in keys

### CORS Errors

**Cause:** Browser blocking cross-origin requests

**Solutions:**

- Verify CORS headers are present in API responses
- Check browser console for specific error
- Ensure `OPTIONS` preflight requests are handled

### API Key Not Working

**Cause:** Key mismatch or configuration issue

**Solutions:**

```bash
# Check server configuration
echo $WIDGET_API_KEYS

# Test API key
curl -H "Authorization: your-api-key" \
  https://your-instance.com/api/widgets/events?parentEventId=xyz
```

## Example Implementation

Full authentication setup:

**Server (.env):**

```bash
WIDGET_API_KEYS=a5f8b3c7d9e2f1a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2
```

**Client (.env.local):**

```bash
NEXT_PUBLIC_TROPHEO_API_KEY=a5f8b3c7d9e2f1a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2
NEXT_PUBLIC_TROPHEO_BASE_URL=https://your-tropheo-instance.com
```

**Client Code:**

```tsx
const widgets = new TropheoWidgets({
  apiKey: process.env.NEXT_PUBLIC_TROPHEO_API_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_TROPHEO_BASE_URL!,
});

// API client automatically adds Authorization header to all requests
const response = await widgets.getClient().getStandings('event-123');
```
