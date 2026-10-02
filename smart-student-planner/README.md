# Smart Student Planner

**A User-Friendly Academic Task Management Application**

> UID (User Interface Design) Project | Frontend-Only Web Application

---

## Project Overview

Smart Student Planner is a complete, responsive web application designed to help college students organize their academic life. It provides a professional, modern interface for managing daily tasks, class timetables, assignments, exam schedules, and study progress — all stored locally in the browser.

The application is built entirely with HTML5, CSS3, and Vanilla JavaScript. It requires no internet connection (after initial asset download) and no server-side components.

---

## Problem Statement

College students often struggle with:
- Keeping track of multiple assignments across different subjects
- Managing exam dates and preparation schedules
- Maintaining a structured study timetable
- Monitoring their own academic progress
- Losing track of deadlines and priority tasks

Existing tools (Google Calendar, Notion, etc.) are either too complex or too generic for student-specific academic workflows.

---

## Objectives

1. Build a clean, professional-grade UI suitable for academic use
2. Implement all core academic planning features in one application
3. Ensure data persists locally without requiring any backend
4. Apply UID principles to create an accessible, intuitive experience
5. Make the app fully responsive for all device sizes

---

## Features

### Authentication
- User registration and login with LocalStorage
- Built-in demo account (`demo@student.com` / `demo1234`)
- Form validation with real-time error messages
- Password strength indicator on registration
- Show/hide password toggle
- Secure logout with confirmation

### Dashboard
- Personalized greeting with current date and time of day
- 5 summary stat cards: Total Tasks, Completed, Pending, Assignments, Upcoming Exams
- Task and assignment completion progress bars
- Weekly productivity bar chart (from actual completed tasks)
- Upcoming assignments with due-date urgency indicators
- Upcoming exams list
- Today's tasks by due date
- Quick action buttons to jump to other sections

### To-Do List
- Add, edit, delete tasks
- Mark tasks as completed (with visual strikethrough)
- Set priority: High, Medium, Low (color-coded badges)
- Set due date with overdue detection
- Add optional description
- Search tasks by title or description
- Filter: All / Pending / Completed
- Sort by: Due Date / Priority / Newest
- Empty states with contextual messages

### Study Timetable
- Visual weekly grid (Monday–Sunday)
- Add/edit/delete class slots
- Set subject, day, start/end time, room/location
- 8 color themes for subject differentiation
- Current day highlighted
- Quick "+" add button per day column
- Sortable list view of all entries
- Time conflict check (end > start)

### Assignment Tracker
- Add, edit, delete assignments
- Fields: Subject, Title, Description, Deadline, Priority
- Mark as completed (with undo option)
- Overdue detection with red left-border indicator
- Due-soon highlighting (within 3 days, orange border)
- Filter tabs: All / Pending / Overdue / Completed
- Smart sorting: Overdue first, then by deadline
- Stats mini-cards for Total / Pending / Overdue / Completed

### Exam Calendar
- Full monthly calendar view
- Navigation: previous/next month
- Click any date to add an exam
- Exams shown as dots/labels on calendar dates
- Today's date highlighted
- Upcoming exams sidebar with days-remaining badges
- Full exam list below calendar
- Past exams shown with reduced opacity
- Add, edit, delete exam events

### Study Progress
- Overall task completion rate with progress bar
- Assignment completion rate with progress bar
- Priority breakdown bar chart for pending tasks
- Weekly productivity bar chart
- Subject-wise progress bars (from assignment data)
- Schedule summary (sessions per subject per week)
- Overdue assignment warning alert
- All statistics derived from real user data

### Profile & Settings
- View and edit full name and email
- Change password with verification
- Profile avatar with initials
- Dark mode toggle (persisted in LocalStorage)
- Reload sample data option
- Clear all application data (with confirmation)
- Logout button
- App version info

---

## Technologies Used

| Technology | Purpose |
|-----------|---------|
| HTML5 | Page structure and semantics |
| CSS3 | Styling, animations, responsive layout |
| Vanilla JavaScript (ES6+) | All logic, DOM manipulation |
| LocalStorage API | Data persistence |
| CSS Custom Properties | Design token system / theming |
| CSS Grid & Flexbox | Responsive layouts |
| Font Awesome 6.5 | Icons |
| Google Fonts (Inter, Poppins) | Typography |

**No frameworks, no build tools, no backend required.**

---

## UID Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **Consistency** | Unified design system via CSS variables, reusable card/button/badge components |
| **Visibility of System Status** | Toast notifications for all actions, loading states, badge counters |
| **Feedback** | Success/error toasts after every operation, real-time form validation |
| **Error Prevention** | Form validation before submission, confirmation dialogs before deletion |
| **User Control** | Undo complete for assignments, cancel for all modals |
| **Recognition over Recall** | Clear labels, icons alongside text, active page highlighting |
| **Aesthetic & Minimalist Design** | Clean cards, purposeful whitespace, no decorative clutter |
| **Help Users with Errors** | Inline error messages with specific guidance |
| **Accessibility** | ARIA labels, roles, focus management, keyboard navigation, focus-visible outlines |
| **Responsive Design** | Mobile sidebar, adaptive grids, fluid layouts at all breakpoints |

---

## Project Folder Structure

```
smart-student-planner/
├── index.html              # Main application shell (SPA)
├── login.html              # Login page
├── register.html           # Registration page
├── README.md               # This file
│
├── css/
│   ├── style.css           # Main design system (~2100 lines)
│   └── responsive.css      # Media queries for all breakpoints
│
├── js/
│   ├── storage.js          # LocalStorage abstraction layer
│   ├── app.js              # Shared utilities, init, navigation
│   ├── auth.js             # Login / registration logic
│   ├── dashboard.js        # Dashboard section
│   ├── tasks.js            # To-Do List section
│   ├── timetable.js        # Study Timetable section
│   ├── assignments.js      # Assignment Tracker section
│   ├── calendar.js         # Exam Calendar section
│   ├── progress.js         # Progress Tracker section
│   └── settings.js         # Profile & Settings section
│
└── assets/
    └── images/             # (Reserved for future images)
```

---

## Installation & Setup

No installation required. The project runs directly in any modern web browser.

### Prerequisites
- A modern web browser: Chrome, Firefox, Edge, or Safari
- An internet connection for the first load (to download Google Fonts and Font Awesome from CDN)
- After that, the app works fully offline

---

## How to Run

### Option 1 – VS Code Live Server (Recommended)

1. Open the `smart-student-planner` folder in VS Code
2. Install the **Live Server** extension by Ritwick Dey (if not already installed)
3. Right-click `index.html` and select **"Open with Live Server"**
4. The app opens at `http://127.0.0.1:5500/` (or similar)

### Option 2 – Python HTTP Server

```bash
# Navigate to the project folder
cd smart-student-planner

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open `http://localhost:8080` in your browser.

### Option 3 – Node.js (npx serve)

```bash
cd smart-student-planner
npx serve .
```

### Option 4 – Direct File Open

Simply double-click `login.html` or `index.html` to open directly.

> **Note:** Opening via `file://` protocol may restrict LocalStorage in some browsers. Use a local server for best results.

---

## Using the Application

1. Open the app in your browser
2. On the login page, click **"Use Demo Account"** to auto-fill the demo credentials
3. Click **Sign In** to enter the application
4. Sample data (tasks, assignments, timetable, exams) loads automatically on first launch
5. Navigate using the sidebar or quick action buttons on the dashboard

### Demo Credentials
- **Email:** `demo@student.com`
- **Password:** `demo1234`

---

## Application Page Descriptions

| Page | Route / Section | Description |
|------|----------------|-------------|
| Login | `login.html` | Email/password login with demo account shortcut |
| Register | `register.html` | New account creation with validation |
| Dashboard | `#dashboard` | Overview stats, charts, quick actions |
| My Tasks | `#tasks` | Full to-do list with search/filter/sort |
| Timetable | `#timetable` | Weekly class schedule grid |
| Assignments | `#assignments` | Assignment tracker with deadline urgency |
| Exam Calendar | `#calendar` | Monthly calendar with exam events |
| Study Progress | `#progress` | Progress charts and statistics |
| Profile & Settings | `#settings` | Account management and preferences |

---

## Testing Details

### Static Analysis Performed
- All HTML files validated for proper structure (doctype, head, body, meta tags)
- All forms include `novalidate` with JS-driven validation
- All buttons and interactive elements are functional (no dead buttons)
- ARIA labels and roles applied to interactive elements
- All JS modules verified for syntax errors (balanced braces, parentheses, template literals)
- LocalStorage operations fully abstracted through `Storage` module — no raw `localStorage` calls outside `storage.js`
- All Storage API calls cross-referenced against public API (all valid)
- All modal IDs cross-referenced — every `Modal.open/close` call matches a rendered element
- All Font Awesome icons verified against FA6 Free icon set
- No console.log statements left in production code
- Script load order verified: `storage.js` → `app.js` → feature modules → event listener → `initApp()`

### Bugs Fixed During Review

| Bug | File | Fix Applied |
|-----|------|-------------|
| `sectionActivated` event fired before listener registered | `index.html` | Moved section init and listener registration before `initApp()` |
| Duplicate `id: generateId()` in object literal | `storage.js` | Refactored to use single `newId` variable |
| `Storage.saveSettings({ sampleReloaded: true })` — wrong key | `settings.js` | Replaced with `Storage.resetSampleFlag()` |
| `localStorage.removeItem('ssp_sample_loaded')` bypassing abstraction | `settings.js` | Removed; `Storage.resetSampleFlag()` now handles this |
| `resetSampleFlag()` missing from Storage public API | `storage.js` | Added `resetSampleFlag()` function and exported it |
| `fa-file-check` — not in FA6 Free | `progress.js` | Replaced with `fa-clipboard-check` |
| `fa-file-plus` — not in FA6 Free | `dashboard.js` | Replaced with `fa-file-circle-plus` |
| `fa-check-circle` — deprecated in FA6 solid | `register.html` | Replaced with `fa-circle-check` |
| Logout button in settings double-bound | `settings.js` | Replaced class-based re-binding with `onclick="confirmLogout()"` |
| Calendar sidebar column `320px` fixed width breaks tablet | `calendar.js` + `responsive.css` | Added `.calendar-layout` class with responsive `grid-template-columns: 1fr` at ≤768px |


### Functional Tests (Manual)

| Test | Expected | Status |
|------|----------|--------|
| Login with demo account | Redirects to dashboard | ✅ |
| Register new account | Creates user, auto-login | ✅ |
| Login with wrong password | Shows error message | ✅ |
| Add task | Task appears in list | ✅ |
| Edit task | Changes saved | ✅ |
| Delete task | Confirmation → removed | ✅ |
| Mark task complete | Strikethrough + badge update | ✅ |
| Filter tasks | Correct subset shown | ✅ |
| Search tasks | Matching tasks shown | ✅ |
| Add timetable entry | Appears in grid | ✅ |
| Add assignment | Appears in list | ✅ |
| Overdue assignment detection | Red border + badge | ✅ |
| Add exam | Shows on calendar | ✅ |
| Calendar month navigation | Correct dates shown | ✅ |
| Progress stats | Match actual data | ✅ |
| Dark mode toggle | Theme switches | ✅ |
| Clear all data | Confirmation → data removed | ✅ |
| Edit profile | Sidebar name updates | ✅ |
| Change password | Old password verified | ✅ |
| Logout | Returns to login page | ✅ |
| Refresh browser | Data persists | ✅ |
| Mobile layout | Sidebar hidden, hamburger shown | ✅ |

### Limitations

- Authentication uses LocalStorage (not cryptographically secure). This is appropriate for a frontend-only demo but must not be used for production.
- Passwords are stored in plain text in LocalStorage — intentional limitation for a demo project.
- No data synchronization between devices or browsers.
- Charts are custom bar charts built with HTML/CSS (not Chart.js), which are functional but less sophisticated than dedicated charting libraries.
- Calendar shows one event label per day on small screens.
- No offline service worker (PWA) caching implemented.

---

## Future Enhancements

1. **Cloud Sync** – Integrate with Firebase or Supabase for cross-device data
2. **Push Notifications** – Browser notifications for approaching deadlines
3. **Chart.js Integration** – Professional interactive charts for progress tracking
4. **Pomodoro Timer** – Built-in study session timer
5. **File Attachments** – Attach PDFs or images to assignments
6. **Export/Import** – JSON export and import for data backup
7. **Recurring Tasks** – Support for repeating weekly tasks
8. **PWA Support** – Service worker for full offline capability
9. **Collaboration** – Share timetable or assignments with classmates
10. **Grade Tracker** – Subject-wise grade and GPA calculation

---

## Author

UID Project — Smart Student Planner  
Built with HTML5, CSS3, and Vanilla JavaScript  
No frameworks. No backend. Just clean frontend development.

---

*This project was created as a User Interface Design (UID) college project to demonstrate modern UI/UX principles, responsive design, and functional frontend development.*
