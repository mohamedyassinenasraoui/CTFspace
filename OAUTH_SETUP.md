# OAuth Setup Guide

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen:
   - User Type: External (for testing) or Internal (for organization)
   - Add your app name, support email, etc.
6. Create OAuth Client:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:5173` (for dev) or your production URL
   - Authorized redirect URIs: `http://localhost:5173` (for dev) or your production URL
7. Copy the Client ID
8. Add to `frontend/.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id-here
   ```

## Apple Sign In Setup

Apple Sign In requires:
1. Apple Developer Account ($99/year)
2. App ID configured in Apple Developer Portal
3. Service ID for web authentication
4. Private key for JWT signing

For development, the Apple Sign In button is shown but will display "coming soon" message.

To fully implement:
1. Register your app in Apple Developer Portal
2. Create a Service ID
3. Configure return URLs
4. Generate a private key
5. Update the backend OAuth route to verify Apple JWT tokens properly

## Notes

- Google OAuth works immediately after setting up the Client ID
- Apple Sign In requires additional server-side JWT verification
- Both OAuth methods allow users to have duplicate usernames
- Email is still unique for account identification

