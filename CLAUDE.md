# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Treehouse Pediatric is a React Native application built with Expo for pediatric occupational therapy activity planning. The app helps therapists create visual schedules and choice boards for children by selecting from categorized activities (Gross Motor, Fine Motor, ADL, Sensory, etc.).

## Development Commands

### Running the Application
- `npm start` - Start the Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator
- `npm run web` - Start on web browser

## Architecture

### Navigation Structure
The app uses React Navigation with a native stack navigator (`@react-navigation/native-stack`). Main entry point is `App.js` which defines:
- **Homescreen**: Grid of 8 activity category buttons
- **Activity Screens**: Individual screens for each category (GrossMotorScreen, FineMotorScreen, ADLScreen, etc.)
- **Schedule**: Displays selected activities with notes in sequential order
- **ChoiceBoard**: Visual choice board with up to 3 selected activities
- **NotesModal**: Modal for adding notes (presentation: 'modal')

All screens are registered in App.js:143-186.

### Activity Selection Pattern
Each activity screen (e.g., ADLScreen.js) follows this pattern:
1. Uses static `require()` for images (React Native bundler requirement)
2. Stores activity IDs as relative path strings (e.g., '../assets/ADL/button.png')
3. Loads saved activities from AsyncStorage on mount via `GetActivities()`
4. Toggles selection by calling `toggleSelection()` which updates AsyncStorage
5. Selection state determines visual styling (selected activities have different background color)

### Data Persistence (ActivitiesSaver.js)
Activities are stored in AsyncStorage under key 'SavedActivities' as an array of objects:
```javascript
[
  { filePath: '../assets/ADL/button.png', notes: 'practice for 5 min' },
  { filePath: '../assets/FineMotorPictures/cutting.png', notes: '' }
]
```

Key functions:
- `SaveActivities(array)` - Overwrites entire array
- `GetActivities()` - Returns full array or []
- `clearData()` - Clears all AsyncStorage (called on window.beforeunload in App.js:33-40)

### Icon Registry Pattern
Schedule.js and ChoiceBoard.js maintain a large ICONS object (lines 21-97) that maps activity ID strings to static require() calls. This is necessary because React Native cannot use dynamic require() paths.

**IMPORTANT**: When adding new activity icons, you must:
1. Add the static require() to the ICONS object in both Schedule.js and ChoiceBoard.js
2. Use the same string key as the activity ID used in the activity screen

### Bottom Navigation (NavigationOptions.js)
Persistent bottom navigation bar rendered on all screens with:
- Back button (navigation.goBack())
- Home button (navigate to 'Home')
- Schedule button (navigate to 'Schedule')
- Choice Board button (navigate to 'ChoiceBoard')

The bar is positioned absolutely at bottom: 0 with white background.

### Choice Board Functionality
ChoiceBoard.js enforces a 3-activity maximum for the choice board display:
- Users tap activity icons to toggle selection
- `toggleSelection()` prevents adding more than 3 items (ChoiceBoard.js:121-134)
- Selected items are displayed in a horizontal FlatList at top of screen
- Visual feedback: selected items have backgroundColor 'rgb(211,211,211)' vs normal 'rgb(218, 188, 188)'

### PDF Export (PDFSaver.js)
Uses jsPDF library to create simple text PDFs. Currently basic implementation with text only at (10, 10) position. The createPDF function is called from Schedule.js header buttons.

## File Organization

- `/screens/` - All screen components (activity categories, Schedule, ChoiceBoard, NotesModal)
- `/assets/` - Organized by category (ADL/, FineMotorPictures/, Regulation/, RoomSpacesPictures/, Sensory/, TOYS/)
- Root level - App.js, ActivitiesSaver.js, PDFSaver.js, Logo.png

## Key Technical Constraints

1. **React Native Bundler**: Cannot use dynamic require() for images. All image imports must be static `require()` calls known at build time.

2. **AsyncStorage Keys**: All AsyncStorage operations use string keys. The saved activities structure is `{ filePath: string, notes: string }[]`.

3. **Icon Path Consistency**: Activity IDs (file paths) must exactly match between:
   - Activity screen definitions (e.g., ADLScreen.js:22-28)
   - ICONS registry in Schedule.js and ChoiceBoard.js
   - Saved data in AsyncStorage

4. **Web-Specific Code**: App.js uses window.addEventListener('beforeunload') which only works on web platform (App.js:33-40).

## Current Branch Context

Working on `choice_board` branch (main branch: `master`). Recent commits show work on choice board functionality with 3-activity limit and scrollable icon selector.
