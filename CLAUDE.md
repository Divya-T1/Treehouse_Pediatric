# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Treehouse Pediatric is a React Native application built with Expo for pediatric therapy activity planning. The app helps therapists create visual schedules and choice boards for children by selecting from categorized activities (ADL, Fine Motor, Gross Motor, Sensory, etc.). Therapists can also create custom categories and activities with their own photos, and share custom activities with other therapists via share codes.

## Development Commands

### Running the Application
- `npm start` - Start the Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator
- `npm run web` - Start on web browser

## Architecture

### Navigation Structure
The app uses React Navigation with a native stack navigator (`@react-navigation/native-stack`). Main entry point is `App.js` which defines:
- **Home** (`Homescreen` in App.js): Grid of category buttons + search bar + "Add Category" button + `⋮` dropdown menu
- **CustomCategory**: Generic `CategoryScreen.js` — handles both built-in and custom categories
- **Schedule**: Displays selected activities with inline notes and print/save buttons
- **ChoiceBoard**: Separate choice board with up to 3 selected activities
- **Notes**: Modal for adding notes (presentation: 'modal')

All screens are registered in `App.js` (Stack.Navigator). The old individual activity screens (`ADLscreen.js`, `FineMotorScreen.js`, `GrossMotorScreen.js`, etc.) still exist in `/screens/` but are **no longer registered in the navigator** — they are dead code. Use `CategoryScreen.js` as the reference for how screens work.

### Built-in Activities Registry (activities.js)
All built-in categories and activities are defined in `activities.js` as `DEFAULT_ACTIVITIES`. Each entry has:
```javascript
{
  categoryName: 'ADL',
  icon: require('./Brushing.png'),     // category icon shown on Homescreen
  activities: [
    { id: '../assets/ADL/button.png', name: 'Buttons', icon: require('./assets/ADL/button.png') },
    ...
  ]
}
```

On app load, `App.js` calls `AddCategory()` for each `DEFAULT_ACTIVITIES` entry to seed them into storage (prevents duplicates via name check). Built-in categories are treated the same as custom ones after seeding.

### Activity Data Model
Activities stored in storage are objects with this shape:
```javascript
{
  id: string,          // unique ID — for built-ins this is the asset path string, for custom it's the base64/URI icon
  name: string,        // display name
  icon: require(...) | string,  // static require result (built-in) or URI/base64 string (custom)
  category: string,    // category name
  notes: string,       // therapist notes
}
```

### Custom Category System
Therapists can create custom categories with a name and a photo (picked from device library):
- `Homescreen` in `App.js`: "Add Category" button opens a modal → calls `AddCategory(name, icon)` → stored in `CustomCategories` key
- `CategoryScreen.js`: "Add Activity" button opens a modal → calls `SaveCustomCategories()` directly after pushing to the category's activities array
- Images use base64 data URIs on web, file URIs on native

### Data Persistence (ActivitiesSaver.js)
Storage is platform-specific — `ActivitiesSaver.js` imports from `./storage`, which resolves to:
- `storage.web.js` → uses **localforage** (IndexedDB, avoids localStorage size limits)
- `storage.native.js` → re-exports `@react-native-async-storage/async-storage`

Storage keys and their contents:

| Key | Content |
|-----|---------|
| `'SavedActivities'` | `Activity[]` — current schedule |
| `'CustomCategories'` | `Category[]` — all categories (built-in + custom) |
| `'ChoiceBoard'` | `Activity[]` — choice board selection (max 3) |

Key functions exported from `ActivitiesSaver.js`:
- `SaveActivities(array)` / `GetActivities()` — schedule CRUD
- `SaveCustomCategories(array)` / `GetCustomCategories()` — full category list CRUD
- `AddCategory(name, icon, activities?)` — adds category if name not already present (no-op if duplicate)
- `AddActivityToCategory(categoryName, activity)` — appends activity to existing category
- `SaveChoiceBoard(array)` / `GetChoiceBoard()` — choice board CRUD
- `clearData()` — clears all storage
- `clearActivities()` — clears storage then restores custom categories (called on web `pagehide`)

### CategoryScreen.js (Generic Activity Screen)
`screens/CategoryScreen.js` handles all categories uniformly:
1. Loads category activities from `GetCustomCategories()` by matching `categoryName` from route params
2. Loads current selection via `GetActivities()` — tracks selected IDs in `selectedActivities` state
3. `toggleSelection(act)` adds/removes from `SavedActivities`
4. In share mode (see below), tapping a custom activity toggles its share selection instead
5. Users can add new activities via a modal (picks image → stores base64/URI)
6. Selected activities have `backgroundColor: 'rgb(195, 229, 236)'` vs normal `'rgb(211,211,211)'`

### Schedule.js
- Loads and refreshes activities from `GetActivities()` via `useFocusEffect`
- Renders a `FlatList` with inline `TextInput` for notes per activity
- Header has Save and Print buttons; Print calls `createPDF()` from `PDFSaver`
- Icons rendered as: `typeof item.icon === "string" ? { uri: item.icon } : item.icon`

### ChoiceBoard.js
- Maintains two lists: `activities` (all schedule activities) and `choiceBoardActivities` (up to 3 selected)
- Both loaded on mount and refreshed on focus via `useFocusEffect`
- `toggleSelection()` enforces 3-item max — shows `Alert` if exceeded
- Header has Save and Print buttons; Print calls `createChoiceBoardPDF()`
- Uses a horizontal `FlatList` to display the selected choice board items

### PDF Export (platform-specific)
`PDFSaver.js` is a fallback stub. Metro resolves the platform-specific file first:
- `PDFSaver.web.js` — full implementation using **jsPDF v4.2.1**, renders icons as base64 images, shares via `navigator.share` or falls back to `doc.save()`
- `PDFSaver.native.js` — native implementation (expo-print / expo-sharing)

Exports: `createPDF()` (Schedule) and `createChoiceBoardPDF()` (ChoiceBoard).

### Bottom Navigation (NavigationOptions.js)
Persistent bottom navigation bar rendered on all screens with:
- Back button (`navigation.goBack()`)
- Home button (navigate to `'Home'`)
- Schedule button (navigate to `'Schedule'`)
- Choice Board button (navigate to `'ChoiceBoard'`)

The bar is positioned absolutely at `bottom: 20` with white background.

**CRITICAL - Bottom Padding**: The nav bar overlays screen content. All screens with scrollable content (ScrollView or FlatList) MUST include bottom padding:
```javascript
// ScrollView
<ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

// FlatList
<FlatList contentContainerStyle={data.length === 0 ? { flex: 1, justifyContent: 'center', paddingBottom: 100 } : { paddingBottom: 100 }} />
```

### Homescreen Header & Dropdown Menu
The Homescreen header contains the logo (left) and a `⋮` menu button (right). Tapping `⋮` opens a dropdown with:
- **Share Activities** — enters share mode
- **Import from Code** — opens the import modal
- **Sign Out**
- **Clear All Data** — destructive, shown in red

In **share mode**, the `⋮` button is replaced by **Cancel** and **Share (N)** buttons. A blue banner appears on both the Homescreen and CategoryScreen explaining the mode. Errors from share creation (payload too large, network failure) appear as red text inside the banner — do **not** use `Alert.alert` for these, it is unreliable on web.

### Homescreen Search
The Homescreen has a search bar that filters across all activities in `customCategories` (which includes built-ins after seeding). Tapping a search result navigates to the `'CustomCategory'` screen for that activity's category.

### Authentication (AuthContext.js, AuthScreen.js, supabase.js)
- `@supabase/supabase-js` handles auth. `AuthContext.js` exposes `session`, `user`, `loading`, `signIn`, `signUp`, `signOut` via `useAuth()`.
- `RootNavigator` (inside `App.js`) gates on `loading` and `session`: shows nothing while loading, `AuthScreen` when logged out, the main stack when logged in.
- On `SIGNED_IN`: `AuthContext` sets `loading=true`, calls `syncFromCloud()`, then releases — this blocks navigation until the user's cloud data is written to local storage.
- On `SIGNED_OUT`: `clearData()` wipes local storage so no data leaks to the next user.
- Auth tokens are persisted via AsyncStorage (native) or Supabase's default localStorage (web).

### Cloud Sync (cloudSync.js)
All Supabase data operations live in `cloudSync.js`. The app's `Get*` functions always read from local storage (fast, no network); `Save*` functions write to local storage first then fire a background push to Supabase.

**Supabase table**: `user_data` — one row per user, RLS-enforced.

| Column | Type | Content |
|--------|------|---------|
| `user_id` | uuid PK | references `auth.users` |
| `saved_activities` | jsonb | current schedule |
| `custom_categories` | jsonb | custom-only data (see below) |
| `choice_board` | jsonb | choice board selection |
| `updated_at` | timestamptz | last write |

**Built-in category icon problem**: Built-in category icons are `require()` results — not JSON-serializable for Supabase. `pushCategories` handles this by:
- Fully custom categories (string icon) → stored as-is
- Built-in categories with user-added activities → stored as `{ categoryName, icon: '__builtin__', activities: [custom activities only] }`
- Unmodified built-in categories → skipped (re-seeded from `DEFAULT_ACTIVITIES` on launch)

`syncFromCloud` reverses this on sign-in: it rebuilds the full category list in `DEFAULT_ACTIVITIES` order, merging `__builtin__` entries back with their correct icons and default activities, then appending fully custom categories. This ensures `AddCategory` seeding is always a no-op and display order is never scrambled.

**Known limitation**: Changes made while offline and not yet pushed to Supabase will be lost if the user signs out before regaining connectivity.

### Activity Sharing (ShareContext.js, cloudShare.js)
Therapists can share custom activities with each other via a one-time 8-character code.

**ShareContext.js** provides share mode state to all screens via `useShare()`:
- `isShareMode` — whether sharing mode is active
- `shareSelections` — array of activities selected for sharing (persists across navigation)
- `enterShareMode()` / `exitShareMode()` — toggle mode and clear selections
- `toggleShareSelection(activity)` — add/remove an activity from the pending share
- `isSelectedForShare(activityId)` — check if an activity is selected

`ShareProvider` wraps the `NavigationContainer` inside `RootNavigator` so it is available to all screens when logged in.

**cloudShare.js** handles the Supabase operations:
- `createShare(userId, activities)` — inserts into `shared_items`, returns an 8-char code. Uses characters that avoid visual ambiguity (no `0`, `O`, `I`, `1`). Retries up to 5 times on code collision. Throws `'payload_too_large'` if the JSON payload exceeds 2MB.
- `importShare(shareCode)` — fetches by code, enforces expiry server-side via `.gt('expires_at', now())`. Returns `null` if not found or expired.

**Supabase table**: `shared_items` — requires `shared_items_migration.sql` to be run once in the Supabase SQL editor.

| Column | Type | Content |
|--------|------|---------|
| `id` | uuid PK | auto-generated |
| `share_code` | text UNIQUE | 8-char alphanumeric code |
| `shared_by` | uuid | references `auth.users` |
| `item_type` | text | `'activities'` |
| `data` | jsonb | array of shared activity objects |
| `created_at` | timestamptz | creation time |
| `expires_at` | timestamptz | 24 hours after creation |

RLS: authenticated users can SELECT any row (code is the access control), INSERT only their own rows, DELETE only their own rows.

**Share flow in CategoryScreen**: In share mode, tapping a custom activity (string icon) calls `toggleShareSelection()` and shows a green checkmark badge on the activity circle. Built-in activities (non-string icon) are dimmed and non-interactive in share mode. The checkmark badge is positioned absolute top-right of the circle wrapper and is visually distinct from the blue schedule-selection background.

**Import flow**: The recipient enters a code in the Import modal. Activities are grouped by their `category` field and merged into existing categories (deduped by `id`) or used to create new ones (using the first activity's icon as the category icon).

### Analytics
- `@vercel/analytics` is rendered on web only (`Platform.OS === 'web'`)
- `useAppState.js` — custom hook for tracking app foreground/background state

## File Organization

```
/screens/
  CategoryScreen.js      ← generic category screen (active)
  Schedule.js            ← schedule screen (active)
  ChoiceBoard.js         ← choice board screen (active)
  NotesModal.js          ← notes modal (active)
  NavigationOptions.js   ← bottom nav bar (active)
  ADLscreen.js           ← dead code (not in navigator)
  ADLScreen.js           ← broken/incomplete file, NOT the same as ADLscreen.js — skip when committing
  FineMotorScreen.js     ← dead code
  GrossMotorScreen.js    ← dead code
  Regulation.js          ← dead code
  RoomSpacesScreen.js    ← dead code
  SensoryScreen.js       ← dead code
  ToyScreen.js           ← dead code
  ToysAndActScreen.js    ← dead code

/assets/                 ← organized by category (ADL/, FineMotorPictures/, etc.)
  dropdown/              ← icons for the ⋮ dropdown menu items

activities.js            ← DEFAULT_ACTIVITIES registry (all built-in categories + activities)
ActivitiesSaver.js       ← storage API (local read/write + fires background cloud push on every save)
cloudSync.js             ← Supabase data operations (pushActivities/Categories/ChoiceBoard, syncFromCloud)
cloudShare.js            ← Supabase sharing operations (createShare, importShare)
ShareContext.js          ← share mode context (isShareMode, shareSelections, useShare hook)
shared_items_migration.sql ← run once in Supabase SQL editor to create shared_items table + RLS
storage.web.js           ← localforage adapter (IndexedDB)
storage.native.js        ← AsyncStorage adapter
AuthContext.js           ← Supabase auth provider (session, signIn, signUp, signOut, cloud sync on SIGNED_IN)
supabase.js              ← Supabase client (platform-aware auth storage config)
PDFSaver.js              ← fallback stub
PDFSaver.web.js          ← jsPDF web implementation
PDFSaver.native.js       ← native PDF implementation
useAppState.js           ← app state hook
App.js                   ← root component, Homescreen, RootNavigator, stack navigator
```

## Key Technical Constraints

1. **React Native Bundler**: Cannot use dynamic `require()` for images. All built-in image imports must be static `require()` calls. Custom/user images use URI or base64 strings instead.

2. **No ICONS registry**: Schedule.js and ChoiceBoard.js do NOT maintain a separate icon lookup map. Icons are stored directly on each activity object. Render pattern: `typeof item.icon === "string" ? { uri: item.icon } : item.icon`.

3. **Adding new built-in activities**: Add entries to `activities.js` only. No changes needed in Schedule.js or ChoiceBoard.js.

4. **Category seeding**: Built-in categories are seeded into `CustomCategories` storage on app launch via `AddCategory()`. `AddCategory` is a no-op if the category name already exists, so it is safe to call on every launch. After `syncFromCloud` runs on sign-in, all built-ins are already in local storage in the correct order, so seeding is always a no-op at that point.

5. **Web session cleanup**: `clearActivities()` is called on the web `pagehide` event (App.js), which clears the schedule but preserves custom categories.

6. **Storage size**: Web storage uses IndexedDB via localforage to avoid the ~5MB localStorage limit (important for base64 image data from custom activities).

7. **Alert.alert is unreliable on web**: Do not use `Alert.alert` for errors that can occur on web (e.g. share creation failures). Use inline state to display errors in the UI instead.

8. **Share mode only applies to custom activities**: Only activities with string icons (`typeof act.icon === 'string'`) can be selected for sharing. Built-in activities have `require()` icon results and are non-interactive in share mode.
