# Mobile App Build Instructions

## Prerequisites

### For Android:
- Android Studio (latest version)
- Java Development Kit (JDK) 11 or higher
- Android SDK

### For iOS:
- macOS (required)
- Xcode (latest version)
- CocoaPods (`sudo gem install cocoapods`)

## Build Steps

### 1. Build the Web App
```bash
npm run build
```

### 2. Sync with Capacitor
```bash
npm run cap:sync
```

This copies the built web app to the native projects.

### 3. Open Native Projects

#### For Android:
```bash
npm run cap:open:android
```
Or manually open `android/` folder in Android Studio.

#### For iOS:
```bash
npm run cap:open:ios
```
Or manually open `ios/App/App.xcworkspace` in Xcode.

## Building the Apps

### Android APK/AAB

1. Open Android Studio
2. Open the `android/` folder
3. Wait for Gradle sync to complete
4. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
5. APK will be generated in `android/app/build/outputs/apk/`

For release build:
- Go to **Build > Generate Signed Bundle / APK**
- Follow the signing wizard

### iOS App

1. Open Xcode
2. Open `ios/App/App.xcworkspace`
3. Select your development team in Signing & Capabilities
4. Connect an iOS device or select a simulator
5. Click **Run** (▶️) or press `Cmd + R`

For App Store distribution:
- Select **Product > Archive**
- Follow the App Store Connect process

## Important Notes

1. **SMS Permissions**: 
   - Android: Add `<uses-permission android:name="android.permission.READ_SMS" />` to `AndroidManifest.xml`
   - iOS: SMS reading requires special entitlements (limited support)

2. **Email Permissions**:
   - Configure OAuth credentials in `src/services/emailAuth.ts`
   - See `EMAIL_SETUP.md` for details

3. **App Icons**:
   - Replace icons in `android/app/src/main/res/` and `ios/App/App/Assets.xcassets/`
   - Use the generated `icon.svg` and `logo.svg` as reference

4. **App Name**:
   - Currently set to "Refundoo" in `capacitor.config.ts`
   - Update in native projects if needed

## Troubleshooting

### Build Errors:
- Run `npm run cap:sync` after any web build changes
- Clean and rebuild native projects
- Check that all dependencies are installed

### Permission Issues:
- Verify permissions in `AndroidManifest.xml` (Android)
- Check Info.plist permissions (iOS)
- Test on physical devices for SMS/Email access

### Capacitor Sync Issues:
- Delete `android/` and `ios/` folders
- Run `npm run cap:add:android` and `npm run cap:add:ios`
- Run `npm run cap:sync`

## Next Steps

1. Customize app icons and splash screens
2. Configure app signing certificates
3. Set up OAuth credentials for email providers
4. Test SMS/Email reading on physical devices
5. Submit to Google Play Store / Apple App Store
