# InterViewPoint

InterViewPoint is a comprehensive, client-side React application designed to streamline the process of interviewing candidates for software development roles (specifically tailored for Full Stack Developer internships, but fully customizable).

It allows interviewers to design structured interview templates, categorize questions, conduct interviews with real-time scoring, and analyze results through detailed statistics.

## Features

### 📝 Template Management
*   **Create & Edit**: Design interview templates with custom categories and questions.
*   **Question Types**: Support for **Direct** (Right/Wrong) and **Indirect** (Subjective rating) questions.
*   **Weighting**: Assign multipliers to questions to value certain answers more than others.
*   **Ordering**: Drag-and-drop or use directional controls to reorder categories and questions.

### 🎯 Interview Execution
*   **Real-time Scoring**: Rate candidates during the interview.
*   **Feedback System**:
    *   Standard feedbacks (Correct, Wrong, Excellent, Good, etc.).
    *   **Custom Feedback**: Add unique scoring options per question on the fly.
*   **Notes**: Add summary notes for the candidate.
*   **Visual Feedback**: Progress bars and color-coded score indicators.

### 📊 Analytics & Statistics
*   **Global Dashboard**: View statistics across all conducted interviews.
*   **Leaderboard**: Rank candidates by percentage score.
*   **Skill Matrix Heatmap**: Visualize candidate strengths and weaknesses across different categories (e.g., Frontend vs. Backend).
*   **Score Distribution**: Analyze the difficulty of your questions using scatter plots and histograms.

### ⚙️ Configuration & Data Portability
*   **Import/Export**: detailed YAML support for sharing templates and interview results.
*   **Global Settings**: Customize the default score values for standard feedback labels (e.g., how many points "Tried but failed" is worth).
*   **Offline First**: All data is persisted locally in the browser (`localStorage`).

## Tech Stack

*   **Framework**: React 19
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Visualization**: Recharts
*   **Data Handling**: JS-YAML

## How to Run

This project is a standard React application. No API key is required as it runs entirely on the client side.

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm start
    # or
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## Usage Guide

1.  **Create a Template**: Start by creating a template in the sidebar. Add categories (e.g., "React", "Node.js") and questions.
2.  **Conduct Interview**: Click "Start Interview" on a template or select an existing template from the sidebar to start a new session. Enter the candidate's name.
3.  **Score**: Click on questions to open the feedback modal and select a rating.
4.  **Finish**: Click "Finish & Save" to store the result.
5.  **Analyze**: Go to the **Statistics** tab to see how candidates compare.
