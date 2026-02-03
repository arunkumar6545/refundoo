# Professional Icons & Background Scanning

## Overview

This document describes the implementation of professional icons and background scanning features for the Refundoo app.

## Professional Icons

### Installation

To use professional icons from `react-icons`, install the package:

```bash
npm install react-icons
```

### Current Implementation

Currently, the app uses emoji fallbacks for icons. Once `react-icons` is installed, the icons will automatically switch to professional icons.

### Icon Components

Icons are centralized in `src/components/Icons.tsx`:

- **Navigation Icons**: Home, Add, History, Reports, Profile
- **Status Icons**: Calendar, Package, CheckCircle
- **Action Icons**: Refresh, Check, X, Alert, Search
- **Theme Icons**: Sun, Moon
- **Feature Icons**: Email, SMS, Settings, Shield, Lock

### Usage

```tsx
import { Icons } from './components/Icons';

// Use in components
<Icons.Home />
<Icons.Settings />
```

## Background Scanning

### Features

1. **Automatic Scanning**: Scans SMS and Email messages at configurable intervals
2. **Smart Filtering**: Only scans messages since the last scan time
3. **Auto-Import**: Optionally automatically imports found refunds
4. **Configurable**: Full control over scan intervals, keywords, and sources

### Settings

Access background scanning settings in **Settings → Background Scanning**:

- **Enable Background Scanning**: Master toggle for all background scanning
- **Scan SMS Messages**: Enable/disable SMS scanning (Android only)
- **Scan Email Messages**: Enable/disable email scanning
- **Scan Interval**: Choose from 5 minutes to 4 hours
- **Auto-Import Found Refunds**: Automatically import refunds found during scanning
- **Scan Keywords**: Comma-separated keywords to look for in messages
- **Test Scan**: Manually trigger a scan to test functionality

### How It Works

1. **Initialization**: Background scanner starts automatically if enabled in settings
2. **Periodic Scanning**: Scans at the configured interval
3. **Incremental Scanning**: Only scans messages since the last scan time
4. **Notification**: Notifies user when new refunds are found (if auto-import is disabled)
5. **Auto-Import**: Automatically creates refund records if enabled

### Technical Details

- **Service**: `src/services/backgroundScanner.ts`
- **Settings**: Stored in `AppSettings` type
- **Storage**: Uses localStorage for settings persistence
- **Notifications**: Uses notification service for user alerts

### Background Scanner API

```typescript
import { backgroundScanner } from './services/backgroundScanner';

// Start scanning
backgroundScanner.start();

// Stop scanning
backgroundScanner.stop();

// Perform a manual scan
await backgroundScanner.performScan();

// Check if active
const isActive = backgroundScanner.isActive();
```

### Settings Structure

```typescript
interface AppSettings {
  // ... other settings
  autoScanEnabled: boolean;
  scanInterval: number; // in minutes
  smsScanEnabled: boolean;
  emailScanEnabled: boolean;
  scanKeywords: string[]; // Keywords to look for
  autoImportEnabled: boolean;
  lastScanTime?: string; // ISO timestamp
}
```

## Default Settings

- **Auto-Scan**: Disabled by default
- **Scan Interval**: 15 minutes
- **SMS Scanning**: Disabled
- **Email Scanning**: Disabled
- **Auto-Import**: Disabled
- **Keywords**: ['refund', 'return', 'reimbursement', 'money back']

## Permissions

### SMS Scanning (Android)
- Requires `READ_SMS` permission
- Requested via `SMSPermissionManager` component
- Only works on Android devices

### Email Scanning
- Requires connected email accounts
- Configured via `EmailAccountManager` component
- Supports OAuth (Gmail, Yahoo, Outlook) and IMAP/POP3

## Best Practices

1. **Battery Optimization**: Longer scan intervals (30+ minutes) are better for battery life
2. **Privacy**: Only enable scanning for sources you trust
3. **Keywords**: Customize keywords to match your refund notification patterns
4. **Auto-Import**: Enable only if you trust the parsing accuracy
5. **Testing**: Use "Run Test Scan Now" to verify functionality before enabling auto-scan

## Troubleshooting

### Scanning Not Working

1. Check that permissions are granted (SMS/Email)
2. Verify that scanning is enabled in settings
3. Check that at least one source (SMS/Email) is enabled
4. Review browser console for errors

### Too Many Notifications

1. Enable auto-import to reduce notifications
2. Increase scan interval
3. Refine keywords to reduce false positives

### Battery Drain

1. Increase scan interval
2. Disable unused sources (SMS or Email)
3. Use more specific keywords to reduce processing

## Future Enhancements

- [ ] Machine learning for better refund detection
- [ ] Custom regex patterns for parsing
- [ ] Scheduled scanning (specific times)
- [ ] Cloud sync for scan history
- [ ] Advanced filtering options
