# Demo User Journey Analytics

This is a **Next.js demo application** showcasing the [`user-journey-analytics`](https://www.npmjs.com/package/user-journey-analytics) npm package. This demo demonstrates how to integrate and use the journey tracking functionality in a real Next.js application.

> **Note:** Backend integration is **completely optional**. The package works perfectly fine without it — all analytics are calculated and stored in the browser. You can optionally send data to your own backend API.

## 📦 About

This demo app demonstrates all features of the `user-journey-analytics` package:
- ✅ Automatic page tracking
- ✅ Manual action tracking
- ✅ Action tracking with custom metadata
- ✅ Time spent per page
- ✅ Data persistence (localStorage)
- ✅ Session tracking (sessionStorage)
- ✅ Export to JSON, CSV, and PDF
- ✅ Real-time journey viewer
- ✅ **Optional** Backend API integration
- ✅ **Optional** Event batching and automatic flushing
- ✅ **Optional** Manual flush functionality

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

4. **Database (Optional):**
   The SQLite database will be automatically created at `data/journey.db` when the first event is sent to the backend API (if backend integration is enabled).

### Installing the Package in Your Own Project

To use `user-journey-analytics` in your own Next.js project:

```bash
npm i user-journey-analytics
```

## 🏗️ Project Structure

```
demo-user-journey/
├── app/
│   ├── layout.tsx              # JourneyProvider setup
│   ├── page.tsx                 # Home page with action tracking examples
│   ├── about/
│   │   └── page.tsx             # About page with simple action tracking
│   ├── products/
│   │   └── page.tsx             # Products page with product interaction tracking
│   ├── contact/
│   │   └── page.tsx             # Contact form with field-level tracking
│   ├── journey/
│   │   └── page.tsx             # Journey viewer with export functionality
│   ├── features/
│   │   └── page.tsx             # Comprehensive features demo page
│   └── components/
│       ├── Navigation.tsx       # Navigation bar with export dropdown
│       └── ExportButton.tsx     # Fixed floating export button
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
- Clear journey functionality
- Auto-refreshes every 2 seconds
- **Optional:** Manual flush to backend button (only if backend is configured)

### Features Page (`/features`)
- Comprehensive demonstration of all package features:
  1. Action tracking with metadata
  2. Product tracking with metadata
  3. Export journey data
  4. Automatic page tracking
  5. **Optional:** Manual flush to backend

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
          persist={true}                // Save to localStorage
          session={true}                // Use sessionStorage
          // Backend integration is OPTIONAL - remove these if not needed:
          // endpoint="/api/journey"      // Backend API endpoint (optional)
          // flushInterval={30000}       // Flush every 30 seconds (optional)
          // batchSize={10}              // Flush after 10 events (optional)
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
| `persist` | `boolean` | `false` | If `true`, saves journey data to `localStorage`. Data survives page refreshes and browser restarts. |
| `session` | `boolean` | `false` | If `true`, uses `sessionStorage` for one journey per browser tab/window. Data clears when tab is closed. |
| `storageKey` | `string` | `"user-journey-analytics"` | Custom key for localStorage/sessionStorage. Use this if you need multiple separate trackers. |
| `endpoint` | `string` | `undefined` | **(Optional)** Backend API endpoint to send events to (e.g., `/api/journey`). If provided, events are batched and sent to backend. |
| `apiKey` | `string` | `undefined` | **(Optional)** API key for backend authentication. |
| `flushInterval` | `number` | `30000` | **(Optional)** Time in milliseconds between automatic flushes (default: 30 seconds). Only used if `endpoint` is provided. |
| `batchSize` | `number` | `10` | **(Optional)** Number of events to buffer before auto-flushing (default: 10). Only used if `endpoint` is provided. |

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
- `metadata` (object, optional): Custom metadata object to attach to the action. Metadata is sent to backend (if configured) but not included in exported `JourneyData`.

**Returns:** `void`

**Use Cases:**
- Track button clicks
- Track form submissions
- Track product interactions
- Track any custom user actions
- Add rich context with metadata (product IDs, prices, user info, etc.)

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

Export the complete journey data as a JavaScript object. This is the main way to access all tracked data.

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
    // Note: metadata is not included in exported data (legacy format)
    // Metadata is only available via backend events
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

**Use Cases:**
- Export journey data for analysis
- Download as JSON file
- Convert to CSV for spreadsheet analysis
- Generate PDF reports
- Display journey data in UI
- Send to analytics services

**Example:**
```tsx
  const { exportJourney } = useJourney();

const handleExport = () => {
    const data = exportJourney();
  console.log("Journey Data:", data);
  
  // Download as JSON
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

##### `clearJourney()`

Clear all tracked journey data. Resets the journey to start fresh.

**Parameters:** None

**Returns:** `void`

**Use Cases:**
- Reset journey data for testing
- Clear data when user logs out
- Start a new session manually
- Debugging and development

**Example:**
```tsx
const { clearJourney } = useJourney();

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all journey data?")) {
      clearJourney();
    console.log("Journey data cleared");
  }
};
```

##### `flush()` - Optional (Backend Integration Only)

Manually flush pending events to the backend API. **Only works if `endpoint` is configured in `JourneyProvider`.**

**Parameters:** None

**Returns:** `Promise<void>`

**Use Cases:**
- Force immediate sync to backend
- Ensure events are sent before page unload
- Manual trigger for event batching
- Testing backend integration

**Example:**
```tsx
const { flush } = useJourney();

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
- [ ] Refresh page → Data persists (if `persist={true}`)
- [ ] Open new tab → Separate session (if `session={true}`)
- [ ] Visit Features page (`/features`) → See all features demonstrated
- [ ] **Optional:** Manual Flush → Events sent to backend immediately (if backend configured)

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

### 5. Working Without Backend

The package works perfectly fine without any backend:
- All analytics are calculated in the browser
- Data is stored in localStorage/sessionStorage
- Export functionality works without backend
- No external dependencies required

## 📚 Dependencies

This demo uses the following key dependencies:

- **user-journey-analytics** (^1.0.3) - The main tracking package
- **next** (16.1.0) - Next.js framework
- **react** (19.2.3) - React library
- **jspdf** (^3.0.4) - PDF generation
- **jspdf-autotable** (^5.0.2) - PDF table generation
- **tailwindcss** (^4) - Styling

---

## 🔌 Optional: Sending Data to Your Backend

> **Important:** Backend integration is **completely optional**. The package works perfectly fine without it — all analytics are calculated and stored in the browser. You can export and analyze data without any backend.

If you want to send journey events to your own backend API, you can use the `endpoint` prop and `flush()` function.

### How It Works

1. **Configure `endpoint`** in `JourneyProvider` - events are automatically batched and sent
2. **Use `flush()`** function - manually trigger sending events to your backend
3. **Events are batched** - sent in batches (default: 10 events or 30 seconds) for efficiency
4. **Reliable delivery** - uses `navigator.sendBeacon()` for guaranteed delivery

### Setting Up Backend Integration

#### 1. Configure JourneyProvider with Backend Endpoint

Add the `endpoint` prop to enable automatic event sending:

```tsx
<JourneyProvider 
  appName="My App"
  endpoint="/api/journey"        // Your backend API endpoint (optional)
  flushInterval={30000}          // Auto-flush every 30 seconds (optional)
  batchSize={10}                 // Auto-flush after 10 events (optional)
  apiKey="your-api-key"          // Optional: API key for authentication
>
  {children}
</JourneyProvider>
```

#### 2. Manual Flush Using `flush()` Function

You can also manually trigger sending events to your backend:

```tsx
"use client";

import { useJourney } from "user-journey-analytics";

export default function MyComponent() {
  const { flush } = useJourney();

  const handleSendToBackend = async () => {
    try {
      await flush();
      console.log("Events sent to backend successfully!");
    } catch (error) {
      console.error("Failed to send events:", error);
    }
  };

  return (
    <button onClick={handleSendToBackend}>
      Send Events to Backend
    </button>
  );
}
```

### Backend API Requirements

Your backend should accept POST requests with this structure:

**Request:**
```json
POST /api/journey
Content-Type: application/json
Authorization: Bearer your-api-key  // Optional

{
  "sessionId": "session-1234567890-abc123",
  "userId": "optional-user-id",
  "appName": "My App",
  "events": [
    {
      "type": "page_view",
      "path": "/about",
      "timestamp": 1234567890
    },
    {
      "type": "action",
      "path": "/",
      "action": "Button: Get Started Clicked",
      "timestamp": 1234567890,
      "metadata": {
        "buttonType": "primary"
      }
    },
    {
      "type": "page_exit",
      "path": "/about",
      "timestamp": 1234567890,
      "timeSpent": 5000
    }
  ]
}
```

**Response:**
```json
{
  "success": true
}
```

### Event Types

Events can be one of three types:

- **`page_view`** - When user navigates to a page
- **`action`** - When user performs an action (via `trackAction()`)
- **`page_exit`** - When user leaves a page (includes `timeSpent`)

### Example Backend Implementation

Here's a simple example using Next.js API route:

```typescript
// app/api/journey/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, appName, events } = body;

    // Validate API key (optional)
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Store events in your database (PostgreSQL, MongoDB, etc.)
    // Example: await db.events.insertMany(events);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**That's it!** The package handles all client-side batching, retries, and reliable delivery. Your backend just needs to accept and store the events.


---

## 📄 License

This demo application is for testing and demonstration purposes.

## 🤝 Contributing

This is a demo application. For issues or contributions related to the `user-journey-analytics` package itself, please refer to the package repository.
