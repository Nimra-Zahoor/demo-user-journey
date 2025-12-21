# Demo User Journey Tracker

This is a **Next.js demo application** showcasing the `user-journey-tracker` npm package. This demo demonstrates how to integrate and use the journey tracking functionality in a real Next.js application.

## 📦 About

This demo app tests all features of the `user-journey-tracker` package:
- ✅ Automatic page tracking
- ✅ Manual action tracking
- ✅ Time spent per page
- ✅ Data persistence (localStorage)
- ✅ Session tracking (sessionStorage)
- ✅ Export to JSON, CSV, and PDF

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install the local package:**
   ```bash
   npm install ../customer-journey-tracker
   ```

3. **Build the package (if needed):**
   ```bash
   cd ../customer-journey-tracker
   npm run build
   cd ../demo-user-journey
   ```

4. **Start the development server:**
```bash
npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Implementation Guide

### 1. Setting Up JourneyProvider

The `JourneyProvider` must wrap your entire application to enable tracking. In this demo, it's set up in `app/layout.tsx`.

#### Important: Client Component Required

Since `JourneyProvider` uses React hooks and browser APIs, your layout **must** be a client component:

```tsx
"use client";  // ← Required!

import { JourneyProvider } from "user-journey-tracker";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <JourneyProvider 
          appName="Demo User Journey App"
          devOnly={true}
          persist={true}
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
| `persist` | `boolean` | `false` | If `true`, saves journey data to `localStorage`. Data survives page refreshes and browser restarts. |
| `session` | `boolean` | `false` | If `true`, uses `sessionStorage` for one journey per browser tab/window. Data clears when tab is closed. |
| `storageKey` | `string` | `"user-journey-tracker"` | Custom key for localStorage/sessionStorage. Use this if you need multiple separate trackers. |

#### Prop Combinations

**Example 1: Development Only (No Persistence)**
```tsx
<JourneyProvider 
  appName="My App"
  devOnly={true}
  persist={false}
  session={false}
>
  {children}
</JourneyProvider>
```
- Tracks only in development
- Data is lost on page refresh
- Each page load starts fresh

**Example 2: Persistent Across Refreshes**
```tsx
<JourneyProvider 
  appName="My App"
  devOnly={false}
  persist={true}
  session={false}
>
  {children}
</JourneyProvider>
```
- Tracks in all environments
- Data survives page refresh
- Data persists until manually cleared

**Example 3: Session-Based (Per Tab)**
```tsx
<JourneyProvider 
  appName="My App"
  devOnly={false}
  persist={false}
  session={true}
>
  {children}
</JourneyProvider>
```
- One journey per browser tab
- Data clears when tab closes
- Each tab has separate journey

**Example 4: Full Features (This Demo)**
```tsx
<JourneyProvider 
  appName="Demo User Journey App"
  devOnly={true}
  persist={true}
  session={true}
>
  {children}
</JourneyProvider>
```
- Tracks in development only
- Data persists across refreshes
- Session-based (per tab)
- **Note:** When both `persist` and `session` are enabled, `sessionStorage` takes precedence

### 2. Using the useJourney Hook

The `useJourney()` hook provides three functions for tracking and managing journey data. It can be used in any client component.

#### Import and Usage

```tsx
"use client";  // ← Required for client components

import { useJourney } from "user-journey-tracker";

export default function MyComponent() {
  const { trackAction, exportJourney, clearJourney } = useJourney();
  
  // Use the functions...
}
```

#### Hook Functions

##### `trackAction(action: string)`

Manually track a user action (button clicks, form submissions, etc.).

**Parameters:**
- `action` (string): Description of the action being tracked

**Returns:** `void`

**Example from `app/page.tsx`:**
```tsx
export default function Home() {
  const { trackAction } = useJourney();

  const handleButtonClick = (action: string) => {
    trackAction(action);
    alert(`Action tracked: ${action}`);
  };

  return (
    <button onClick={() => handleButtonClick("Button: Get Started Clicked")}>
      Get Started
    </button>
  );
}
```

**Example from `app/components/Navigation.tsx`:**
```tsx
export default function Navigation() {
  const { trackAction } = useJourney();

  const handleNavClick = (page: string) => {
    trackAction(`Navigation: Clicked ${page}`);
  };

  return (
    <Link 
      href="/about"
      onClick={() => handleNavClick("About")}
    >
      About
    </Link>
  );
}
```

**Example from `app/contact/page.tsx` (Form Tracking):**
```tsx
export default function Contact() {
  const { trackAction } = useJourney();
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleInputChange = (field: string, value: string) => {
    trackAction(`Contact: Typed in ${field} field`);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackAction("Contact: Form Submitted");
    // ... submit logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        onChange={(e) => handleInputChange("name", e.target.value)}
      />
      {/* ... */}
    </form>
  );
}
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

**Example from `app/journey/page.tsx`:**
```tsx
export default function JourneyViewer() {
  const { exportJourney } = useJourney();
  const [journeyData, setJourneyData] = useState(null);

  const refreshData = () => {
    const data = exportJourney();
    setJourneyData(data);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>Pages Visited: {journeyData?.pages?.length || 0}</p>
      <p>Actions Tracked: {journeyData?.actions?.length || 0}</p>
      {/* Display data... */}
    </div>
  );
}
```

##### `clearJourney()`

Clear all tracked journey data.

**Parameters:** None

**Returns:** `void`

**Example:**
```tsx
export default function JourneyViewer() {
  const { clearJourney, exportJourney } = useJourney();

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all journey data?")) {
      clearJourney();
      // Journey data is now cleared
    }
  };

  return (
    <button onClick={handleClear}>
      Clear Journey
    </button>
  );
}
```

### 3. Automatic Page Tracking

Once `JourneyProvider` is set up, **page navigation is automatically tracked**. You don't need to do anything - the provider uses Next.js's `usePathname()` and `useSearchParams()` hooks to track route changes.

**How it works:**
- When a user navigates to a new page, the provider automatically calls `journeyStore.addPage(path)`
- The current page path (including query parameters) is recorded
- Time spent on the previous page is calculated and stored
- A new page visit entry is created with timestamp

**Example:**
If a user navigates from `/` to `/about`, the following happens automatically:
1. Time spent on `/` is calculated
2. `/about` is added to the `pages` array
3. A new entry is added to `pageVisits` with timestamp
4. The timestamp for `/about` is stored

**No code required** - it just works! ✨

### 4. Export Functionality

This demo includes three export formats:

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

See `app/journey/page.tsx` for complete implementation.

## 📁 Project Structure

```
demo-user-journey/
├── app/
│   ├── layout.tsx          # JourneyProvider setup
│   ├── page.tsx            # Home page with action tracking
│   ├── about/
│   │   └── page.tsx        # About page
│   ├── products/
│   │   └── page.tsx        # Products page with interactions
│   ├── contact/
│   │   └── page.tsx        # Contact form with field tracking
│   ├── journey/
│   │   └── page.tsx        # Journey viewer with export functionality
│   └── components/
│       └── Navigation.tsx  # Navigation with click tracking
├── package.json
└── README.md
```

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Test Checklist

- [ ] Navigate between pages → Pages are automatically tracked
- [ ] Click buttons → Actions are tracked
- [ ] Fill forms → Form interactions are tracked
- [ ] Visit Journey Viewer → See all tracked data
- [ ] Export JSON → Download works
- [ ] Export CSV → Download works, opens in Excel
- [ ] Export PDF → Download works, displays correctly
- [ ] Refresh page → Data persists (if `persist={true}`)
- [ ] Open new tab → Separate session (if `session={true}`)

## 🔍 Key Implementation Points

### 1. Client Components Only

**Important:** Both `JourneyProvider` and `useJourney()` require client-side execution. Always use `"use client"` directive:

```tsx
"use client";  // ← Always required

import { JourneyProvider } from "user-journey-tracker";
// or
import { useJourney } from "user-journey-tracker";
```

### 2. Provider Placement

The `JourneyProvider` should wrap your entire app, typically in the root layout:

```tsx
// app/layout.tsx
"use client";
import { JourneyProvider } from "user-journey-tracker";

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
import { useJourney } from "user-journey-tracker";

export default function MyComponent() {
  const { trackAction, exportJourney, clearJourney } = useJourney();
  // Use functions...
}
```

### 4. Action Tracking Best Practices

- Use descriptive action names: `"Button: Get Started Clicked"` instead of `"click"`
- Include context: `"Contact: Form Submitted"` instead of `"submit"`
- Group by feature: `"Products: Add to Cart - Product A"`

## 📚 Learn More

- **Package Documentation:** See `../customer-journey-tracker/README.md`
- **Testing Guide:** See [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Next.js Documentation:** [https://nextjs.org/docs](https://nextjs.org/docs)

## 🤝 Contributing

This is a demo application. For issues or contributions related to the `user-journey-tracker` package itself, please refer to the main package repository.

## 📄 License

This demo application is for testing and demonstration purposes.
