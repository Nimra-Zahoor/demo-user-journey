# Testing Guide for user-journey-tracker

This guide explains how to test all functionalities of the `user-journey-tracker` package in this demo application.

## 🚀 Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Make sure the local package is installed**:
   ```bash
   npm install ../customer-journey-tracker
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📋 Test Scenarios

### 1. Automatic Page Tracking

**What it does**: Automatically tracks page navigation in your Next.js app.

**How to test**:
- Navigate between pages using the navigation bar:
  - Home (`/`)
  - About (`/about`)
  - Products (`/products`)
  - Contact (`/contact`)
  - Journey Viewer (`/journey`)
- Each page visit should be automatically tracked
- Go to the "Journey Viewer" page to see all tracked pages

**Expected result**: 
- All visited pages should appear in the "Pages Visited" section
- Each page should have a timestamp

### 2. Manual Action Tracking

**What it does**: Allows you to manually track user actions (button clicks, form interactions, etc.).

**How to test**:
- On the **Home page**:
  - Click "Get Started", "Learn More", "Sign Up", or "View Features" buttons
  - Each click should track an action
  
- On the **About page**:
  - Click "Read More", "Contact Team", or "View History" buttons
  
- On the **Products page**:
  - Click "View Details" on any product
  - Click "Add to Cart" on any product
  
- On the **Contact page**:
  - Type in the Name, Email, or Message fields (each keystroke tracks an action)
  - Submit the form

**Expected result**: 
- All actions should appear in the "Tracked Actions" section in Journey Viewer
- Each action shows the page it occurred on and the timestamp

### 3. Time Spent Tracking

**What it does**: Tracks how much time users spend on each page.

**How to test**:
- Visit a page (e.g., Home)
- Stay on the page for at least 10-15 seconds
- Navigate to another page
- Go to Journey Viewer and check "Page Visits with Time Spent"

**Expected result**: 
- Each page visit should show the time spent on that page
- Time is displayed in minutes and seconds (e.g., "2m 30s" or "45s")

### 4. Persistence (localStorage)

**What it does**: Saves journey data to localStorage, so it survives page refreshes.

**How to test**:
- Navigate to a few pages and perform some actions
- Go to Journey Viewer and note the data
- **Refresh the page** (F5 or Cmd/Ctrl + R)
- Go back to Journey Viewer

**Expected result**: 
- All journey data should still be present after refresh
- Session start time should remain the same

### 5. Session Tracking (sessionStorage)

**What it does**: Creates one journey per browser session (tab/window).

**How to test**:
- Open the app in a browser tab
- Navigate to a few pages
- Open the app in a **new tab** (same browser)
- Navigate to different pages in the new tab
- Go to Journey Viewer in both tabs

**Expected result**: 
- Each tab should have its own separate journey data
- Closing a tab and opening a new one should start a fresh journey

### 6. Export Journey Data

**What it does**: Export the complete journey data in multiple formats (JSON, CSV, PDF).

**How to test**:

#### JSON Export:
- Navigate to the Journey Viewer page (`/journey`)
- Click the "Export JSON" button
- A JSON file should download to your computer

**Expected result**: 
- The downloaded file should contain all journey data:
  - `appName`: The app name
  - `sessionStart`: Timestamp when the session started
  - `pages`: Array of all visited pages
  - `actions`: Array of all tracked actions
  - `pageVisits`: Array of page visits with time spent
  - `timestamps`: Object mapping pages to timestamps

#### CSV Export:
- Navigate to the Journey Viewer page (`/journey`)
- Click the "Export CSV" button
- A CSV file should download to your computer

**Expected result**: 
- The downloaded CSV file should contain:
  - Header section with app name, session start, and summary statistics
  - Pages Visited section with page paths and timestamps
  - Page Visits with Time Spent section (includes formatted time)
  - Tracked Actions section with all user actions
- The file should be readable in Excel, Google Sheets, or any CSV viewer

#### PDF Export:
- Navigate to the Journey Viewer page (`/journey`)
- Click the "Export PDF" button
- A PDF file should download to your computer

**Expected result**: 
- The downloaded PDF should contain:
  - Title: "User Journey Report"
  - App information (name, session start, totals)
  - Formatted tables for:
    - Pages Visited (with timestamps)
    - Page Visits with Time Spent
    - Tracked Actions
  - Professional formatting with colored headers
  - Automatic page breaks for long content

### 7. Clear Journey Data

**What it does**: Clears all tracked journey data.

**How to test**:
- Navigate to Journey Viewer
- Verify you have some journey data
- Click the "Clear Journey" button
- Confirm the action

**Expected result**: 
- All journey data should be cleared
- The viewer should show "No journey data available"

### 8. Real-time Updates

**What it does**: Journey Viewer automatically refreshes every 2 seconds to show latest data.

**How to test**:
- Open Journey Viewer in one tab
- In another tab, navigate to different pages or click buttons
- Watch the Journey Viewer tab

**Expected result**: 
- Data should update automatically without manual refresh
- New pages and actions should appear in real-time

## 🎯 Testing Checklist

Use this checklist to verify all functionalities:

- [ ] **Page Tracking**: Pages are automatically tracked when navigating
- [ ] **Action Tracking**: Button clicks and interactions are tracked
- [ ] **Time Tracking**: Time spent on pages is recorded
- [ ] **Persistence**: Data survives page refresh
- [ ] **Session**: Different tabs have separate journeys
- [ ] **Export JSON**: Can export journey data as JSON
- [ ] **Export CSV**: Can export journey data as CSV
- [ ] **Export PDF**: Can export journey data as PDF
- [ ] **Clear**: Can clear all journey data
- [ ] **Real-time**: Journey Viewer updates automatically
- [ ] **Navigation Tracking**: Navigation clicks are tracked as actions
- [ ] **Form Interactions**: Form field interactions are tracked

## 🔍 Debugging Tips

1. **Check Browser Console**: The package may log warnings if something goes wrong
2. **Check localStorage/sessionStorage**: 
   - Open DevTools → Application → Storage
   - Look for `user-journey-tracker` key
3. **Verify Provider Setup**: Make sure `JourneyProvider` wraps your app in `layout.tsx`
4. **Check devOnly Mode**: If `devOnly={true}`, tracking only works in development mode

## 📊 Example Test Flow

1. Start at Home page
2. Click "Get Started" button (tracks action)
3. Navigate to About page (tracks page)
4. Click "Read More" button (tracks action)
5. Navigate to Products page (tracks page)
6. Click "Add to Cart" on Product A (tracks action)
7. Navigate to Contact page (tracks page)
8. Fill out form fields (tracks actions)
9. Submit form (tracks action)
10. Navigate to Journey Viewer (tracks page)
11. Review all tracked data
12. Export JSON file - verify it downloads correctly
13. Export CSV file - verify it downloads and opens in Excel/Sheets
14. Export PDF file - verify it downloads and displays correctly
15. Refresh page - data should persist
16. Clear journey - data should be cleared

## ⚙️ Configuration

The package is configured in `app/layout.tsx` with these options:

```tsx
<JourneyProvider 
  appName="Demo User Journey App"  // Custom app name
  devOnly={true}                    // Only track in development
  persist={true}                    // Save to localStorage
  session={true}                    // Use sessionStorage
>
```

You can modify these settings to test different configurations:
- Set `persist={false}` to disable persistence
- Set `session={false}` to disable session tracking
- Set `devOnly={false}` to track in production mode

