# InterViewPoint Project Analysis

## Project Overview

**InterViewPoint** is a client-side React application designed to facilitate structured technical interviews. It enables interviewers to create custom templates, conduct interviews with real-time scoring, and analyze results. The application is built with a focus on data portability (YAML import/export) and offline capability (Local Storage).

## Tech Stack

*   **Core:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS, `lucide-react` (Icons), `clsx`/`tailwind-merge`
*   **Visualization:** Recharts
*   **Data Handling:** `js-yaml` (YAML parsing/dumping)
*   **Persistence:** Browser Local Storage

## Building and Running

The project uses standard Node.js and Vite workflows.

### Prerequisites
*   Node.js (v18+ recommended)
*   npm

### Commands

*   **Install Dependencies:**
    ```bash
    npm install
    ```

*   **Start Development Server:**
    ```bash
    npm run dev
    ```
    Runs the app in development mode, typically at `http://localhost:5173`.

*   **Build for Production:**
    ```bash
    npm run build
    ```
    Compiles TypeScript and bundles the application to the `dist` directory.

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```

## Architecture & Codebase Structure

The application follows a **Single Page Application (SPA)** architecture but does **not** use a client-side router (like `react-router`). Instead, it manages "screens" via a local `viewMode` state in the root component.

### Key Files

*   **`App.tsx`**: The main controller. It handles:
    *   **Global State**: `templates`, `results`, `settings`, `viewMode`.
    *   **Persistence**: Syncs state to `localStorage` (`ivp_templates`, `ivp_results`, `ivp_settings`).
    *   **Routing Logic**: Renders the appropriate component based on `viewMode` ('EDITOR', 'EXECUTION', 'DASHBOARD', etc.).
*   **`types.ts`**: Contains all TypeScript definitions. Key interfaces:
    *   `InterviewTemplate`: Structure for categories and questions.
    *   `InterviewResult`: Stores actual interview data including scores and notes.
    *   `Question`: Defines question text, type (DIRECT/INDIRECT), multiplier, and optional custom feedback.
*   **`utils.ts`**: Helper functions for ID generation, YAML processing, and file downloads.
*   **`constants.ts`**: Default configurations and initial data.

### Component Structure (`components/`)

*   **`Sidebar.tsx`**: Navigation menu. Handles template selection, creation, import/export actions.
*   **`InterviewEditor.tsx`**: Interface for creating and modifying interview templates (drag-and-drop ordering, form inputs).
*   **`InterviewExecution.tsx`**: The "Run Mode". Displays questions, allows scoring (Feedback modal), and saves results.
*   **`SettingsEditor.tsx`**: Form to configure global scoring values (e.g., how many points "Good" is worth).
*   **`GlobalStatistics.tsx`**: Dashboard for visualizing interview data using charts.

## Data Flow

1.  **State Source**: All data lives in `App.tsx` state.
2.  **Updates**: Functions to modify state (e.g., `handleCreateTemplate`, `handleSaveResult`) are passed down as props to child components.
3.  **Persistence**: `useEffect` hooks in `App.tsx` listen for state changes and write to `localStorage`.

## Development Conventions

*   **Styling**: Utility-first CSS using Tailwind.
*   **Icons**: Used from `lucide-react`.
*   **Type Safety**: Strict TypeScript usage. All data objects are typed in `types.ts`.
*   **Immutability**: State updates follow immutable patterns (creating new arrays/objects instead of mutating).

## Key Features Logic

*   **Scoring**:
    *   **Direct Questions**: Binary or ternary outcomes (Correct, Wrong, Tried).
    *   **Indirect Questions**: Subjective scale (Excellent, Good, Bad).
    *   **Custom Feedback**: Questions can have specific custom answers defined in the template.
*   **Import/Export**: Data is serialized to YAML. `App.tsx` handles the logic to distinguish between a Template import and a Result import based on object shape.
