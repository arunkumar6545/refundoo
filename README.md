# Refundoo - Refunds Tracker

A frontend-only React application for tracking customer refunds, storing data locally in the browser with an upgrade path to Supabase later.

## Features

- ✅ Create, update, and delete refund requests
- ✅ Search and filter refunds by multiple criteria
- ✅ Sort refunds by date, amount, or status
- ✅ Summary dashboard with key metrics
- ✅ Export refunds to CSV
- ✅ Backup and restore data (JSON)
- ✅ **📱 Mobile App Support** - Build for Android and iOS
- ✅ **SMS/Email Scanning** - Automatically extract refund data from messages (mobile only)
- ✅ Simulated SMS/Email notifications (copy to clipboard or mailto:)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Browser notifications support

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Capacitor** for mobile app generation (Android & iOS)
- **React Router** for navigation
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **date-fns** for date formatting
- **localStorage** for data persistence

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Mobile App Development

This app can be built as native mobile apps for Android and iOS using Capacitor.

### Quick Start for Mobile

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the web app:**
   ```bash
   npm run build
   ```

3. **Add mobile platforms:**
   ```bash
   # For Android
   npm run cap:add:android
   
   # For iOS (macOS only)
   npm run cap:add:ios
   ```

4. **Sync and open:**
   ```bash
   npm run cap:sync
   npm run cap:open:android  # or cap:open:ios
   ```

### SMS/Email Reading

The mobile app includes features to automatically scan SMS and email messages for refund information:

- **Android**: Full SMS reading support with permissions
- **iOS**: Email scanning (SMS reading not available due to iOS restrictions)

See [MOBILE_SETUP.md](./MOBILE_SETUP.md) for detailed setup instructions.

## Usage

### Creating a Refund

1. Click "New Refund" on the dashboard
2. Fill in the required fields (Order ID, Customer Name, Contact Phone, Email, Amount, Currency, Reason)
3. Optionally add tags and notes
4. Click "Create Refund"

### Managing Refunds

- **Search**: Use the search box to find refunds by ID, Order ID, or Customer Name
- **Filter**: Filter by status, date range, or amount range
- **Sort**: Click column headers to sort by date, amount, or status
- **Edit**: Click "Edit" on any refund to modify it
- **Delete**: Click "Delete" to soft-delete a refund (marks as DELETED)
- **View Details**: Click "More" to see full refund details

### Notifications

- **SMS Text**: Click "Copy SMS Text" to copy a formatted SMS message to clipboard
- **Email Draft**: Click "Open Email Draft" to open your email client with a pre-filled message
- **Browser Notifications**: Enable in Settings and grant permission when prompted

### Export & Backup

- **Export CSV**: Click "Export CSV" to download all filtered refunds as a CSV file
- **Backup**: Go to Settings → Download Backup (JSON) to save all data
- **Restore**: Go to Settings → Restore from Backup to import previously saved data

### Settings

- **Theme**: Choose Light, Dark, or System (follows OS preference)
- **Notification Mode**: Choose how notifications are displayed
- **Default Status Filter**: Set the default filter for the dashboard
- **Storage Info**: View total records and storage usage

## Data Storage

All data is stored locally in the browser's `localStorage`. The data structure:

- `refunds_v1`: Array of all refund records
- `settings_v1`: Application settings

## Future Enhancements

- Multi-user support with Supabase Auth
- Real SMS/Email integration via Supabase Edge Functions
- Role-based access control
- File attachments stored in Supabase Storage
- Audit log of all status changes

## Project Structure

```
src/
  components/       # React components
  hooks/           # Custom React hooks
  pages/           # Page components
  services/        # Business logic (storage, notifications, export)
  types/           # TypeScript type definitions
  App.tsx          # Main app component with routing
  main.tsx         # Entry point
  index.css        # Global styles
```

## License

MIT
