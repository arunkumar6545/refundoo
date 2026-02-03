# Email Authentication Setup Guide

This guide explains how to set up email authentication for Gmail, Yahoo, Outlook, and other email providers.

## Overview

The Refunds Tracker app supports multiple email providers through:
- **OAuth 2.0** for Gmail, Yahoo, and Outlook
- **IMAP/POP3** for generic email providers

## OAuth Setup (Gmail, Yahoo, Outlook)

### Gmail OAuth Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API

2. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:5173/oauth/callback` (for development)
   - Copy the Client ID

3. **Update Configuration**
   - In `src/services/emailAuth.ts`, replace `YOUR_GMAIL_CLIENT_ID` with your actual Client ID
   - For production, add your production redirect URI

### Yahoo OAuth Setup

1. **Create Yahoo Developer App**
   - Go to [Yahoo Developer Network](https://developer.yahoo.com/)
   - Create a new app
   - Get Client ID and Client Secret
   - Add redirect URI: `http://localhost:5173/oauth/callback`

2. **Update Configuration**
   - In `src/services/emailAuth.ts`, replace `YOUR_YAHOO_CLIENT_ID` with your Client ID

### Outlook OAuth Setup

1. **Create Microsoft App Registration**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to "Azure Active Directory" > "App registrations"
   - Create new registration
   - Add redirect URI: `http://localhost:5173/oauth/callback`
   - Copy Application (client) ID

2. **Update Configuration**
   - In `src/services/emailAuth.ts`, replace `YOUR_OUTLOOK_CLIENT_ID` with your Application ID

## IMAP/POP3 Setup (Generic Email)

For email providers that don't support OAuth, you can use IMAP or POP3:

### Common IMAP/POP3 Settings

**Gmail (IMAP):**
- Host: `imap.gmail.com`
- Port: `993`
- Requires: App Password (not regular password)

**Yahoo (IMAP):**
- Host: `imap.mail.yahoo.com`
- Port: `993`

**Outlook (IMAP):**
- Host: `outlook.office365.com`
- Port: `993`

**Generic Providers:**
- Check your email provider's documentation for IMAP/POP3 settings
- Common ports: IMAP (993), POP3 (995)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit credentials to version control**
2. **Use environment variables for OAuth Client IDs**
3. **Encrypt stored passwords** (IMAP/POP3 credentials)
4. **Use App Passwords** instead of regular passwords when possible
5. **Implement token refresh** for OAuth tokens
6. **Store tokens securely** (consider using secure storage)

## Environment Variables (Recommended)

Create a `.env` file:

```env
VITE_GMAIL_CLIENT_ID=your_gmail_client_id
VITE_YAHOO_CLIENT_ID=your_yahoo_client_id
VITE_OUTLOOK_CLIENT_ID=your_outlook_client_id
```

Then update `emailAuth.ts` to use:
```typescript
const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
```

## Backend Requirements (Production)

For production, you'll need a backend server to:
1. Exchange OAuth authorization codes for tokens
2. Store tokens securely
3. Refresh expired tokens
4. Handle IMAP/POP3 connections securely

The current implementation uses mock tokens for demonstration. In production:
- Create a backend API endpoint for OAuth callbacks
- Use a secure token storage solution
- Implement proper error handling and token refresh

## Testing

1. **OAuth Flow:**
   - Click "Connect" for Gmail/Yahoo/Outlook
   - You'll be redirected to the provider's login page
   - After authentication, you'll be redirected back
   - The account will be added to your connected accounts

2. **IMAP/POP3:**
   - Enter your email credentials
   - Test connection before saving
   - Account will be added if connection succeeds

## Troubleshooting

- **OAuth redirect fails:** Check redirect URI matches exactly
- **IMAP connection fails:** Verify credentials and port settings
- **Tokens expire:** Implement token refresh logic
- **Permission denied:** Check API permissions in provider console

## Next Steps

1. Set up OAuth credentials for your preferred providers
2. Update `emailAuth.ts` with your Client IDs
3. Test the connection flow
4. Implement backend for production token management
