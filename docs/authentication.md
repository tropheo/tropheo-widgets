# Authentication

Tropheo Widgets uses API key authentication to secure access to your tournament data.

## Getting an API Key

### For Organization Administrators

Organizations can now generate their own API keys through the self-service dashboard:

1. **Log in** to your Tropheo organization dashboard
2. **Go to** your **organization profile**
3. **Click** **"Manage profile"** (admin only)
4. **Navigate to** the **"API Keys"** section
5. **Click** the **"Create New API Key"** button
6. **Enter** a descriptive name for your key (e.g., "Website Widget", "Mobile App", "Partner Integration")
7. **Copy** the generated API key immediately (it will only be shown once!)
8. **Store** the key securely

### For Developers

If you're implementing widgets for an organization:

1. Request access to the organization's dashboard, OR
2. Ask the organization administrator to generate an API key and share it with you securely

**Important:** API keys are sensitive credentials. Treat them like passwords and never share them in public repositories or unsecured channels.

## Managing Your API Keys

### Dashboard Features

From the API Keys section (organization profile → Manage profile → API Keys), you can:

- **View all keys**: See both active and inactive API keys
- **Activate/Deactivate**: Toggle keys on/off without deleting them
- **Monitor usage**: Check when each key was last used
- **Delete keys**: Permanently remove keys you no longer need

### Key Information

For each API key, you can see:

| Field     | Description                              |
| --------- | ---------------------------------------- |
| Name      | The descriptive name you assigned        |
| Created   | When the key was generated               |
| Last Used | Timestamp of the most recent API request |
| Status    | Active (usable) or Inactive (disabled)   |
| Actions   | Delete button to remove the key          |

### Deactivating vs. Deleting

- **Deactivate**: Temporarily disable a key without losing its history. You can reactivate it later.
- **Delete**: Permanently remove the key. This action cannot be undone.

**Best Practice**: Deactivate unused keys instead of deleting them to maintain usage history.

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

## How Authentication Works

1. Client includes API key in `Authorization` header:

   ```
   Authorization: your-api-key-here
   ```

2. Server validates the key against the organization's API keys in the database

3. Server checks that the key is active (not deactivated)

4. If valid and active, request is processed. If invalid or inactive, returns `401 Unauthorized`

5. Server updates the "Last Used" timestamp for the key

## Security Best Practices

### DO:

✅ Store API keys in environment variables  
✅ Use different keys for different integrations (website, mobile app, etc.)  
✅ Give keys descriptive names to identify their purpose  
✅ Regularly review the "Last Used" column to identify unused keys  
✅ Deactivate keys immediately if you suspect they're compromised  
✅ Use HTTPS for all API requests  
✅ Delete or deactivate keys when they're no longer needed

### DON'T:

❌ Commit API keys to version control  
❌ Share keys via email, chat, or other unsecured channels  
❌ Reuse the same key across multiple unrelated applications  
❌ Leave inactive keys activated  
❌ Share keys publicly or embed them directly in client-side code without environment variables

## API Key Rotation

To rotate an API key:

1. **Create** a new key in the dashboard with a descriptive name (e.g., "Website Widget v2")
2. **Update** your applications to use the new key
3. **Test** that the new key works in all environments
4. **Deactivate** the old key (recommended) or delete it
5. **Monitor** the old key's "Last Used" timestamp to ensure no systems are still using it

### Gradual Migration

You can keep both keys active during migration:

1. Generate new key (both keys now active)
2. Update applications one by one
3. Monitor "Last Used" for both keys
4. Once old key hasn't been used for several days, deactivate or delete it

### Emergency Key Deactivation

If a key is compromised:

1. Go to your organization profile → Manage profile → API Keys immediately
2. Find the compromised key
3. Toggle it to **Inactive** (instant effect)
4. Generate a new key
5. Update your applications with the new key
6. Delete the old key once you're sure it's not being used

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

**Cause:** Invalid, missing, or deactivated API key

**Solutions:**

- Verify API key is correct (check for typos)
- Go to your organization profile → Manage profile → API Keys and verify the key is **Active** (not Inactive)
- Check environment variables are loaded correctly
- Ensure no extra whitespace in the key
- If key was recently deactivated, reactivate it or generate a new one

### "API Key Not Found"

**Cause:** Key was deleted or never existed

**Solutions:**

- Generate a new API key from the dashboard
- Verify you're using the correct organization's key
- Check that you copied the complete key when it was generated

### Key Not Working After Creation

**Cause:** Various configuration issues

**Solutions:**

- Verify the key is set to **Active** in the dashboard
- Check that you're making requests to the correct base URL
- Ensure the key is included in the `Authorization` header
- Test the key with a simple curl request:

```bash
curl -H "Authorization: your-api-key" \
  https://your-instance.com/api/widgets/events?parentEventId=xyz
```

### CORS Errors

**Cause:** Browser blocking cross-origin requests

**Solutions:**

- Verify CORS headers are present in API responses
- Check browser console for specific error
- Ensure `OPTIONS` preflight requests are handled

## Example Implementation

Complete authentication setup example:

**1. Generate API Key (Organization Dashboard):**

- Go to your organization profile
- Click "Manage profile" (admin only)
- Navigate to "API Keys" section
- Click "Create New API Key"
- Name it: "Production Website Widget"
- Copy the generated key

**2. Configure Client (.env.local for Next.js):**

```bash
NEXT_PUBLIC_TROPHEO_API_KEY=your-generated-key-here
NEXT_PUBLIC_TROPHEO_BASE_URL=https://your-tropheo-instance.com
```

**3. Client Code:**

```tsx
const widgets = new TropheoWidgets({
  apiKey: process.env.NEXT_PUBLIC_TROPHEO_API_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_TROPHEO_BASE_URL!,
});

// API client automatically adds Authorization header to all requests
const response = await widgets.getClient().getStandings('event-123');
```

**4. Monitor Usage:**

- Return to your organization profile → Manage profile → API Keys
- Check "Last Used" timestamp
- Deactivate if suspicious activity detected
