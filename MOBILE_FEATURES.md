# Mobile Features Implementation

## Overview

The Refunds Tracker app has been enhanced with mobile app capabilities using Capacitor, allowing it to be built as native Android and iOS applications with SMS/Email reading features.

## New Features

### 1. SMS Reading (Android)
- **Automatic Scanning**: Scans SMS messages for refund-related information
- **Smart Parsing**: Extracts order IDs, amounts, currencies, status, and reasons from SMS
- **Permission Management**: Requests and manages SMS reading permissions
- **Batch Import**: Select and import multiple refunds at once

### 2. Email Reading (Android & iOS)
- **Email Parsing**: Extracts refund data from email subjects and bodies
- **Pattern Recognition**: Identifies order IDs, amounts, status updates
- **Customer Information**: Extracts customer names and email addresses

### 3. Permission System
- **Request UI**: User-friendly permission request dialogs
- **Status Checking**: Real-time permission status monitoring
- **Settings Integration**: Direct link to app settings for manual permission grants

## Implementation Details

### Services Created

1. **mobilePermissions.ts**
   - Handles permission requests for SMS and Email
   - Platform-specific permission handling
   - Settings integration

2. **smsReader.ts**
   - Reads SMS messages from device
   - Parses refund data using pattern matching
   - Supports batch scanning and import

3. **emailReader.ts**
   - Email message reading (placeholder for future implementation)
   - Email content parsing
   - Refund data extraction

### Components Created

1. **PermissionRequest.tsx**
   - Permission request UI
   - Status display
   - Settings navigation

2. **SMSEmailScanner.tsx**
   - Main scanning interface
   - Tab switching (SMS/Email)
   - Refund preview and selection
   - Batch import functionality

### Mobile Platform Setup

#### Android
- SMS reading permissions configured in `AndroidManifest.xml`
- Uses Cordova SMS plugin (via Capacitor)
- Runtime permission requests

#### iOS
- Email reading support (SMS reading not available due to iOS restrictions)
- Requires additional setup for email access
- Uses system email integration

## Usage

### For Users

1. **Grant Permissions**
   - Open the app on mobile device
   - Click "Scan SMS/Email for Refunds"
   - Grant requested permissions when prompted

2. **Scan Messages**
   - Select SMS or Email tab
   - Click "Scan [Type] for Refunds"
   - Review found refunds

3. **Import Refunds**
   - Select refunds to import
   - Click "Import Selected"
   - Refunds are added to your tracker

### For Developers

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Web App**
   ```bash
   npm run build
   ```

3. **Add Mobile Platforms**
   ```bash
   npm run cap:add:android
   npm run cap:add:ios  # macOS only
   ```

4. **Sync and Open**
   ```bash
   npm run cap:sync
   npm run cap:open:android
   npm run cap:open:ios
   ```

## Pattern Recognition

The parsing system recognizes:

- **Order IDs**: `ORD-123456`, `Order #123456`, `OrderID: 123456`
- **Amounts**: `$100`, `₹5000`, `100 USD`, `5000 INR`
- **Status**: `approved`, `rejected`, `paid`, `pending`
- **Reasons**: `defect`, `damaged`, `wrong`, `missing`, `late`, etc.

## Limitations

1. **iOS SMS Reading**: Not available due to iOS security restrictions
2. **Email Access**: Requires user to grant email account access
3. **Privacy**: All data processing happens on-device
4. **Accuracy**: Pattern matching may require manual verification

## Future Enhancements

- [ ] Gmail/Outlook API integration for better email access
- [ ] Machine learning for improved parsing accuracy
- [ ] Support for multiple languages
- [ ] Custom pattern configuration
- [ ] Background scanning
- [ ] Notification when new refunds detected

## Security & Privacy

- All SMS/Email reading happens locally on device
- No data is sent to external servers
- Permissions are requested explicitly
- Users can revoke permissions anytime
- Data stays in local storage

## Testing

### Web (Mock Data)
- Uses mock SMS/Email data for testing
- No permissions required
- Full feature testing available

### Android
- Requires physical device or emulator
- SMS permissions must be granted
- Test with real SMS messages

### iOS
- Requires physical device or simulator
- Email access requires account setup
- SMS reading not available

## Troubleshooting

### Permission Denied
- Check app settings
- Manually grant permissions in device settings
- Restart app after granting permissions

### No Refunds Found
- Verify messages contain refund-related keywords
- Check message format matches expected patterns
- Try manual entry as fallback

### Build Errors
- Ensure all dependencies are installed
- Run `npm run cap:sync` after code changes
- Check platform-specific requirements
