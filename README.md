# Demo User Journey Analytics

This is a **Next.js demo application** showcasing the [`user-journey-analytics`](https://www.npmjs.com/package/user-journey-analytics) npm package. This demo demonstrates how to integrate and use the journey tracking functionality in a real Next.js application with a complete backend integration.

## 📦 About

This demo app demonstrates all features of the `user-journey-analytics` package:
- ✅ Automatic page tracking
- ✅ Manual action tracking
- ✅ Action tracking with custom metadata
- ✅ Time spent per page
- ✅ **Backend API integration** with SQLite database
- ✅ Event batching and automatic flushing
- ✅ Manual flush functionality
- ✅ Data persistence (localStorage)
- ✅ Session tracking (sessionStorage)
- ✅ Export to JSON, CSV, and PDF
- ✅ Real-time journey viewer
- ✅ Database events viewer

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```
   
   This will automatically install `user-journey-analytics` from npm along with all other dependencies.

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Database:**
   The SQLite database will be automatically created at `data/journey.db` when the first event is sent to the backend API.

### Installing the Package in Your Own Project

To use `user-journey-analytics` in your own Next.js project:

```bash
npm i user-journey-analytics
```

## 🏗️ Project Structure

```
demo-user-journey/
├── app/
│   ├── layout.tsx              # JourneyProvider setup with backend integration
│   ├── page.tsx                 # Home page with action tracking examples
│   ├── about/
│   │   └── page.tsx             # About page with simple action tracking
│   ├── products/
│   │   └── page.tsx             # Products page with product interaction tracking
│   ├── contact/
│   │   └── page.tsx             # Contact form with field-level tracking
│   ├── journey/
│   │   └── page.tsx             # Journey viewer with export and flush functionality
│   ├── features/
│   │   └── page.tsx             # Comprehensive features demo page
│   ├── database/
│   │   └── page.tsx             # Database events viewer (SQLite)
│   ├── api/
│   │   └── journey/
│   │       └── route.ts         # Backend API endpoint (POST/GET)
│   └── components/
│       ├── Navigation.tsx       # Navigation bar with export dropdown
│       └── ExportButton.tsx     # Fixed floating export button
├── data/
│   └── journey.db               # SQLite database (auto-created)
├── package.json
└── README.md
```

## 🎯 Pages Overview

### Home Page (`/`)
- Demonstrates action tracking with metadata
- Multiple buttons with different action types
- Shows how to track button clicks with custom metadata (buttonType, userAgent, etc.)

### About Page (`/about`)
- Simple action tracking examples
- Demonstrates basic `trackAction()` usage without metadata

### Products Page (`/products`)
- Product interaction tracking
- Demonstrates tracking product views and add-to-cart actions with product metadata (productId, productName, price, category)

### Contact Page (`/contact`)
- Form field-level tracking
- Tracks individual field interactions (focus, typing)
- Form submission tracking with form data metadata

### Journey Viewer (`/journey`)
- Real-time journey data viewer
- Displays all tracked pages, actions, and page visits
- Export functionality (JSON, CSV, PDF)
- Manual flush to backend button
- Clear journey functionality
- Auto-refreshes every 2 seconds

### Features Page (`/features`)
- Comprehensive demonstration of all package features:
  1. Action tracking with metadata
  2. Product tracking with metadata
  3. Manual flush to backend
  4. Export journey data
  5. Automatic page tracking
  6. Backend integration overview

### Database Viewer (`/database`)
- View events stored in SQLite database
- Filter by session ID
- Adjustable limit
- Real-time statistics (total events, unique sessions, page views, actions)
- Displays event metadata
- Auto-refreshes every 5 seconds

## 🏗️ Backend API Integration

This demo includes a **production-ready backend API** that stores events in SQLite. The backend API is located at `app/api/journey/route.ts`.

### How It Works

1. **Events are batched** in the browser (default: 10 events or 30 seconds)
2. **Sent to backend** using `navigator.sendBeacon()` for reliable delivery
3. **Stored in SQLite** database at `data/journey.db`
4. **localStorage acts as buffer** - events are only cleared after successful backend confirmation

### API Endpoints

#### POST `/api/journey`
Stores events in the database.

**Request Body:**
```json
{
  "sessionId": "session-1234567890-abc123",
  "userId": "user-123",
  "appName": "Demo User Journey App",
  "events": [
    {
      "type": "page_view",
      "path": "/about",
      "timestamp": 1234567890,
      "timeSpent": 5000,
      "metadata": null
    },
    {
      "type": "action",
      "action": "Button: Get Started Clicked",
      "path": "/",
      "timestamp": 1234567890,
      "metadata": {
        "buttonType": "primary",
        "page": "/"
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "inserted": 2
}
```

#### GET `/api/journey`
Query stored events from the database.

**Query Parameters:**
- `sessionId` (optional): Filter by session ID
- `limit` (optional): Limit results (default: 100)

**Example:**
```bash
# Get all events (last 100)
curl http://localhost:3000/api/journey

# Get events for a specific session
curl http://localhost:3000/api/journey?sessionId=session-1234567890-abc123

# Limit results
curl http://localhost:3000/api/journey?limit=50
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "events": [...]
}
```

### Database Schema

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id TEXT,
  app_name TEXT,
  event_type TEXT NOT NULL,  -- 'page_view', 'action', 'page_exit'
  path TEXT,
  action TEXT,
  timestamp INTEGER NOT NULL,
  time_spent INTEGER,
  metadata TEXT,  -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_id ON events(session_id);
CREATE INDEX idx_timestamp ON events(timestamp);
CREATE INDEX idx_event_type ON events(event_type);
```

### API Authentication (Optional)

The API supports optional API key authentication via environment variable:

1. Create `.env.local` file:
   ```env
   API_KEY=your-secret-api-key-here
   ```

2. The API will check for the API key in:
   - `Authorization: Bearer <apiKey>` header, or
   - `?apiKey=<apiKey>` query parameter

If `API_KEY` is set in environment variables, requests without a valid key will return `401 Unauthorized`.

## 🛠️ Implementation Guide

### 1. Setting Up JourneyProvider

The `JourneyProvider` must wrap your entire application to enable tracking. In this demo, it's set up in `app/layout.tsx`.

#### Important: Client Component Required

Since `JourneyProvider` uses React hooks and browser APIs, your layout **must** be a client component:

```tsx
"use client";  // ← Required!

import { JourneyProvider } from "user-journey-analytics";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <JourneyProvider 
          appName="Demo User Journey App"
          devOnly={true}
          endpoint="/api/journey"      // Backend API endpoint
          flushInterval={30000}         // Flush every 30 seconds
          batchSize={10}                // Flush after 10 events
          persist={true}                // Also save to localStorage (for debugging)
          session={true}
        >
          {children}
        </JourneyProvider>
      </body>
    </html>
  );
}
```

#### JourneyProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appName` | `string` | `undefined` | Optional name for your application. Appears in exported journey data. |
| `devOnly` | `boolean` | `false` | If `true`, tracking only works when `NODE_ENV === "development"`. Automatically disables in production builds. |
| `endpoint` | `string` | `undefined` | Backend API endpoint to send events to (e.g., `/api/journey`). If provided, events are batched and sent to backend. |
| `apiKey` | `string` | `undefined` | Optional API key for backend authentication. |
| `flushInterval` | `number` | `30000` | Time in milliseconds between automatic flushes (default: 30 seconds). |
| `batchSize` | `number` | `10` | Number of events to buffer before auto-flushing (default: 10). |
| `persist` | `boolean` | `false` | If `true`, saves journey data to `localStorage`. Data survives page refreshes and browser restarts. |
| `session` | `boolean` | `false` | If `true`, uses `sessionStorage` for one journey per browser tab/window. Data clears when tab is closed. |
| `storageKey` | `string` | `"user-journey-analytics"` | Custom key for localStorage/sessionStorage. Use this if you need multiple separate trackers. |

### 2. Using the useJourney Hook

The `useJourney()` hook provides functions for tracking and managing journey data. It can be used in any client component.

#### Import and Usage

```tsx
"use client";  // ← Required for client components

import { useJourney } from "user-journey-analytics";

export default function MyComponent() {
  const { trackAction, exportJourney, clearJourney, flush } = useJourney();
  
  // Use the functions...
}
```

#### Hook Functions

##### `trackAction(action: string, metadata?: object)`

Manually track a user action (button clicks, form submissions, etc.).

**Parameters:**
- `action` (string): Description of the action being tracked
- `metadata` (object, optional): Custom metadata object to attach to the action

**Returns:** `void`

**Example from `app/page.tsx`:**
```tsx
const { trackAction } = useJourney();

const handleButtonClick = (action: string, buttonType: string) => {
  trackAction(action, {
    buttonType,
    page: "/",
    timestamp: Date.now(),
    userAgent: navigator.userAgent.substring(0, 50),
  });
};
```

**Example from `app/products/page.tsx`:**
```tsx
const handleAddToCart = (product) => {
  trackAction(`Products: Add to Cart - ${product.name}`, {
    productId: product.id,
    productName: product.name,
    price: product.price,
    category: "electronics",
    actionType: "add_to_cart",
    timestamp: Date.now(),
  });
};
```

**Example from `app/contact/page.tsx` (Form Tracking):**
```tsx
const handleInputChange = (field: string, value: string) => {
  trackAction(`Contact: Typed in ${field} field`, {
    fieldName: field,
    hasValue: value.length > 0,
    valueLength: value.length,
    formType: "contact",
  });
};
```

##### `exportJourney()`

Export the complete journey data as a JavaScript object.

**Parameters:** None

**Returns:** `JourneyData` object with the following structure:
```typescript
{
  appName?: string;
  sessionStart: number;        // Timestamp
  pages: string[];            // Array of visited page paths
  actions: Array<{            // Array of tracked actions
    page: string;
    action: string;
    time: string;              // ISO timestamp
    metadata?: object;         // Custom metadata
  }>;
  pageVisits: Array<{          // Array of page visits with timing
    path: string;
    timestamp: number;
    timeSpent?: number;        // Milliseconds spent on page
  }>;
  timestamps: {                // Object mapping pages to timestamps
    [path: string]: number;
  };
}
```

##### `clearJourney()`

Clear all tracked journey data.

**Parameters:** None

**Returns:** `void`

##### `flush()`

Manually flush pending events to the backend API.

**Parameters:** None

**Returns:** `Promise<void>`

**Example:**
```tsx
const handleFlush = async () => {
  try {
    await flush();
    console.log("Events flushed successfully!");
  } catch (error) {
    console.error("Flush error:", error);
  }
};
```

### 3. Automatic Page Tracking

Once `JourneyProvider` is set up, **page navigation is automatically tracked**. You don't need to do anything - the provider uses Next.js's `usePathname()` and `useSearchParams()` hooks to track route changes.

**How it works:**
- When a user navigates to a new page, the provider automatically calls `journeyStore.addPage(path)`
- The current page path (including query parameters) is recorded
- Time spent on the previous page is calculated and stored
- A new page visit entry is created with timestamp

**No code required** - it just works! ✨

### 4. Export Functionality

This demo includes three export formats implemented in multiple places:

#### JSON Export
```tsx
const handleExportJSON = () => {
  const data = exportJourney();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `journey-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

#### CSV Export
```tsx
const handleExportCSV = () => {
  const data = exportJourney();
  let csvContent = "Journey Data Export\n";
  csvContent += `App Name: ${data.appName || "N/A"}\n`;
  // ... format data as CSV
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  // ... download logic
};
```

#### PDF Export
```tsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const handleExportPDF = () => {
  const data = exportJourney();
  const doc = new jsPDF();
  // ... format and add tables
  doc.save(`journey-${Date.now()}.pdf`);
};
```

See `app/journey/page.tsx`, `app/components/Navigation.tsx`, and `app/components/ExportButton.tsx` for complete implementations.

## 🧪 Testing

### Quick Test Checklist

- [ ] Navigate between pages → Pages are automatically tracked
- [ ] Click buttons → Actions are tracked
- [ ] Fill forms → Form interactions are tracked
- [ ] Visit Journey Viewer (`/journey`) → See all tracked data in real-time
- [ ] Export JSON → Download works
- [ ] Export CSV → Download works, opens in Excel
- [ ] Export PDF → Download works, displays correctly
- [ ] Manual Flush → Events sent to backend immediately
- [ ] Visit Database Viewer (`/database`) → See events stored in SQLite
- [ ] Refresh page → Data persists (if `persist={true}`)
- [ ] Open new tab → Separate session (if `session={true}`)
- [ ] Visit Features page (`/features`) → See all features demonstrated

### Testing Backend Integration

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate through the app** and perform various actions

3. **Check the database:**
   - Visit `/database` to see stored events
   - Or query the API directly: `curl http://localhost:3000/api/journey`

4. **Verify batching:**
   - Perform actions quickly - they should batch together
   - Wait 30 seconds - events should auto-flush
   - Or click "Flush to Backend" in Journey Viewer

## 🔍 Key Implementation Points

### 1. Client Components Only

**Important:** Both `JourneyProvider` and `useJourney()` require client-side execution. Always use `"use client"` directive:

```tsx
"use client";  // ← Always required

import { JourneyProvider } from "user-journey-analytics";
// or
import { useJourney } from "user-journey-analytics";
```

### 2. Provider Placement

The `JourneyProvider` should wrap your entire app, typically in the root layout:

```tsx
// app/layout.tsx
"use client";
import { JourneyProvider } from "user-journey-analytics";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <JourneyProvider {...props}>
          {children}
        </JourneyProvider>
      </body>
    </html>
  );
}
```

### 3. Hook Usage

Use `useJourney()` in any client component that needs to track actions or access journey data:

```tsx
// Any component file
"use client";
import { useJourney } from "user-journey-analytics";

export default function MyComponent() {
  const { trackAction, exportJourney, clearJourney, flush } = useJourney();
  // Use functions...
}
```

### 4. Action Tracking Best Practices

- Use descriptive action names: `"Button: Get Started Clicked"` instead of `"click"`
- Include context: `"Contact: Form Submitted"` instead of `"submit"`
- Group by feature: `"Products: Add to Cart - Product A"`
- Add metadata for rich analytics: product IDs, prices, categories, user info, etc.

### 5. Backend Integration

- Events are automatically batched (10 events or 30 seconds)
- Uses `navigator.sendBeacon()` for reliable delivery
- Events are only cleared from localStorage after successful backend confirmation
- Manual flush available via `flush()` function

## 📚 Dependencies

This demo uses the following key dependencies:

- **user-journey-analytics** (^1.0.4) - The main tracking package
- **next** (16.1.0) - Next.js framework
- **react** (19.2.3) - React library
- **better-sqlite3** (^12.5.0) - SQLite database for backend storage
- **jspdf** (^3.0.4) - PDF generation
- **jspdf-autotable** (^5.0.2) - PDF table generation
- **tailwindcss** (^4) - Styling

## 📄 License

This demo application is for testing and demonstration purposes.

## 🤝 Contributing

This is a demo application. For issues or contributions related to the `user-journey-analytics` package itself, please refer to the package repository.
