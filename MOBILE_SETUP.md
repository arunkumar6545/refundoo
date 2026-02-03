# Mobile App Setup Guide

This guide will help you build the Refunds Tracker app for Android and iOS.

## Prerequisites

### For Android:
- [Android Studio](https://developer.android.com/studio) (latest version)
- Java Development Kit (JDK) 11 or higher
- Android SDK (API level 33+)

### For iOS:
- macOS (required)
- [Xcode](https://developer.apple.com/xcode/) (latest version)
- [CocoaPods](https://cocoapods.org/) (`sudo gem install cocoapods`)
- Apple Developer Account (for device testing and App Store)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Web App

```bash
npm run build
```

### 3. Initialize Capacitor (First Time Only)

#### For Android:
```bash
npm run cap:add:android
```

#### For iOS:
```bash
npm run cap:add:ios
```

### 4. Sync Native Projects

After making changes to your web app, sync with native projects:

```bash
npm run cap:sync
```

Or for specific platforms:
```bash
npm run cap:build:android
npm run cap:build:ios
```

## Building for Android

### 1. Open Android Studio

```bash
npm run cap:open:android
```

### 2. Configure Android Project

1. Wait for Gradle sync to complete
2. Go to `File > Project Structure` and verify:
   - Minimum SDK: 22 (Android 5.1)
   - Target SDK: 33 (Android 13)
   - Compile SDK: 33

### 3. Add SMS Permissions

The `AndroidManifest.xml` already includes SMS permissions. If you need to modify:

1. Open `android/app/src/main/AndroidManifest.xml`
2. Ensure these permissions are present:
   ```xml
   <uses-permission android:name="android.permission.READ_SMS" />
   <uses-permission android:name="android.permission.RECEIVE_SMS" />
   ```

### 4. Build APK

1. In Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. Or use command line:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

### 5. Install on Device

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. In Android Studio: `Run > Run 'app'`

## Building for iOS

### 1. Install CocoaPods Dependencies

```bash
cd ios/App
pod install
cd ../..
```

### 2. Open Xcode

```bash
npm run cap:open:ios
```

### 3. Configure iOS Project

1. Select the project in Xcode
2. Go to `Signing & Capabilities`
3. Select your development team
4. Enable required capabilities:
   - Background Modes (if needed)
   - Push Notifications (if needed)

### 4. Configure Info.plist

Add these keys to `ios/App/App/Info.plist`:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos</string>
<key>NSCameraUsageDescription</key>
<string>We need access to your camera</string>
```

**Note:** iOS doesn't allow direct SMS reading. Email access requires user to grant permissions through system settings.

### 5. Build and Run

1. Select a device or simulator
2. Click `Run` (⌘R) or `Product > Run`

### 6. Build for Distribution

1. `Product > Archive`
2. Follow the App Store submission process

## SMS Reading Setup (Android)

### Using Cordova SMS Plugin

1. Install the plugin in your Android project:
   ```bash
   cd android
   cordova plugin add cordova-plugin-sms
   ```

2. The plugin will be available through `window.cordova.plugins.SMS`

### Alternative: Use SMS Retriever API

For production, consider using Android's SMS Retriever API which doesn't require READ_SMS permission but requires server-side setup.

## Email Reading Setup

Email reading requires:
- **Android**: IMAP/POP3 access or email provider APIs
- **iOS**: Email app extensions or IMAP access

For production, consider:
1. OAuth integration with Gmail/Outlook APIs
2. IMAP/POP3 with user credentials
3. Email forwarding to a parsing service

## Testing

### Web Testing
```bash
npm run dev
```

### Android Testing
- Use Android Studio's emulator
- Or connect a physical device

### iOS Testing
- Use Xcode's iOS Simulator
- Or connect a physical device (requires Apple Developer account)

## Troubleshooting

### Android Issues

1. **Gradle Sync Failed**
   - Check internet connection
   - Update Android Studio
   - Invalidate caches: `File > Invalidate Caches / Restart`

2. **Permission Denied**
   - Check `AndroidManifest.xml` has required permissions
   - Request runtime permissions in code

3. **Build Errors**
   - Clean project: `Build > Clean Project`
   - Rebuild: `Build > Rebuild Project`

### iOS Issues

1. **Pod Install Fails**
   ```bash
   cd ios/App
   pod deintegrate
   pod install
   ```

2. **Signing Errors**
   - Select your development team in Xcode
   - Ensure certificates are valid

3. **Build Errors**
   - Clean build folder: `Product > Clean Build Folder` (⇧⌘K)
   - Delete DerivedData

## Production Build

### Android (APK/AAB)

1. Generate keystore:
   ```bash
   keytool -genkey -v -keystore refundtracker.keystore -alias refundtracker -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Update `android/app/build.gradle` with signing config

3. Build release:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

### iOS (IPA)

1. Archive in Xcode: `Product > Archive`
2. Distribute via App Store or Ad Hoc

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/ios/)
